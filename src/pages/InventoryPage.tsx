import { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import * as rawMaterialInventoryService from "../services/rawMaterialInventoryService";
import type { RawMaterial } from "../models/RawMaterial";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

/**
 * BP-025 fix: esta página leía `data/rawMaterials.ts` directo (el archivo
 * semilla estático) — nunca reflejaba Compras ni Producción, en ningún
 * momento de la app (ni con localStorage, ni ahora con Firestore). Se migra
 * a rawMaterialInventoryService.getEffectiveRawMaterials(), igual que
 * Compras y Producción.
 */
export default function InventoryPage() {
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    rawMaterialInventoryService.getEffectiveRawMaterials().then((materials) => {
      setRawMaterials(materials);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <h1
        style={{
          color: colors.primary,
          fontSize: typography.title,
          marginBottom: "24px",
        }}
      >
        Catálogo Maestro de Materias Primas
      </h1>

      {loading && <p style={{ color: colors.textMuted }}>Cargando inventario...</p>}

      {!loading &&
        rawMaterials.map((material) => (
          <Card key={material.id}>
            <h2>{material.name}</h2>

            <p>Código: {material.code}</p>

            <p>Categoría: {material.category}</p>

            <p>Unidad: {material.unit}</p>

            <p>Stock: {material.currentStock}</p>

            <p>Stock mínimo: {material.minimumStock}</p>
          </Card>
        ))}
    </>
  );
}