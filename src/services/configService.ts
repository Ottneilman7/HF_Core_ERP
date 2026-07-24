/**
 * Servicio: Configuración del negocio — Fase Firestore (BP-024)
 *
 * Reemplaza la versión de localStorage (BP-016). Mismos nombres de
 * función, misma forma de los datos — solo cambia el mecanismo de
 * persistencia (ahora asíncrono) y la ubicación (Firestore, documento
 * businesses/{CURRENT_BUSINESS_ID}, ver ADR-008).
 */
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, CURRENT_BUSINESS_ID } from "../lib/firebase";
import type { Company } from "../models/Company";
import type { BusinessParameters } from "../models/BusinessParameters";
import type { TaxConfig } from "../models/TaxConfig";

const businessDocRef = doc(db, "businesses", CURRENT_BUSINESS_ID);

interface BusinessDocument {
  company?: Company;
  parameters?: BusinessParameters;
  taxConfig?: TaxConfig;
}

async function readBusinessDoc(): Promise<BusinessDocument> {
  const snap = await getDoc(businessDocRef);
  return (snap.data() as BusinessDocument) ?? {};
}

export async function getCompany(): Promise<Company | null> {
  const data = await readBusinessDoc();
  return data.company ?? null;
}

export async function saveCompany(company: Company): Promise<void> {
  await setDoc(businessDocRef, { company }, { merge: true });
}

export async function isCompanyConfigured(): Promise<boolean> {
  return (await getCompany()) !== null;
}

const DEFAULT_PARAMETERS: BusinessParameters = {
  id: "default",
  baseCurrency: "USD",
  defaultMarginPercentage: 30,
  defaultWeightUnit: "g",
  defaultVolumeUnit: "ml",
  updatedAt: new Date(0).toISOString(),
};

export async function getParameters(): Promise<BusinessParameters> {
  const data = await readBusinessDoc();
  return data.parameters ?? DEFAULT_PARAMETERS;
}

export async function saveParameters(parameters: BusinessParameters): Promise<void> {
  await setDoc(businessDocRef, { parameters }, { merge: true });
}

const DEFAULT_TAX_CONFIG: TaxConfig = {
  id: "default",
  taxes: [],
  updatedAt: new Date(0).toISOString(),
};

export async function getTaxConfig(): Promise<TaxConfig> {
  const data = await readBusinessDoc();
  return data.taxConfig ?? DEFAULT_TAX_CONFIG;
}

export async function saveTaxConfig(taxConfig: TaxConfig): Promise<void> {
  await setDoc(businessDocRef, { taxConfig }, { merge: true });
}