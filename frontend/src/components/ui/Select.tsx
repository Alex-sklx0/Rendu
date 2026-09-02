import { forwardRef, type SelectHTMLAttributes } from "react";
import clsx from "@/lib/clsx";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  hasError?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ hasError, className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={clsx("field-input", hasError && "field-input-error", className)}
      {...props}
    >
      {children}
    </select>
  )
);

Select.displayName = "Select";
