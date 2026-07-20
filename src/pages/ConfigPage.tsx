import { useState, type FormEvent, type CSSProperties } from "react";
import { useConfig } from "../contexts/ConfigContext";
import * as configService from "../services/configService";
import type { Company } from "../models/Company";
import type { TaxRate } from "../models/TaxConfig";
import { FormInput } from "../components/FormInput";
import { FormButton } from "../components/FormButton";
import { colors } from "../theme/colors";

/**
 * Página: Configuración del negocio (Flujo 1)
 * Ruta: /settings
 *
 * BP-017: estilos actualizados a FormInput/FormButton (dejó de usar
 * <input>/<button> planos), consistente con el resto del ERP.
 */
export default function ConfigPage() {
  const { company, parameters, taxConfig, refresh } = useConfig();

  const [companyForm, setCompanyForm] = useState<Partial<Company>>(
    company ?? { legalName: "", tradeName: "", taxId: "", country: "" }
  );
  const [baseCurrency, setBaseCurrency] = useState(parameters.baseCurrency);
  const [defaultMargin, setDefaultMargin] = useState(parameters.defaultMarginPercentage);
  const [taxes, setTaxes] = useState<TaxRate[]>(taxConfig.taxes);
  const [newTaxName, setNewTaxName] = useState("");
  const [newTaxPercentage, setNewTaxPercentage] = useState<number>(0);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  function handleSaveCompany(e: FormEvent) {
    e.preventDefault();
    const toSave: Company = {
      id: company?.id ?? crypto.randomUUID(),
      legalName: companyForm.legalName ?? "",
      tradeName: companyForm.tradeName ?? "",
      taxId: companyForm.taxId ?? "",
      country: companyForm.country ?? "",
      address: companyForm.address,
      phone: companyForm.phone,
      email: companyForm.email,
      createdAt: company?.createdAt ?? new Date().toISOString(),
    };
    configService.saveCompany(toSave);
    refresh();
    setSavedMessage("Datos de la empresa guardados.");
  }

  function handleSaveParameters(e: FormEvent) {
    e.preventDefault();
    configService.saveParameters({
      ...parameters,
      baseCurrency,
      defaultMarginPercentage: defaultMargin,
      updatedAt: new Date().toISOString(),
    });
    refresh();
    setSavedMessage("Parámetros guardados.");
  }

  function handleAddTax() {
    if (!newTaxName.trim()) return;
    const tax: TaxRate = {
      id: crypto.randomUUID(),
      name: newTaxName,
      percentage: newTaxPercentage,
      isDefault: taxes.length === 0,
    };
    const updated = [...taxes, tax];
    setTaxes(updated);
    configService.saveTaxConfig({ ...taxConfig, taxes: updated, updatedAt: new Date().toISOString() });
    refresh();
    setNewTaxName("");
    setNewTaxPercentage(0);
  }

  function handleRemoveTax(id: string) {
    const updated = taxes.filter((t) => t.id !== id);
    setTaxes(updated);
    configService.saveTaxConfig({ ...taxConfig, taxes: updated, updatedAt: new Date().toISOString() });
    refresh();
  }

  const sectionStyle: CSSProperties = {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "24px",
  };

  return (
    <div style={{ maxWidth: "640px" }}>
      <h1 style={{ color: colors.text }}>Configuración del negocio</h1>
      <p style={{ color: colors.textMuted }}>
        Esta es la base de todo lo demás: el precio sugerido, las facturas y los reportes usarán estos datos.
      </p>

      {savedMessage && (
        <div
          style={{
            background: `${colors.primary}22`,
            border: `1px solid ${colors.primary}`,
            color: colors.primary,
            borderRadius: "10px",
            padding: "10px 14px",
            marginBottom: "20px",
            fontSize: "14px",
          }}
        >
          {savedMessage}
        </div>
      )}

      <section style={sectionStyle}>
        <h2 style={{ color: colors.text, marginTop: 0 }}>Empresa</h2>
        <form onSubmit={handleSaveCompany}>
          <FormInput
            label="Razón social"
            value={companyForm.legalName ?? ""}
            onChange={(e) => setCompanyForm({ ...companyForm, legalName: e.target.value })}
            required
          />
          <FormInput
            label="Nombre comercial"
            value={companyForm.tradeName ?? ""}
            onChange={(e) => setCompanyForm({ ...companyForm, tradeName: e.target.value })}
          />
          <FormInput
            label="RIF / NIT / Identificación fiscal"
            value={companyForm.taxId ?? ""}
            onChange={(e) => setCompanyForm({ ...companyForm, taxId: e.target.value })}
            required
          />
          <FormInput
            label="País"
            value={companyForm.country ?? ""}
            onChange={(e) => setCompanyForm({ ...companyForm, country: e.target.value })}
            required
          />
          <FormButton type="submit">Guardar empresa</FormButton>
        </form>
      </section>

      <section style={sectionStyle}>
        <h2 style={{ color: colors.text, marginTop: 0 }}>Parámetros</h2>
        <form onSubmit={handleSaveParameters}>
          <FormInput
            label="Moneda base (ej. USD, VES)"
            value={baseCurrency}
            onChange={(e) => setBaseCurrency(e.target.value.toUpperCase())}
            maxLength={3}
          />
          <FormInput
            label="Margen sugerido por defecto (%)"
            type="number"
            value={defaultMargin}
            onChange={(e) => setDefaultMargin(Number(e.target.value))}
            min={0}
          />
          <FormButton type="submit">Guardar parámetros</FormButton>
        </form>
      </section>

      <section style={sectionStyle}>
        <h2 style={{ color: colors.text, marginTop: 0 }}>Impuestos</h2>

        {taxes.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0, marginBottom: "16px" }}>
            {taxes.map((t) => (
              <li
                key={t.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 12px",
                  background: colors.card,
                  borderRadius: "10px",
                  marginBottom: "8px",
                  color: colors.text,
                }}
              >
                <span>
                  {t.name} — {t.percentage}%
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveTax(t.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: colors.danger,
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}

        <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
          <div style={{ flex: 2 }}>
            <FormInput
              label="Nombre"
              placeholder="ej. IVA"
              value={newTaxName}
              onChange={(e) => setNewTaxName(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <FormInput
              label="%"
              type="number"
              value={newTaxPercentage}
              onChange={(e) => setNewTaxPercentage(Number(e.target.value))}
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <FormButton type="button" variant="secondary" onClick={handleAddTax}>
              Agregar
            </FormButton>
          </div>
        </div>
      </section>
    </div>
  );
}
