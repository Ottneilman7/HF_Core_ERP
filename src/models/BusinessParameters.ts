/**
 * Modelo: Parámetros del negocio (Flujo 1 — Configurar el negocio)
 * Moneda base y margen sugerido por defecto: usados por el módulo de
 * Costeo/Precio de Venta (Sprint 3) y por Ventas/Facturación (futuro).
 */
export type WeightUnit = 'g' | 'kg';
export type VolumeUnit = 'ml' | 'l';

export interface BusinessParameters {
  id: string;
  baseCurrency: string; // Código ISO, ej. 'USD', 'VES'
  defaultMarginPercentage: number; // Margen sugerido por defecto sobre el costo
  defaultWeightUnit: WeightUnit;
  defaultVolumeUnit: VolumeUnit;
  updatedAt: string; // ISO date
}