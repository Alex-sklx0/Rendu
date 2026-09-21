// Logo de Rendu con texto opcional

import iconImg from "@/img/icon.png";

interface RenduLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "header";
  showText?: boolean;
  textColor?: string;
}

export function RenduLogo({
  className = "",
  size = "md",
  showText = true,
  textColor = "text-[#23ce6b]",
}: RenduLogoProps) {
  const dimensions = {
    sm: { imgClass: "h-6 w-6", font: "text-lg" },
    md: { imgClass: "h-8 w-8", font: "text-2xl" },
    lg: { imgClass: "h-12 w-12", font: "text-3xl" },
    xl: { imgClass: "h-24 w-24", font: "text-4xl" },
    header: { imgClass: "h-20 w-20", font: "text-3xl" },
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Logo de Rendu */}
      <img
        src={iconImg}
        alt="Rendu Logo"
        className={`${dimensions.imgClass} object-contain flex-shrink-0`}
      />

      {showText && (
        <span className={`font-bold tracking-tight ${dimensions.font} ${textColor}`}>
          Rendu
        </span>
      )}
    </div>
  );
}
