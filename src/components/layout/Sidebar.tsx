import { colors } from "../../theme/colors";
import { Link } from "react-router-dom";

const menuItems = [
  {
    label: "🏠 Centro de Decisiones",
    path: "/",
  },
  {
    label: "📦 Inventario",
    path: "/inventory",
  },
  {
    label: "🏭 Producción",
    path: "/production",
  },
  {
    label: "🛒 Compras",
    path: "/purchases",
  },
  {
    label: "💰 Ventas",
    path: "/sales",
  },
  {
    label: "👥 Clientes",
    path: "/customers",
  },
  {
    label: "📈 Finanzas",
    path: "/finance",
  },
  {
    label: "⚙ Configuración",
    path: "/settings",
  },
];

export default function Sidebar() {
  return (
    <aside
      style={{
        width: "240px",
        background: colors.surface,
        color: colors.text,
        padding: "24px",
        minHeight: "100vh",
        borderRight: `1px solid ${colors.border}`,
      }}
    >
      <h2
        style={{
          color: colors.primary,
          marginBottom: "32px",
        }}
      >
        HF CORE ERP
      </h2>

      {menuItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          style={{
            display: "block",
            marginBottom: "18px",
            color: colors.text,
            textDecoration: "none",
            cursor: "pointer",
            padding: "8px",
            borderRadius: "8px",
          }}
        >
          {item.label}
        </Link>
      ))}
    </aside>
  );
}