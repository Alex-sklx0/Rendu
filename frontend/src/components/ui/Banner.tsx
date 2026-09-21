// Banner para mostrar mensajes de exito o error

import clsx from "@/lib/clsx";

type BannerProps = {
  variant: "success" | "error";
  children: React.ReactNode;
};

export function Banner({ variant, children }: BannerProps) {
  return (
    <div
      role="status"
      className={clsx(
        "banner border px-4 py-3 text-sm",
        variant === "success"
          ? "border-forest-500 bg-forest-700/5 text-forest-800"
          : "border-signal-error bg-signal-error/5 text-signal-error"
      )}
    >
      {children}
    </div>
  );
}
