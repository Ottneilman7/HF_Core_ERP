// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from "vitest";
import * as productionExecutionService from "./productionExecutionService";
import * as rawMaterialInventoryService from "./rawMaterialInventoryService";
import * as recipeStockService from "./recipeStockService";
import * as finishedGoodsInventoryService from "./finishedGoodsInventoryService";
import { recipes } from "../data/recipes";

const peanutButter = recipes.find((r) => r.id === "peanut-butter")!;
const honestlyBarClassic = recipes.find((r) => r.id === "1")!; // productId "1"

describe("productionExecutionService", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("producir un semielaborado (sin productId) suma a su propio stock, no a producto terminado", () => {
    rawMaterialInventoryService.receiveStock("5", 200); // Maní
    rawMaterialInventoryService.receiveStock("10", 200); // Aceite de Coco
    rawMaterialInventoryService.receiveStock("9", 200); // Sal

    productionExecutionService.confirmProduction(peanutButter, 100); // 1 lote

    expect(recipeStockService.getRecipeById("peanut-butter")?.currentStock).toBe(100);
    expect(rawMaterialInventoryService.getRawMaterialById("5")?.currentStock).toBe(110); // 200 - 90
    expect(rawMaterialInventoryService.getRawMaterialById("10")?.currentStock).toBe(192); // 200 - 8
    expect(rawMaterialInventoryService.getRawMaterialById("9")?.currentStock).toBe(198); // 200 - 2
    expect(finishedGoodsInventoryService.getAllStock()).toEqual({});
  });

  it("todo o nada: si falta un insumo, no se aplica ningún cambio", () => {
    // Sin recibir materia prima primero — todo en 0 (o insuficiente)
    expect(() => productionExecutionService.confirmProduction(peanutButter, 100)).toThrow();
    expect(rawMaterialInventoryService.getRawMaterialById("5")?.currentStock).toBe(0);
    expect(recipeStockService.getRecipeById("peanut-butter")?.currentStock).toBe(0);
  });

  it("producir una barra vendible consume semielaborados y suma a producto terminado, no a su propio stock", () => {
    recipeStockService.increaseStock("granola-base", 100);
    recipeStockService.increaseStock("peanut-butter", 100);
    rawMaterialInventoryService.receiveStock("14", 100); // Fruit Roll

    productionExecutionService.confirmProduction(honestlyBarClassic, 1);

    expect(finishedGoodsInventoryService.getStock("1")).toBe(1); // Honestly Bar Classic
    expect(recipeStockService.getRecipeById("granola-base")?.currentStock).toBe(75); // 100 - 25
    expect(recipeStockService.getRecipeById("peanut-butter")?.currentStock).toBe(88); // 100 - 12
    expect(rawMaterialInventoryService.getRawMaterialById("2")?.currentStock).toBe(492); // Miel: 500 - 8
    expect(rawMaterialInventoryService.getRawMaterialById("14")?.currentStock).toBe(95); // 100 - 5
  });

  it("rechaza cantidades en cero o negativas", () => {
    expect(() => productionExecutionService.confirmProduction(peanutButter, 0)).toThrow();
    expect(() => productionExecutionService.confirmProduction(peanutButter, -5)).toThrow();
  });

  it("dos confirmaciones consecutivas se acumulan correctamente", () => {
    recipeStockService.increaseStock("granola-base", 100);
    recipeStockService.increaseStock("peanut-butter", 100);
    rawMaterialInventoryService.receiveStock("14", 100);

    productionExecutionService.confirmProduction(honestlyBarClassic, 1);
    productionExecutionService.confirmProduction(honestlyBarClassic, 2);

    expect(finishedGoodsInventoryService.getStock("1")).toBe(3);
  });
});