// Componente de input de contraseña con visualizador de reglas y toggle de visibilidad

import React, { forwardRef, useState } from "react";
import inlineSvg4 from "@/img/password-hidden.svg";
import inlineSvg5 from "@/img/password-view.svg";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  showRules?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  {
    id = "password",
    value,
    defaultValue,
    onChange,
    placeholder = "••••••••",
    showRules = false,
    hasError = false,
    className = "",
    autoComplete = "current-password",
    ...rest
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const [internalValue, setInternalValue] = useState(
    typeof value === "string" ? value : typeof defaultValue === "string" ? defaultValue : ""
  );

  const currentValue = typeof value === "string" ? value : internalValue;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInternalValue(e.target.value);
    onChange?.(e);
  }

  // Reglas de validacion
  const minLength = 8;
  const hasMinLength = currentValue.length >= minLength;
  const charsNeeded = minLength - currentValue.length;
  const hasUpperCase = /[A-Z]/.test(currentValue);
  const hasNumber = /[0-9]/.test(currentValue);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_-]/.test(currentValue);

  return (
    <div className="w-full">
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full rounded-2xl border px-4 py-3 pr-11 text-sm font-semibold text-ink-900 placeholder:font-normal placeholder:text-ink-500 focus:outline-none transition-colors ${
            hasError
              ? "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500"
              : "border-surface-400 focus:border-[#23ce6b]"
          } ${className}`}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-ink-400 hover:text-ink-700 transition-colors cursor-pointer"
          title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
          aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
        >
          {showPassword ? (
            <img src={inlineSvg4} width={"18"} height={"18"} alt="" />
          ) : (
            <img src={inlineSvg5} width={"18"} height={"18"} alt="" />
          )}
        </button>
      </div>

      {/* Checklist de requisitos de contraseña cuando está activo */}
      {showRules && (
        <div className="mt-2.5 rounded-3xl border border-surface-400 bg-surface-50 p-3 text-xs space-y-1.5">
          
          {/* Regla de longitud */}
          <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-700 font-semibold" : "text-amber-700"}`}>
            <span>{hasMinLength ? "✓" : "○"}</span>
            <span>
              {hasMinLength
                ? "Mínimo 8 caracteres cumplidos"
                : `Faltan ${charsNeeded} carácter${charsNeeded > 1 ? "es" : ""} para cumplir los 8 mínimos`}
            </span>
          </div>

          {/* Regla de mayuscula */}
          <div className={`flex items-center gap-1.5 ${hasUpperCase ? "text-emerald-700 font-semibold" : "text-amber-700"}`}>
            <span>{hasUpperCase ? "✓" : "○"}</span>
            <span>{hasUpperCase ? "Contiene letra en mayúscula" : "Falta al menos una letra en mayúscula"}</span>
          </div>

          {/* Regla de numeros */}
          <div className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-700 font-semibold" : "text-amber-700"}`}>
            <span>{hasNumber ? "✓" : "○"}</span>
            <span>{hasNumber ? "Contiene al menos un número" : "Falta al menos un número"}</span>
          </div>

          {/* Regla de caracter especial */}
          <div className={`flex items-center gap-1.5 ${hasSpecialChar ? "text-emerald-700 font-semibold" : "text-amber-700"}`}>
            <span>{hasSpecialChar ? "✓" : "○"}</span>
            <span>{hasSpecialChar ? "Contiene carácter especial" : "Falta un carácter especial (ej. !@#$%*_-)"}</span>
          </div>
        </div>
      )}
    </div>
  );
});
