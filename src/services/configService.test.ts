// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import * as configService from './configService';

describe('configService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('devuelve null si no hay empresa guardada todavía', () => {
    expect(configService.getCompany()).toBeNull();
    expect(configService.isCompanyConfigured()).toBe(false);
  });

  it('guarda y recupera la empresa', () => {
    configService.saveCompany({
      id: '1',
      legalName: 'Honestly Foods CA',
      tradeName: 'Honestly Foods',
      taxId: 'J-12345678-9',
      country: 'Venezuela',
      createdAt: new Date().toISOString(),
    });

    expect(configService.isCompanyConfigured()).toBe(true);
    expect(configService.getCompany()?.legalName).toBe('Honestly Foods CA');
  });

  it('devuelve parámetros por defecto (USD, margen 30%) si no hay guardados', () => {
    const params = configService.getParameters();
    expect(params.baseCurrency).toBe('USD');
    expect(params.defaultMarginPercentage).toBe(30);
  });

  it('guarda parámetros personalizados y los conserva', () => {
    configService.saveParameters({
      id: 'default',
      baseCurrency: 'VES',
      defaultMarginPercentage: 45,
      defaultWeightUnit: 'g',
      defaultVolumeUnit: 'ml',
      updatedAt: new Date().toISOString(),
    });

    expect(configService.getParameters().baseCurrency).toBe('VES');
    expect(configService.getParameters().defaultMarginPercentage).toBe(45);
  });

  it('guarda impuestos y los recupera', () => {
    configService.saveTaxConfig({
      id: 'default',
      taxes: [{ id: 't1', name: 'IVA', percentage: 16, isDefault: true }],
      updatedAt: new Date().toISOString(),
    });

    expect(configService.getTaxConfig().taxes).toHaveLength(1);
    expect(configService.getTaxConfig().taxes[0].name).toBe('IVA');
  });
});