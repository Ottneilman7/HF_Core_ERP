export interface Payment {
  id: string;
  customerId: string;
  amount: number;
  note?: string;
  createdAt: string; // ISO date
}