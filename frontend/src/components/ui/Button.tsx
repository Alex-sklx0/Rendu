import type { ButtonHTMLAttributes } from "react";
import clsx from "@/lib/clsx";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        variant === "primary" ? "btn-primary" : "btn-secondary",
        className
      )}
      {...props}
    />
  );
}
