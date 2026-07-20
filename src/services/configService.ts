/**
 * Servicio: Configuración del negocio
 *
 * Implementa BP-015 Fase 1 (localStorage como puente) por primera vez,
 * empezando por Configuración porque es el primer dato que un negocio
 * real necesita que sobreviva a recargar la página. El mismo patrón
 * (read/write con seed por defecto) se reutilizará para Producción,
 * Compras, Ventas, etc. cuando se aborden en BP-015 Fase 1 completa.
 */
import type { Company } from '../models/Company';
import type { BusinessParameters } from '../models/BusinessParameters';
import type { TaxConfig } from '../models/TaxConfig';

const STORAGE_KEYS = {
  company: 'hf_config_company',
  parameters: 'hf_config_parameters',
  taxConfig: 'hf_config_taxes',
} as const;

function read<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getCompany(): Company | null {
  return read<Company>(STORAGE_KEYS.company);
}

export function saveCompany(company: Company): void {
  write(STORAGE_KEYS.company, company);
}

export function isCompanyConfigured(): boolean {
  return getCompany() !== null;
}

const DEFAULT_PARAMETERS: BusinessParameters = {
  id: 'default',
  baseCurrency: 'USD',
  defaultMarginPercentage: 30,
  defaultWeightUnit: 'g',
  defaultVolumeUnit: 'ml',
  updatedAt: new Date(0).toISOString(),
};

export function getParameters(): BusinessParameters {
  return read<BusinessParameters>(STORAGE_KEYS.parameters) ?? DEFAULT_PARAMETERS;
}

export function saveParameters(parameters: BusinessParameters): void {
  write(STORAGE_KEYS.parameters, parameters);
}

const DEFAULT_TAX_CONFIG: TaxConfig = {
  id: 'default',
  taxes: [],
  updatedAt: new Date(0).toISOString(),
};

export function getTaxConfig(): TaxConfig {
  return read<TaxConfig>(STORAGE_KEYS.taxConfig) ?? DEFAULT_TAX_CONFIG;
}

export function saveTaxConfig(taxConfig: TaxConfig): void {
  write(STORAGE_KEYS.taxConfig, taxConfig);
}