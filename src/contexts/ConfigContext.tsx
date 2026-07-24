import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { Company } from "../models/Company";
import type { BusinessParameters } from "../models/BusinessParameters";
import type { TaxConfig } from "../models/TaxConfig";
import * as configService from "../services/configService";

interface ConfigContextValue {
  company: Company | null;
  parameters: BusinessParameters;
  taxConfig: TaxConfig;
  isConfigured: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
}

const FALLBACK_PARAMETERS: BusinessParameters = {
  id: "default",
  baseCurrency: "USD",
  defaultMarginPercentage: 30,
  defaultWeightUnit: "g",
  defaultVolumeUnit: "ml",
  updatedAt: new Date(0).toISOString(),
};

const FALLBACK_TAX_CONFIG: TaxConfig = {
  id: "default",
  taxes: [],
  updatedAt: new Date(0).toISOString(),
};

const ConfigContext = createContext<ConfigContextValue | undefined>(undefined);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [company, setCompany] = useState<Company | null>(null);
  const [parameters, setParameters] = useState<BusinessParameters>(FALLBACK_PARAMETERS);
  const [taxConfig, setTaxConfig] = useState<TaxConfig>(FALLBACK_TAX_CONFIG);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [c, p, t] = await Promise.all([
      configService.getCompany(),
      configService.getParameters(),
      configService.getTaxConfig(),
    ]);
    setCompany(c);
    setParameters(p);
    setTaxConfig(t);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value: ConfigContextValue = {
    company,
    parameters,
    taxConfig,
    isConfigured: company !== null,
    loading,
    refresh,
  };

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig(): ConfigContextValue {
  const ctx = useContext(ConfigContext);
  if (!ctx) {
    throw new Error("useConfig debe usarse dentro de un <ConfigProvider>");
  }
  return ctx;
}