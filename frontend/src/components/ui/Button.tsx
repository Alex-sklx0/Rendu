import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "@/lib/clsx";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  iconRight?: ReactNode;
  iconLeft?: ReactNode;
};

export function Button({
  variant = "primary",
  iconRight,
  iconLeft,
  className,
  children,
  ...props
}: ButtonProps) {
  const base =
    variant === "primary"
      ? "btn-primary"
      : variant === "secondary"
        ? "btn-secondary"
        : "btn-ghost";

  return (
    <button className={clsx(base, className)} {...props}>
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
