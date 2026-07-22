// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from "vitest";
import * as paymentService from "./paymentService";
import * as customerBalanceService from "./customerBalanceService";

describe("paymentService", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("registrar un pago reduce el saldo del cliente (El Centro: 120 -> 70)", () => {
    paymentService.registerPayment("1", 50);
    expect(customerBalanceService.getCustomerById("1")?.balance).toBe(70);
  });

  it("permite abonos parciales, no exige pagar el saldo completo", () => {
    paymentService.registerPayment("1", 20);
    paymentService.registerPayment("1", 30);
    expect(customerBalanceService.getCustomerById("1")?.balance).toBe(70);
    expect(paymentService.getPaymentsByCustomer("1")).toHaveLength(2);
  });

  it("un pago puede dejar el saldo en negativo (a favor del cliente) sin bloquearse", () => {
    paymentService.registerPayment("1", 200); // debe 120, paga 200
    expect(customerBalanceService.getCustomerById("1")?.balance).toBe(-80);
  });

  it("rechaza montos en cero o negativos", () => {
    expect(() => paymentService.registerPayment("1", 0)).toThrow();
    expect(() => paymentService.registerPayment("1", -10)).toThrow();
  });

  it("rechaza pagos de un cliente que no existe", () => {
    expect(() => paymentService.registerPayment("no-existe", 10)).toThrow();
  });

  it("getPayments lista todos los pagos, de todos los clientes", () => {
    paymentService.registerPayment("1", 20);
    paymentService.registerPayment("2", 10);
    expect(paymentService.getPayments()).toHaveLength(2);
  });
});