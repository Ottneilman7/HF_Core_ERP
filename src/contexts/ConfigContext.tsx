import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Company } from '../models/Company';
import type { BusinessParameters } from '../models/BusinessParameters';
import type { TaxConfig } from '../models/TaxConfig';
import * as configService from '../services/configService';

interface ConfigContextValue {
  company: Company | null;
  parameters: BusinessParameters;
  taxConfig: TaxConfig;
  isConfigured: boolean;
  refresh: () => void;
}

const ConfigContext = createContext<ConfigContextValue | undefined>(undefined);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [company, setCompany] = useState<Company | null>(configService.getCompany());
  const [parameters, setParameters] = useState<BusinessParameters>(configService.getParameters());
  const [taxConfig, setTaxConfig] = useState<TaxConfig>(configService.getTaxConfig());

  const refresh = useCallback(() => {
    setCompany(configService.getCompany());
    setParameters(configService.getParameters());
    setTaxConfig(configService.getTaxConfig());
  }, []);

  const value: ConfigContextValue = {
    company,
    parameters,
    taxConfig,
    isConfigured: company !== null,
    refresh,
  };

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig(): ConfigContextValue {
  const ctx = useContext(ConfigContext);
  if (!ctx) {
    throw new Error('useConfig debe usarse dentro de un <ConfigProvider>');
  }
  return ctx;
}
