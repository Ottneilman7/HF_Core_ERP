import { useState, useEffect, useCallback } from "react";
import * as purchaseService from "../services/purchaseService";
import * as rawMaterialInventoryService from "../services/rawMaterialInventoryService";
import * as recipeStockService from "../services/recipeStockService";
import type { PurchaseOrderItem } from "../models/PurchaseOrder";
import type { RawMaterial } from "../models/RawMaterial";
import { FormInput } from "../components/FormInput";
import { FormSelect } from "../components/FormSelect";
import { FormButton } from "../components/FormButton";
import { colors } from "../theme/colors";

type ItemKind = "rawMaterial" | "semiFinished";

/**
 * Página: Compras (Flujo 3)
 * Ruta: /purchases
 *
 * BP-025: rawMaterialInventoryService ahora es Firestore (async) — el
 * catálogo de materia prima se carga con useEffect + estado de loading.
 * recipeStockService (semielaborados) sigue en localStorage por ahora
 * (se migra en BP-026), por eso sigue leyéndose de forma síncrona.
 */
export default function PurchasesPage() {
  const [suppliers, setSuppliers] = useState(purchaseService.getSuppliers());
  const [orders, setOrders] = useState(purchaseService.getPurchaseOrders());
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [loadingRawMaterials, setLoadingRawMaterials] = useState(true);
  const semiFinishedRecipes = recipeStockService
    .getEffectiveRecipes()
    .filter((r) => r.active && r.tracksInventory);

  const [newSupplierName, setNewSupplierName] = useState("");

  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [itemKind, setItemKind] = useState<ItemKind>("rawMaterial");
  const [selectedRawMaterialId, setSelectedRawMaterialId] = useState("");
  const [selectedRecipeId, setSelectedRecipeId] = useState(semiFinishedRecipes[0]?.id ?? "");
  const [quantity, setQuantity] = useState<number>(0);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [draftItems, setDraftItems] = useState<PurchaseOrderItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadRawMaterials = useCallback(async () => {
    setLoadingRawMaterials(true);
    const all = await rawMaterialInventoryService.getEffectiveRawMaterials();
    const active = all.filter((rm) => rm.active);
    setRawMaterials(active);
    setSelectedRawMaterialId((prev) => prev || active[0]?.id || "");
    setLoadingRawMaterials(false);
  }, []);

  useEffect(() => {
    loadRawMaterials();
  }, [loadRawMaterials]);

  function refresh() {
    setSuppliers(purchaseService.getSuppliers());
    setOrders(purchaseService.getPurchaseOrders());
  }

  function handleAddSupplier() {
    if (!newSupplierName.trim()) return;
    purchaseService.createSupplier(newSupplierName);
    setNewSupplierName("");
    refresh();
  }

  function handleAddItemToDraft() {
    if (quantity <= 0) return;
    if (itemKind === "rawMaterial") {
      if (!selectedRawMaterialId) return;
      setDraftItems([...draftItems, { rawMaterialId: selectedRawMaterialId, quantity, unitCost }]);
    } else {
      if (!selectedRecipeId) return;
      setDraftItems([...draftItems, { componentRecipeId: selectedRecipeId, quantity, unitCost }]);
    }
    setQuantity(0);
    setUnitCost(0);
  }

  function handleCreateOrder() {
    setError(null);
    if (!selectedSupplierId) {
      setError("Selecciona un proveedor antes de crear la orden.");
      return;
    }
    if (draftItems.length === 0) {
      setError("Agrega al menos un ítem antes de crear la orden.");
      return;
    }
    purchaseService.createPurchaseOrder(selectedSupplierId, draftItems);
    setDraftItems([]);
    refresh();
  }

  async function handleReceive(orderId: string) {
    setError(null);
    try {
      await purchaseService.receivePurchaseOrder(orderId);
      refresh();
      await loadRawMaterials(); // el stock recién recibido debe reflejarse de inmediato
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo recibir la orden.");
    }
  }

  function itemLabel(item: PurchaseOrderItem): string {
    if (item.rawMaterialId) {
      return rawMaterials.find((rm) => rm.id === item.rawMaterialId)?.name ?? item.rawMaterialId;
    }
    if (item.componentRecipeId) {
      const recipe = semiFinishedRecipes.find((r) => r.id === item.componentRecipeId);
      return `${recipe?.name ?? item.componentRecipeId} (semielaborado, comprado ya hecho)`;
    }
    return "Ítem desconocido";
  }

  function supplierName(id: string): string {
    return suppliers.find((s) => s.id === id)?.name ?? id;
  }

  const sectionStyle = {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "24px",
  };

  return (
    <div style={{ maxWidth: "720px" }}>
      <h1 style={{ color: colors.text }}>Compras</h1>
      <p style={{ color: colors.textMuted }}>
        Proveedores, órdenes de compra y recepción — al recibir, el stock real se actualiza automáticamente.
      </p>

      {error && (
        <p style={{ color: colors.danger, marginBottom: "16px" }}>⚠️ {error}</p>
      )}

      <section style={sectionStyle}>
        <h2 style={{ color: colors.text, marginTop: 0 }}>Proveedores</h2>
        {suppliers.length > 0 && (
          <ul style={{ color: colors.text, paddingLeft: "18px" }}>
            {suppliers.map((s) => (
              <li key={s.id}>{s.name}</li>
            ))}
          </ul>
        )}
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <FormInput
              label="Nuevo proveedor"
              placeholder="ej. Distribuidora El Trigal"
              value={newSupplierName}
              onChange={(e) => setNewSupplierName(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <FormButton type="button" variant="secondary" onClick={handleAddSupplier}>
              Agregar
            </FormButton>
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={{ color: colors.text, marginTop: 0 }}>Nueva orden de compra</h2>

        <FormSelect
          label="Proveedor"
          value={selectedSupplierId}
          onChange={(e) => setSelectedSupplierId(e.target.value)}
        >
          <option value="">Selecciona un proveedor</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </FormSelect>

        <FormSelect
          label="¿Qué estás comprando?"
          value={itemKind}
          onChange={(e) => setItemKind(e.target.value as ItemKind)}
        >
          <option value="rawMaterial">Materia prima</option>
          <option value="semiFinished">Semielaborado ya hecho (ej. emergencia)</option>
        </FormSelect>

        {itemKind === "rawMaterial" ? (
          loadingRawMaterials ? (
            <p style={{ color: colors.textMuted, fontSize: "13px" }}>Cargando materia prima...</p>
          ) : (
            <FormSelect
              label="Materia prima"
              value={selectedRawMaterialId}
              onChange={(e) => setSelectedRawMaterialId(e.target.value)}
            >
              {rawMaterials.map((rm) => (
                <option key={rm.id} value={rm.id}>
                  {rm.name} (stock actual: {rm.currentStock} {rm.unit})
                </option>
              ))}
            </FormSelect>
          )
        ) : (
          <>
            <FormSelect
              label="Semielaborado"
              value={selectedRecipeId}
              onChange={(e) => setSelectedRecipeId(e.target.value)}
            >
              {semiFinishedRecipes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} (stock actual: {r.currentStock ?? 0} {r.unit})
                </option>
              ))}
            </FormSelect>
            <p style={{ color: colors.warning, fontSize: "12px", marginTop: "-8px", marginBottom: "16px" }}>
              ⚠️ Uso excepcional: normalmente esto se fabrica en /production, no se compra.
            </p>
          </>
        )}

        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ flex: 1 }}>
            <FormInput
              label="Cantidad a pedir"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min={0}
            />
          </div>
          <div style={{ flex: 1 }}>
            <FormInput
              label="Costo unitario ($)"
              type="number"
              step="0.0001"
              value={unitCost}
              onChange={(e) => setUnitCost(Number(e.target.value))}
              min={0}
            />
          </div>
        </div>

        <FormButton type="button" variant="secondary" onClick={handleAddItemToDraft}>
          Agregar ítem a la orden
        </FormButton>

        {draftItems.length > 0 && (
          <div style={{ marginTop: "16px" }}>
            <p style={{ color: colors.textMuted, fontSize: "13px", marginBottom: "6px" }}>
              Ítems de esta orden (sin guardar todavía):
            </p>
            <ul style={{ color: colors.text, paddingLeft: "18px" }}>
              {draftItems.map((item, idx) => (
                <li key={idx}>
                  {itemLabel(item)} — {item.quantity} × ${item.unitCost}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: "12px" }}>
              <FormButton type="button" onClick={handleCreateOrder}>
                Crear orden de compra
              </FormButton>
            </div>
          </div>
        )}
      </section>

      <section style={sectionStyle}>
        <h2 style={{ color: colors.text, marginTop: 0 }}>Órdenes</h2>
        {orders.length === 0 && <p style={{ color: colors.textMuted }}>Todavía no hay órdenes registradas.</p>}
        {orders.map((order) => (
          <div
            key={order.id}
            style={{
              background: colors.card,
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "12px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong style={{ color: colors.text }}>{supplierName(order.supplierId)}</strong>
                <span
                  style={{
                    marginLeft: "10px",
                    fontSize: "12px",
                    color: order.status === "received" ? colors.primary : colors.warning,
                  }}
                >
                  {order.status === "received" ? "✅ Recibida" : "⏳ Pendiente"}
                </span>
              </div>
              {order.status === "ordered" && (
                <FormButton type="button" onClick={() => handleReceive(order.id)}>
                  Recibir
                </FormButton>
              )}
            </div>
            <ul style={{ color: colors.textMuted, fontSize: "13px", marginTop: "8px", paddingLeft: "18px" }}>
              {order.items.map((item, idx) => (
                <li key={idx}>
                  {itemLabel(item)} — {item.quantity} × ${item.unitCost}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}