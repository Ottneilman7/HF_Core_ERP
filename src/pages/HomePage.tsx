// HomePage.tsx — Landing real (BP-013). Frase motivadora rota cada día
// del año (determinística, sin necesidad de backend ni de guardar nada).

import { Link } from "react-router-dom";
import Card from "../components/ui/Card";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

const motivationalPhrases = [
  "Cada barra, cada bolsa de granola, es un paso más cerca del negocio que estás construyendo.",
  "No se trata de trabajar más horas — se trata de saber exactamente qué hacer hoy.",
  "Un pequeño negocio ordenado hoy es una gran empresa mañana.",
  "Lo que mides, lo puedes mejorar. Lo que ignoras, te termina costando.",
  "Honestly Foods no vende barras: vende disciplina, salud y consistencia.",
  "El emprendedor que sabe qué hacer hoy, no necesita adivinar mañana.",
  "Tu negocio crece en la misma medida en que tú decides crecer con él.",
];

function getTodaysPhrase(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return motivationalPhrases[dayOfYear % motivationalPhrases.length];
}

const actions = [
  { label: "🏭 Producir", path: "/production", description: "Decide cuánto vas a fabricar hoy" },
  { label: "💰 Vender", path: "/sales", description: "Registra ventas y revisa pedidos" },
  { label: "📇 Cobrar", path: "/finance", description: "Clientes con pagos pendientes" },
  { label: "🛒 Comprar", path: "/purchases", description: "Materia prima que necesitas reponer" },
  { label: "📣 Promocionar", path: "/marketing", description: "Ideas para redes y ventas online" },
];

const actionCardStyle: React.CSSProperties = {
  display: "block",
  textDecoration: "none",
  color: colors.text,
  background: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: "10px",
  padding: "16px",
  minWidth: "180px",
};

export default function HomePage() {
  return (
    <div style={{ padding: "32px 24px", display: "flex", flexDirection: "column", gap: "24px" }}>
      <Card>
        <h1 style={{ color: colors.primary, fontSize: typography.title }}>Honestly Foods CA</h1>
        <p style={{ color: colors.text, fontSize: typography.subtitle, marginTop: "4px" }}>
          {getTodaysPhrase()}
        </p>
        <p style={{ color: colors.textMuted, fontSize: typography.body, marginTop: "8px" }}>
          ¿Qué vas a hacer hoy?
        </p>
      </Card>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
        {actions.map((action) => (
          <Link key={action.path} to={action.path} style={actionCardStyle}>
            <div style={{ fontSize: "18px", marginBottom: "6px" }}>{action.label}</div>
            <div style={{ color: colors.textMuted, fontSize: "13px" }}>{action.description}</div>
          </Link>
        ))}
      </div>

      <Link to="/decisions" style={{ color: colors.primary, fontSize: typography.body, textDecoration: "none" }}>
        🎯 Ver Centro de Decisiones →
      </Link>
    </div>
  );
}