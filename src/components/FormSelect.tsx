// FormSelect.tsx — menú desplegable reutilizable, mismo lenguaje visual
// que FormInput / ResetButton (flecha propia, glow de foco).
import { useState, type SelectHTMLAttributes, type ReactNode } from "react";
import { colors } from "../theme/colors";

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: ReactNode;
}

export function FormSelect({ label, style, children, ...props }: FormSelectProps) {
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
      <div style={{ position: "relative" }}>
        <select
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
            padding: "10px 36px 10px 14px",
            fontSize: "14px",
            borderRadius: "10px",
            border: `1px solid ${focused ? colors.primary : colors.border}`,
            background: colors.card,
            color: colors.text,
            outline: "none",
            appearance: "none",
            WebkitAppearance: "none",
            boxShadow: focused
              ? `0 0 0 3px ${colors.primary}33, inset 0 1px 2px rgba(0,0,0,0.3)`
              : "inset 0 1px 2px rgba(0,0,0,0.3)",
            transition: "all 0.15s ease",
            cursor: "pointer",
            boxSizing: "border-box",
            ...style,
          }}
        >
          {children}
        </select>
        <span
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            color: colors.textMuted,
            fontSize: "11px",
          }}
        >
          ▼
        </span>
      </div>
    </label>
  );
}
