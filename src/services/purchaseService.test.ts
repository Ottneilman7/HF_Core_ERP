// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from "vitest";
import * as purchaseService from "./purchaseService";
import * as rawMaterialInventoryService from "./rawMaterialInventoryService";

describe("purchaseService", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("crea un proveedor y lo lista", () => {
    purchaseService.createSupplier("Distribuidora El Trigal", "Carlos Pérez");
    expect(purchaseService.getSuppliers()).toHaveLength(1);
    expect(purchaseService.getSuppliers()[0].name).toBe("Distribuidora El Trigal");
  });

  it("crea una orden en estado 'ordered' y aparece como pendiente", () => {
    const supplier = purchaseService.createSupplier("Proveedor Genérico");
    purchaseService.createPurchaseOrder(supplier.id, [{ rawMaterialId: "1", quantity: 5000, unitCost: 0.0025 }]);

    expect(purchaseService.getPendingOrders()).toHaveLength(1);
    expect(purchaseService.getPendingOrders()[0].status).toBe("ordered");
  });

  it("recibir una orden actualiza el stock real de la materia prima", () => {
    const supplier = purchaseService.createSupplier("Proveedor Genérico");
    const order = purchaseService.createPurchaseOrder(supplier.id, [
      { rawMaterialId: "1", quantity: 5000, unitCost: 0.0025 }, // Avena: seed 12000
    ]);

    purchaseService.receivePurchaseOrder(order.id);

    const avena = rawMaterialInventoryService.getRawMaterialById("1");
    expect(avena?.currentStock).toBe(17000);
    expect(avena?.unitCost).toBe(0.0025);
    expect(purchaseService.getPendingOrders()).toHaveLength(0);
  });

  it("recibir dos veces la misma orden no duplica el stock (idempotente)", () => {
    const supplier = purchaseService.createSupplier("Proveedor Genérico");
    const order = purchaseService.createPurchaseOrder(supplier.id, [
      { rawMaterialId: "2", quantity: 1000, unitCost: 0.011 },
    ]);

    purchaseService.receivePurchaseOrder(order.id);
    purchaseService.receivePurchaseOrder(order.id);

    const miel = rawMaterialInventoryService.getRawMaterialById("2");
    expect(miel?.currentStock).toBe(1500); // 500 (seed) + 1000, una sola vez
  });

  it("una orden con múltiples ítems actualiza cada materia prima", () => {
    const supplier = purchaseService.createSupplier("Proveedor Genérico");
    const order = purchaseService.createPurchaseOrder(supplier.id, [
      { rawMaterialId: "5", quantity: 3000, unitCost: 0.0055 },
      { rawMaterialId: "6", quantity: 1000, unitCost: 0.006 },
    ]);

    purchaseService.receivePurchaseOrder(order.id);

    expect(rawMaterialInventoryService.getRawMaterialById("5")?.currentStock).toBe(3000);
    expect(rawMaterialInventoryService.getRawMaterialById("6")?.currentStock).toBe(1000);
  });
});