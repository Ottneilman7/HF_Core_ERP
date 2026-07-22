import { useState } from "react";
import * as paymentService from "../services/paymentService";
import * as customerBalanceService from "../services/customerBalanceService";
import { FormInput } from "../components/FormInput";
import { FormSelect } from "../components/FormSelect";
import { FormButton } from "../components/FormButton";
import { colors } from "../theme/colors";

/**
 * Página: Cobranza (Flujo 6)
 * Ruta: /finance
 *
 * Nota de ruta: el Sidebar no tiene un ítem "Cobranza" propio — se usa
 * /finance (antes ComingSoonPage) porque Cuentas por Cobrar es, en esencia,
 * una función financiera. Si Finanzas crece más allá de Cobranza (KPIs,
 * rentabilidad — ver ENTREPRENEUR_JOURNEY.md, flujo mensual), se separará
 * en su momento (BP futuro), no antes.
 */
export default function FinancePage() {
  const [, forceRefresh] = useState(0);
  const customers = customerBalanceService.getEffectiveCustomers().filter((c) => c.active);
  const payments = paymentService.getPayments();

  const debtors = customers.filter((c) => c.balance > 0);

  const [selectedCustomerId, setSelectedCustomerId] = useState(debtors[0]?.id ?? "");
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    forceRefresh((n) => n + 1);
  }

  function customerName(id: string): string {
    return customers.find((c) => c.id === id)?.businessName ?? id;
  }

  function handleRegisterPayment() {
    setError(null);
    if (!selectedCustomerId) return;
    try {
      paymentService.registerPayment(selectedCustomerId, amount, note || undefined);
      setAmount(0);
      setNote("");
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    }
  }

  const sectionStyle = {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "24px",
  };

  return (
    <div style={{ maxWidth: "680px" }}>
      <h1 style={{ color: colors.text }}>Cobranza</h1>
      <p style={{ color: colors.textMuted }}>
        Cuentas por cobrar, registro de pagos y saldos actualizados.
      </p>

      <section style={sectionStyle}>
        <h2 style={{ color: colors.text, marginTop: 0 }}>Cuentas pendientes</h2>
        {debtors.length === 0 && (
          <p style={{ color: colors.textMuted }}>Ningún cliente tiene saldo pendiente ahora mismo. 🎉</p>
        )}
        {debtors.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {debtors.map((c) => (
              <li
                key={c.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  background: colors.card,
                  borderRadius: "10px",
                  marginBottom: "8px",
                  color: colors.text,
                }}
              >
                <span>{c.businessName}</span>
                <span style={{ color: colors.warning, fontWeight: 600 }}>${c.balance.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={sectionStyle}>
        <h2 style={{ color: colors.text, marginTop: 0 }}>Registrar pago</h2>

        <FormSelect
          label="Cliente"
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
        >
          <option value="">Selecciona un cliente</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.businessName} (debe ${c.balance.toFixed(2)})
            </option>
          ))}
        </FormSelect>

        <FormInput
          label="Monto recibido ($)"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          min={0}
        />

        <FormInput
          label="Nota (opcional)"
          placeholder="ej. Transferencia, referencia #123"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <FormButton type="button" onClick={handleRegisterPayment}>
          Registrar pago
        </FormButton>

        {error && <p style={{ color: colors.danger, marginTop: "10px" }}>{error}</p>}
      </section>

      <section style={sectionStyle}>
        <h2 style={{ color: colors.text, marginTop: 0 }}>Historial de pagos</h2>
        {payments.length === 0 && <p style={{ color: colors.textMuted }}>Todavía no hay pagos registrados.</p>}
        {payments.map((p) => (
          <div
            key={p.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 12px",
              borderLeft: `4px solid ${colors.primary}`,
              background: colors.card,
              borderRadius: "8px",
              marginBottom: "8px",
              color: colors.text,
            }}
          >
            <span>
              {customerName(p.customerId)}
              {p.note ? ` — ${p.note}` : ""}
            </span>
            <span style={{ color: colors.primary, fontWeight: 600 }}>${p.amount.toFixed(2)}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
