/**
 * Servicio: Inventario real de Materia Prima
 *
 * ADR-005: rawMaterials.ts sigue siendo la SEMILLA (no se edita a mano
 * nunca más para reflejar stock/costo real). localStorage guarda el
 * override vigente de currentStock/unitCost por materia prima, igual
 * patrón que configService.ts (BP-016) aplicado por primera vez a datos
 * de catálogo en vez de a Configuración.
 *
 * RawMaterial.ts (el modelo) NO se toca — Regla 1, AI_CONTEXT.md.
 */
import type { RawMaterial } from "../models/RawMaterial";
import { rawMaterials as seedRawMaterials } from "../data/rawMaterials";

interface RawMaterialOverride {
  currentStock: number;
  unitCost: number;
  updatedAt: string;
}

const OVERRIDES_KEY = "hf_rawmaterial_overrides";

function readOverrides(): Record<string, RawMaterialOverride> {
  const raw = localStorage.getItem(OVERRIDES_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, RawMaterialOverride>;
  } catch {
    return {};
  }
}

function writeOverrides(overrides: Record<string, RawMaterialOverride>): void {
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
}

/** Devuelve el catálogo real: semilla + override vigente (si existe). */
export function getEffectiveRawMaterials(): RawMaterial[] {
  const overrides = readOverrides();
  return seedRawMaterials.map((rm) => {
    const override = overrides[rm.id];
    if (!override) return rm;
    return { ...rm, currentStock: override.currentStock, unitCost: override.unitCost };
  });
}

export function getRawMaterialById(id: string): RawMaterial | undefined {
  return getEffectiveRawMaterials().find((rm) => rm.id === id);
}

/**
 * Aplica el efecto de recibir una compra: suma `quantityReceived` al stock
 * vigente y, si se indica `newUnitCost`, reemplaza el costo (costo del
 * proveedor de este pedido, tal como pide EL-Verdadero-MVP-EIF.md: "Recepción
 * → Actualización de costos").
 */
export function receiveStock(rawMaterialId: string, quantityReceived: number, newUnitCost?: number): void {
  const current = getRawMaterialById(rawMaterialId);
  if (!current) {
    throw new Error(`Materia prima no encontrada: ${rawMaterialId}`);
  }

  const overrides = readOverrides();
  overrides[rawMaterialId] = {
    currentStock: current.currentStock + quantityReceived,
    unitCost: newUnitCost ?? current.unitCost,
    updatedAt: new Date().toISOString(),
  };
  writeOverrides(overrides);
}