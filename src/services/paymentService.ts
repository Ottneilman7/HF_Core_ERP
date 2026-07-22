/**
 * Servicio: Cobranza (Flujo 6 — Cuentas por cobrar → Pagos → Saldos)
 *
 * Reutiliza customerBalanceService.adjustBalance (ya existente desde
 * BP-019) con monto negativo: un pago reduce el saldo que el cliente debe.
 */
import type { Payment } from "../models/Payment";
import * as customerBalanceService from "./customerBalanceService";

const PAYMENTS_KEY = "hf_payments";

function readPayments(): Payment[] {
  const raw = localStorage.getItem(PAYMENTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Payment[];
  } catch {
    return [];
  }
}

function writePayments(payments: Payment[]): void {
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
}

export function getPayments(): Payment[] {
  return readPayments();
}

export function getPaymentsByCustomer(customerId: string): Payment[] {
  return readPayments().filter((p) => p.customerId === customerId);
}

/**
 * Registra un pago y reduce el saldo del cliente. No exige que el monto
 * sea exactamente igual al saldo pendiente (permite abonos parciales);
 * sí exige que sea positivo.
 */
export function registerPayment(customerId: string, amount: number, note?: string): Payment {
  if (amount <= 0) {
    throw new Error("El monto del pago debe ser mayor a cero.");
  }

  const customer = customerBalanceService.getCustomerById(customerId);
  if (!customer) {
    throw new Error(`Cliente no encontrado: ${customerId}`);
  }

  customerBalanceService.adjustBalance(customerId, -amount);

  const payment: Payment = {
    id: crypto.randomUUID(),
    customerId,
    amount,
    note,
    createdAt: new Date().toISOString(),
  };
  writePayments([...readPayments(), payment]);
  return payment;
}