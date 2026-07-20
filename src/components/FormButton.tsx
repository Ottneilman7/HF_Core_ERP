// FormButton.tsx — mismo efecto 3D de ResetButton (gradiente + sombra +
// presión al clic), pero reutilizable para acciones "positivas" (Guardar,
// Agregar) usando colors.primary/secondary en vez del rojo de "Reiniciar".
import { useState, type ButtonHTMLAttributes } from "react";
import { colors } from "../theme/colors";

interface FormButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export function FormButton({ variant = "primary", style, children, ...props }: FormButtonProps) {
  const [pressed, setPressed] = useState(false);
  const base = variant === "primary" ? colors.primary : colors.secondary;
  const dark = variant === "primary" ? colors.primaryDark : colors.secondary;

  return (
    <button
      {...props}
      onMouseDown={(e) => {
        setPressed(true);
        props.onMouseDown?.(e);
      }}
      onMouseUp={(e) => {
        setPressed(false);
        props.onMouseUp?.(e);
      }}
      onMouseLeave={(e) => {
        setPressed(false);
        props.onMouseLeave?.(e);
      }}
      style={{
        padding: "10px 20px",
        fontSize: "14px",
        fontWeight: 600,
        borderRadius: "999px",
        border: "none",
        color: "#fff",
        background: `linear-gradient(145deg, ${base}, ${dark})`,
        boxShadow: pressed
          ? "inset 0 2px 4px rgba(0,0,0,0.4)"
          : `0 4px 10px ${base}66, inset 0 1px 0 rgba(255,255,255,0.2)`,
        transform: pressed ? "translateY(1px)" : "translateY(0)",
        cursor: "pointer",
        transition: "all 0.12s ease",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
