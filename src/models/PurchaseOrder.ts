export type PurchaseOrderStatus = "ordered" | "received";

export interface PurchaseOrderItem {
  rawMaterialId: string; // referencia a RawMaterial.id
  quantity: number; // en la unidad de la materia prima (ej. Gramos)
  unitCost: number; // costo pactado con el proveedor para este pedido
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  items: PurchaseOrderItem[];
  status: PurchaseOrderStatus;
  createdAt: string; // ISO date
  receivedAt?: string; // ISO date
}