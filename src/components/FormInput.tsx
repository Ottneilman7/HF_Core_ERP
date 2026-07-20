// FormInput.tsx — input de formulario reutilizable, mismo lenguaje visual
// que ResetButton (bordes redondeados, glow de foco, sombra interna sutil).
import { useState, type InputHTMLAttributes } from "react";
import { colors } from "../theme/colors";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function FormInput({ label, style, ...props }: FormInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <label style={{ display: "block", marginBottom: "16px" }}>
      {label && (
        <span
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "13px",
            fontWeight: 600,
            color: colors.textMuted,
          }}
        >
          {label}
        </span>
      )}
      <input
        {...props}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        style={{
          width: "100%",
          padding: "10px 14px",
          fontSize: "14px",
          borderRadius: "10px",
          border: `1px solid ${focused ? colors.primary : colors.border}`,
          background: colors.card,
          color: colors.text,
          outline: "none",
          boxShadow: focused
            ? `0 0 0 3px ${colors.primary}33, inset 0 1px 2px rgba(0,0,0,0.3)`
            : "inset 0 1px 2px rgba(0,0,0,0.3)",
          transition: "all 0.15s ease",
          boxSizing: "border-box",
          ...style,
        }}
      />
    </label>
  );
}
