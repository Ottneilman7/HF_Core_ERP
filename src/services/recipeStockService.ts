/**
 * Servicio: Stock real de Semielaborados (Recipe con tracksInventory)
 *
 * Mismo patrón que rawMaterialInventoryService (ADR-005): recipes.ts
 * sigue siendo la semilla — sus `currentStock: 0` son placeholders,
 * como el propio archivo ya advierte. localStorage guarda el override
 * vigente. Recipe.ts (el modelo) no se toca.
 */
import type { Recipe } from "../models/Recipe";
import { recipes as seedRecipes } from "../data/recipes";

interface RecipeStockOverride {
  currentStock: number;
  updatedAt: string;
}

const OVERRIDES_KEY = "hf_recipestock_overrides";

function readOverrides(): Record<string, RecipeStockOverride> {
  const raw = localStorage.getItem(OVERRIDES_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, RecipeStockOverride>;
  } catch {
    return {};
  }
}

function writeOverrides(overrides: Record<string, RecipeStockOverride>): void {
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
}

/** Devuelve TODAS las recetas (no solo las que trackean inventario) con
 * su currentStock real cuando aplica — para poder pasarlas tal cual a
 * productionCalculatorService, que espera la lista completa. */
export function getEffectiveRecipes(): Recipe[] {
  const overrides = readOverrides();
  return seedRecipes.map((r) => {
    const override = overrides[r.id];
    if (!override) return r;
    return { ...r, currentStock: override.currentStock };
  });
}

export function getRecipeById(id: string): Recipe | undefined {
  return getEffectiveRecipes().find((r) => r.id === id);
}

export function increaseStock(recipeId: string, quantity: number): void {
  const current = getRecipeById(recipeId);
  if (!current) {
    throw new Error(`Receta no encontrada: ${recipeId}`);
  }
  const overrides = readOverrides();
  overrides[recipeId] = {
    currentStock: (current.currentStock ?? 0) + quantity,
    updatedAt: new Date().toISOString(),
  };
  writeOverrides(overrides);
}

export function decreaseStock(recipeId: string, quantity: number): void {
  const current = getRecipeById(recipeId);
  if (!current) {
    throw new Error(`Receta no encontrada: ${recipeId}`);
  }
  const available = current.currentStock ?? 0;
  if (quantity > available) {
    throw new Error(`Inventario insuficiente de ${current.name ?? recipeId} (disponible: ${available}).`);
  }
  const overrides = readOverrides();
  overrides[recipeId] = {
    currentStock: available - quantity,
    updatedAt: new Date().toISOString(),
  };
  writeOverrides(overrides);
}