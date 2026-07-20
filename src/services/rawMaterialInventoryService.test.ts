// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from "vitest";
import * as rawMaterialInventoryService from "./rawMaterialInventoryService";

describe("rawMaterialInventoryService", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("sin overrides, devuelve la semilla tal cual (avena con 12000 en rawMaterials.ts)", () => {
    const avena = rawMaterialInventoryService.getRawMaterialById("1");
    expect(avena?.currentStock).toBe(12000);
  });

  it("recibir stock sin indicar costo nuevo suma cantidad y conserva el costo actual", () => {
    rawMaterialInventoryService.receiveStock("2", 2000); // Miel: seed currentStock 500
    const miel = rawMaterialInventoryService.getRawMaterialById("2");
    expect(miel?.currentStock).toBe(2500);
    expect(miel?.unitCost).toBe(0.01); // sin cambio, no se pasó newUnitCost
  });

  it("recibir stock con nuevo costo actualiza currentStock y unitCost", () => {
    rawMaterialInventoryService.receiveStock("5", 5000, 0.0062); // Maní: seed 0 + 5000
    const mani = rawMaterialInventoryService.getRawMaterialById("5");
    expect(mani?.currentStock).toBe(5000);
    expect(mani?.unitCost).toBe(0.0062);
  });

  it("dos recepciones consecutivas se acumulan (no se pisan)", () => {
    rawMaterialInventoryService.receiveStock("4", 1000);
    rawMaterialInventoryService.receiveStock("4", 500);
    const coco = rawMaterialInventoryService.getRawMaterialById("4");
    expect(coco?.currentStock).toBe(1500);
  });

  it("lanza error si la materia prima no existe", () => {
    expect(() => rawMaterialInventoryService.receiveStock("no-existe", 100)).toThrow();
  });
});