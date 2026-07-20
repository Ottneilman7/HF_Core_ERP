/**
 * Modelo: Impuestos (Flujo 1 — Configurar el negocio)
 *
 * Nota: los tipos de agente de retención (persona natural/jurídica,
 * no agente, agente 75%, agente 100%) NO viven aquí — son un atributo
 * por Cliente (ver ENTREPRENEUR_JOURNEY.md, Etapa 0), se definirán en
 * el módulo de Clientes. Aquí solo vive el catálogo de impuestos del
 * negocio (ej. IVA) que se aplicará a productos/facturas.
 */
export interface TaxRate {
  id: string;
  name: string; // ej. "IVA"
  percentage: number;
  isDefault: boolean;
}

export interface TaxConfig {
  id: string;
  taxes: TaxRate[];
  updatedAt: string; // ISO date
}