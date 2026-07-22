// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from "vitest";
import * as recipeStockService from "./recipeStockService";

describe("recipeStockService", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("sin overrides, devuelve el placeholder de la semilla (granola-base: 0)", () => {
    expect(recipeStockService.getRecipeById("granola-base")?.currentStock).toBe(0);
  });

  it("increaseStock suma sobre el stock actual", () => {
    recipeStockService.increaseStock("granola-base", 3200);
    expect(recipeStockService.getRecipeById("granola-base")?.currentStock).toBe(3200);
  });

  it("decreaseStock resta si hay suficiente", () => {
    recipeStockService.increaseStock("peanut-butter", 100);
    recipeStockService.decreaseStock("peanut-butter", 40);
    expect(recipeStockService.getRecipeById("peanut-butter")?.currentStock).toBe(60);
  });

  it("decreaseStock lanza error si no hay suficiente y no modifica nada", () => {
    recipeStockService.increaseStock("peanut-butter", 10);
    expect(() => recipeStockService.decreaseStock("peanut-butter", 11)).toThrow();
    expect(recipeStockService.getRecipeById("peanut-butter")?.currentStock).toBe(10);
  });

  it("getEffectiveRecipes conserva intactas las recetas sin override (ej. las barras)", () => {
    recipeStockService.increaseStock("granola-base", 500);
    const barra = recipeStockService.getEffectiveRecipes().find((r) => r.id === "1");
    expect(barra?.code).toBe("HB_C1");
    expect(barra?.items.length).toBe(4);
  });
});