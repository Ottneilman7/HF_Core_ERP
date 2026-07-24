/**
 * Servicio: Compras (Flujo 3 — Proveedores → Órdenes de compra → Recepción)
 *
 * ADR-007: un ítem puede recibirse como materia prima (suma a
 * rawMaterialInventoryService, actualiza costo) o como semielaborado
 * comprado ya hecho — ej. mantequilla de maní de emergencia — que suma
 * directo a recipeStockService, sin pasar por ningún cálculo de receta.
 */
import type { Supplier } from "../models/Supplier";
import type { PurchaseOrder, PurchaseOrderItem } from "../models/PurchaseOrder";
import * as rawMaterialInventoryService from "./rawMaterialInventoryService";
import * as recipeStockService from "./recipeStockService";

const SUPPLIERS_KEY = "hf_suppliers";
const ORDERS_KEY = "hf_purchase_orders";

function read<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// --- Proveedores ---

export function getSuppliers(): Supplier[] {
  return read<Supplier[]>(SUPPLIERS_KEY, []);
}

export function createSupplier(
  name: string,
  contactName?: string,
  phone?: string,
  email?: string
): Supplier {
  const supplier: Supplier = {
    id: crypto.randomUUID(),
    name,
    contactName,
    phone,
    email,
    createdAt: new Date().toISOString(),
  };
  write(SUPPLIERS_KEY, [...getSuppliers(), supplier]);
  return supplier;
}

// --- Órdenes de compra ---

export function getPurchaseOrders(): PurchaseOrder[] {
  return read<PurchaseOrder[]>(ORDERS_KEY, []);
}

export function getPendingOrders(): PurchaseOrder[] {
  return getPurchaseOrders().filter((o) => o.status === "ordered");
}

function validateItem(item: PurchaseOrderItem): void {
  const hasRawMaterial = Boolean(item.rawMaterialId);
  const hasRecipe = Boolean(item.componentRecipeId);
  if (hasRawMaterial === hasRecipe) {
    throw new Error(
      "Cada ítem de compra debe ser materia prima O un semielaborado comprado ya hecho, nunca ambos ni ninguno."
    );
  }
}

export function createPurchaseOrder(supplierId: string, items: PurchaseOrderItem[]): PurchaseOrder {
  if (items.length === 0) {
    throw new Error("Una orden de compra necesita al menos un ítem.");
  }
  items.forEach(validateItem);

  const order: PurchaseOrder = {
    id: crypto.randomUUID(),
    supplierId,
    items,
    status: "ordered",
    createdAt: new Date().toISOString(),
  };
  write(ORDERS_KEY, [...getPurchaseOrders(), order]);
  return order;
}

/**
 * Recibir = el efecto real de Compras: por cada ítem, suma stock —
 * de materia prima (con actualización de costo) o de semielaborado
 * comprado ya hecho (sin costo, Recipe.ts no lo modela todavía).
 * Idempotente: recibir dos veces la misma orden no duplica el efecto.
 */
export async function receivePurchaseOrder(orderId: string): Promise<PurchaseOrder> {
  const orders = getPurchaseOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) {
    throw new Error(`Orden de compra no encontrada: ${orderId}`);
  }
  if (order.status === "received") {
    return order;
  }

  for (const item of order.items) {
    if (item.rawMaterialId) {
      await rawMaterialInventoryService.receiveStock(item.rawMaterialId, item.quantity, item.unitCost);
    } else if (item.componentRecipeId) {
      recipeStockService.increaseStock(item.componentRecipeId, item.quantity);
    }
  }

  order.status = "received";
  order.receivedAt = new Date().toISOString();
  write(ORDERS_KEY, orders);
  return order;
}