/**
 * Modelo: Empresa (Flujo 1 — Configurar el negocio)
 * Origen: EL-Verdadero-MVP-EIF.md, Flujo 1 · ADR-006 (persistencia local)
 */
export interface Company {
  id: string;
  legalName: string; // Razón social
  tradeName: string; // Nombre comercial
  taxId: string; // RIF / NIT / RUC / identificación fiscal
  country: string;
  address?: string;
  phone?: string;
  email?: string;
  createdAt: string; // ISO date
}