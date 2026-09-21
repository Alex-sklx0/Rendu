import { forwardRef, type InputHTMLAttributes } from "react";
import clsx from "@/lib/clsx";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ hasError, className, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx("field-input", hasError && "field-input-error", className)}
      {...props}
    />
  )
);

Input.displayName = "Input";
