/**
 * Servicio: Compras (Flujo 3 — Proveedores → Órdenes de compra → Recepción)
 */
import type { Supplier } from "../models/Supplier";
import type { PurchaseOrder, PurchaseOrderItem } from "../models/PurchaseOrder";
import * as rawMaterialInventoryService from "./rawMaterialInventoryService";

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

export function createPurchaseOrder(supplierId: string, items: PurchaseOrderItem[]): PurchaseOrder {
  if (items.length === 0) {
    throw new Error("Una orden de compra necesita al menos un ítem.");
  }
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
 * Recibir = el efecto real de Compras: por cada ítem, suma stock y
 * actualiza el costo de la materia prima correspondiente
 * (rawMaterialInventoryService). Idempotente: recibir dos veces la
 * misma orden no duplica el stock.
 */
export function receivePurchaseOrder(orderId: string): PurchaseOrder {
  const orders = getPurchaseOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) {
    throw new Error(`Orden de compra no encontrada: ${orderId}`);
  }
  if (order.status === "received") {
    return order;
  }

  order.items.forEach((item) => {
    rawMaterialInventoryService.receiveStock(item.rawMaterialId, item.quantity, item.unitCost);
  });

  order.status = "received";
  order.receivedAt = new Date().toISOString();
  write(ORDERS_KEY, orders);
  return order;
}