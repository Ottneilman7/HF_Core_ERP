import type { Customer } from "../models/Customer";

export const customers: Customer[] = [

  {
    id: "1",
    code: "CLI-0001",
    businessName: "Supermercado El Centro",
    contactName: "Carlos Pérez",
    phone: "0414-5551234",
    email: "compras@elcentro.com",
    city: "Lechería",
    customerType: "Distribuidor",
    creditDays: 15,
    creditLimit: 500,
    balance: 120,
    lastPurchase: "2026-07-12",
    priority: "HIGH",
    active: true,
  },

  {
    id: "2",
    code: "CLI-0002",
    businessName: "Fit Market",
    contactName: "María Gómez",
    phone: "0412-8880000",
    email: "info@fitmarket.com",
    city: "Barcelona",
    customerType: "Tienda Saludable",
    creditDays: 0,
    creditLimit: 0,
    balance: 0,
    lastPurchase: "2026-06-25",
    priority: "LOW",
    active: true,
  },

]; 