// ProductionPage.tsx — BP-014. Ahora reporta al Centro de Decisiones
// (antes solo mostraba resultados locales, sin conectar con el contexto).

import { useState } from "react";
import Card from "../components/ui/Card";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { recipes } from "../data/recipes";
import { products } from "../data/products";
import { getEffectiveRawMaterials } from "../services/rawMaterialInventoryService";
import {
  calculateProductionNeeds,
  calculateMaxProducible,
  getShortages,
  getLowStockWarnings,
  ProductionCalculationError,
} from "../services/productionCalculatorService";
import type { ProductionNeed } from "../models/ProductionNeed";
import { getMaterialIcon } from "../utils/materialIcons";
import { useProductionAlerts } from "../contexts/ProductionAlertsContext";

function getProducibleLabel(recipeId: string): string {
  const recipe = recipes.find((r) => r.id === recipeId);
  if (!recipe) return recipeId;
  if (recipe.productId) {
    return products.find((p) => p.id === recipe.productId)?.name ?? recipe.code;
  }
  return recipe.name ?? recipe.code;
}

export default function ProductionPage() {
  const producibles = recipes.filter((r) => r.active);

  const [selectedId, setSelectedId] = useState<string>(producibles[0]?.id ?? "");
  const [quantity, setQuantity] = useState<number>(0);
  const [results, setResults] = useState<ProductionNeed[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { reportProductionNeeds } = useProductionAlerts();
  const selectedRecipe = recipes.find((r) => r.id === selectedId);

  function handleCalculate() {
    setError(null);
    setResults(null);
    if (!selectedRecipe) return;

    try {
      const rawMaterials = getEffectiveRawMaterials(); // ADR-005: incluye lo recibido en Compras
      const needs = calculateProductionNeeds(selectedRecipe, quantity, rawMaterials, recipes);
      setResults(needs);

      const shortages = getShortages(needs);
      const warnings = getLowStockWarnings(needs);
      const maxProducible = calculateMaxProducible(selectedRecipe, rawMaterials, recipes);

      reportProductionNeeds(
        selectedRecipe.id,
        getProducibleLabel(selectedRecipe.id),
        shortages,
        warnings,
        maxProducible,
        selectedRecipe.yieldUnit
      );
    } catch (err) {
      setError(err instanceof ProductionCalculationError ? err.message : "Error desconocido.");
    }
  }

  const showBatchHint = selectedRecipe && selectedRecipe.yieldQuantity !== 1 && quantity > 0;
  const batches = selectedRecipe ? quantity / selectedRecipe.yieldQuantity : 0;

  return (
    <div style={{ padding: "24px", maxWidth: "640px" }}>
      <h1 style={{ color: colors.primary, fontSize: typography.title, marginBottom: "16px" }}>
        Producción
      </h1>

      <Card>
        <h2 style={{ marginBottom: "12px" }}>¿Qué vas a producir hoy?</h2>

        <label style={{ display: "block", marginBottom: "12px" }}>
          Producto o semielaborado
          <select
            value={selectedId}
            onChange={(e) => { setSelectedId(e.target.value); setResults(null); }}
            style={{ display: "block", width: "100%", marginTop: "6px", padding: "10px", borderRadius: "6px", fontSize: "15px" }}
          >
            {producibles.map((r) => (
              <option key={r.id} value={r.id}>{getProducibleLabel(r.id)}</option>
            ))}
          </select>
        </label>

        <label style={{ display: "block", marginBottom: "12px" }}>
          Cantidad {selectedRecipe && `(${selectedRecipe.yieldUnit})`}
          <input
            type="number"
            min={0}
            value={quantity}
            onChange={(e) => { setQuantity(Number(e.target.value)); setResults(null); }}
            style={{ display: "block", width: "100%", marginTop: "6px", padding: "10px", borderRadius: "6px", fontSize: "16px", border: "1px solid #ccc" }}
          />
        </label>

        {showBatchHint && (
          <p style={{ color: colors.textMuted, fontSize: "13px", marginBottom: "12px" }}>
            ≈ {batches.toFixed(2)} lote(s) de {selectedRecipe!.yieldQuantity} {selectedRecipe!.yieldUnit}.
          </p>
        )}

        <button
          onClick={handleCalculate}
          style={{ padding: "8px 16px", fontSize: "14px", borderRadius: "6px", border: "none", background: "#2E7D32", color: "#fff", cursor: "pointer" }}
        >
          Calcular qué sacar de almacén
        </button>

        <p style={{ color: colors.textMuted, fontSize: "12px", marginTop: "10px" }}>
          Este resultado también queda visible en el Centro de Decisiones.
        </p>

        {error && <p style={{ color: "#c62828", marginTop: "10px" }}>{error}</p>}
      </Card>

      {results && (
        <Card>
          <h3 style={{ marginBottom: "12px" }}>Qué sacar de almacén</h3>
          {results.map((need) => (
            <div
              key={need.sourceId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 12px",
                borderLeft: `4px solid ${need.isSufficient ? "#2E7D32" : "#c62828"}`,
                borderRadius: "6px",
                background: "rgba(255,255,255,0.03)",
                marginBottom: "8px",
              }}
            >
              <span style={{ fontSize: "20px" }}>{getMaterialIcon(need.category)}</span>
              <span>
                {need.isSufficient ? "✅" : "⚠️"} {need.name}: {need.requiredQuantity.toFixed(2)} {need.unit}
                {!need.isSufficient && ` (faltan ${need.shortfall.toFixed(2)} ${need.unit})`}
              </span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
