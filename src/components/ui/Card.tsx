import { ReactNode } from "react";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

type CardProps = {
  children: ReactNode;
};

export default function Card({ children }: CardProps) {
  return (
    <div
      style={{
        background: colors.surface,
        borderRadius: "12px",
        padding: spacing.lg,
        border: `1px solid ${colors.border}`,
        boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
        minWidth: "320px",

        display: "flex",
        flexDirection: "column",
        alignItems: "center",

        textAlign: "center",
      }}
    >
      {children}
    </div>
  );
}