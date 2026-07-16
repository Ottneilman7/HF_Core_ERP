import Card from "../components/ui/Card";
import StatCard from "../components/dashboard/StatCard";

import { customers } from "../data/customers";

import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

export default function CustomersPage() {
  const activeCustomers = customers.filter(c => c.active).length;
  const priorityCustomers = customers.filter(
  customer => customer.priority === "HIGH"
  ).length;

  const totalBalance = customers.reduce(
    (sum, customer) => sum + customer.balance,
    0
  );

  return (
    <>
      <h1
        style={{
          color: colors.primary,
          fontSize: typography.title,
          marginBottom: "24px",
        }}
      >
        Catálogo Maestro de Clientes
      </h1>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "30px",
          flexWrap: "wrap",
        }}
      >
        <StatCard
          title="Clientes"
          value={customers.length}
        />

        <StatCard
          title="Activos"
          value={activeCustomers}
        />

        <StatCard
          title="Prioritarios"
          value={priorityCustomers}
        />
      </div>

      <div
        style={{
          display: "grid",
          gap: "20px",
        }}
      >
        {customers.map((customer) => (
          <Card key={customer.id}>
            <h2>{customer.businessName}</h2>

            <p>
              <strong>Código:</strong> {customer.code}
            </p>

            <p>
              <strong>Contacto:</strong> {customer.contactName}
            </p>

            <p>
              <strong>Ciudad:</strong> {customer.city}
            </p>

            <p>
              <strong>Tipo:</strong> {customer.customerType}
            </p>

            <p>
              <strong>Saldo:</strong> ${customer.balance}
            </p>
          </Card>
        ))}
      </div>
    </>
  );
}