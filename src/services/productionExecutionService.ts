/**
 * Servicio: Ejecución real de Producción (BP-021 — Producción Fase 2)
 *
 * Cierra el puente manual de ADR-006 (BP-019): en vez de que el
 * emprendedor anote a mano cuánto fabricó, "Confirmar producción" aplica
 * de verdad el efecto: consume materia prima y semielaborados, y suma
 * el resultado a producto terminado vendible o al stock del semielaborado.
 *
 * Reutiliza el motor ya probado de productionCalculatorService
 * (calculateProductionNeeds) sin modificarlo — Regla 1.
 */
import type { Recipe } from "../models/Recipe";
import { calculateProductionNeeds, ProductionCalculationError } from "./productionCalculatorService";
import * as rawMaterialInventoryService from "./rawMaterialInventoryService";
import * as recipeStockService from "./recipeStockService";
import * as finishedGoodsInventoryService from "./finishedGoodsInventoryService";

/**
 * Confirma una producción real. Todo o nada: primero valida que TODO lo
 * necesario (materia prima + semielaborados) esté disponible; si algo
 * falta, no se aplica ningún cambio. Si alcanza, descuenta cada insumo y
 * suma el resultado:
 * - a `finishedGoodsInventoryService` si `recipe.productId` existe (es un
 *   SKU vendible: una barra, una presentación de Granola).
 * - al propio stock del semielaborado (`recipeStockService`) si no tiene
 *   `productId` (ej. producir más Granola Base directamente).
 */
export async function confirmProduction(recipe: Recipe, quantityToProduce: number): Promise<void> {
  if (quantityToProduce <= 0) {
    throw new ProductionCalculationError("La cantidad a producir debe ser mayor que cero.");
  }

  const rawMaterials = await rawMaterialInventoryService.getEffectiveRawMaterials(); // BP-025: Firestore
  const effectiveRecipes = recipeStockService.getEffectiveRecipes(); // pendiente BP-026: sigue en localStorage

  const needs = calculateProductionNeeds(recipe, quantityToProduce, rawMaterials, effectiveRecipes);

  const shortages = needs.filter((n) => !n.isSufficient);
  if (shortages.length > 0) {
    throw new ProductionCalculationError(
      `No se puede confirmar: falta ${shortages.map((s) => s.name).join(", ")}.`
    );
  }

  for (const need of needs) {
    if (need.sourceType === "rawMaterial") {
      await rawMaterialInventoryService.consumeStock(need.sourceId, need.requiredQuantity);
    } else {
      recipeStockService.decreaseStock(need.sourceId, need.requiredQuantity);
    }
  }

  if (recipe.productId) {
    finishedGoodsInventoryService.increaseStock(recipe.productId, quantityToProduce);
  } else {
    recipeStockService.increaseStock(recipe.id, quantityToProduce);
  }
}