export interface Customer {

  id: string;

  code: string;

  businessName: string;

  contactName: string;

  phone: string;

  email: string;

  city: string;

  customerType: string;

  creditDays: number;

  creditLimit: number;

  balance: number;

  lastPurchase: string;

  priority: "HIGH" | "MEDIUM" | "LOW";

  active: boolean;

}