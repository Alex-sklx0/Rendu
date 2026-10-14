// Campo de formulario con etiqueta, mensaje de error y ayuda

import type { ReactNode } from "react";
import inlineSvg3 from "@/img/alert.svg";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  optional?: boolean;
  children: ReactNode;
};

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  optional,
  children,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="field-label">
        {label}
        {required && <span className="text-signal-error ml-0.5">*</span>}
        {optional && <span className="text-ink-700 font-normal ml-1">(opcional)</span>}
      </label>
      {children}
      {error ? (
        <p className="field-error" role="alert">
          <img src={inlineSvg3} width={"14"} height={"14"} className={"flex-shrink-0"} alt="" />
          {error}
        </p>
      ) : hint ? (
        <p className="field-hint">{hint}</p>
      ) : null}
    </div>
  );
}
