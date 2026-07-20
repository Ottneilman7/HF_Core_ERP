import { useState } from "react";
import * as purchaseService from "../services/purchaseService";
import * as rawMaterialInventoryService from "../services/rawMaterialInventoryService";
import type { PurchaseOrderItem } from "../models/PurchaseOrder";
import { FormInput } from "../components/FormInput";
import { FormSelect } from "../components/FormSelect";
import { FormButton } from "../components/FormButton";
import { colors } from "../theme/colors";

/**
 * Página: Compras (Flujo 3)
 * Ruta: /purchases
 */
export default function PurchasesPage() {
  const [suppliers, setSuppliers] = useState(purchaseService.getSuppliers());
  const [orders, setOrders] = useState(purchaseService.getPurchaseOrders());
  const rawMaterials = rawMaterialInventoryService.getEffectiveRawMaterials();

  const [newSupplierName, setNewSupplierName] = useState("");

  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [selectedRawMaterialId, setSelectedRawMaterialId] = useState(rawMaterials[0]?.id ?? "");
  const [quantity, setQuantity] = useState<number>(0);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [draftItems, setDraftItems] = useState<PurchaseOrderItem[]>([]);

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
    if (!selectedRawMaterialId || quantity <= 0) return;
    setDraftItems([...draftItems, { rawMaterialId: selectedRawMaterialId, quantity, unitCost }]);
    setQuantity(0);
    setUnitCost(0);
  }

  function handleCreateOrder() {
    if (!selectedSupplierId || draftItems.length === 0) return;
    purchaseService.createPurchaseOrder(selectedSupplierId, draftItems);
    setDraftItems([]);
    refresh();
  }

  function handleReceive(orderId: string) {
    purchaseService.receivePurchaseOrder(orderId);
    refresh();
  }

  function rawMaterialName(id: string): string {
    return rawMaterials.find((rm) => rm.id === id)?.name ?? id;
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
        Proveedores, órdenes de compra y recepción — al recibir, el stock y el costo real de la materia
        prima se actualizan automáticamente.
      </p>

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
                  {rawMaterialName(item.rawMaterialId)} — {item.quantity} × ${item.unitCost}
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
                  {rawMaterialName(item.rawMaterialId)} — {item.quantity} × ${item.unitCost}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
