// Logo de Rendu con texto opcional

import iconImg from "@/img/not-found.svg";

interface RenduLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "header";
  showText?: boolean;
  textColor?: string;
}

export function NotFoundLogo({
  className = "",
  size = "md",
  showText = true,
  textColor = "text-[#23ce6b]",
}: RenduLogoProps) {
  const dimensions = {
    sm: { imgClass: "h-6 w-6", font: "text-lg" },
    md: { imgClass: "h-8 w-8", font: "text-2xl" },
    lg: { imgClass: "h-12 w-12", font: "text-3xl" },
    xl: { imgClass: "h-64 w-64", font: "text-4xl" },
    header: { imgClass: "h-20 w-20", font: "text-3xl" },
  }[size];

  return (
    <div className={`inline-flex items-center ${className}`}>
      {/* Logo de 404 */}
      <img
        src={iconImg}
        alt="Not Found Logo"
        className={`${dimensions.imgClass} object-contain flex-shrink-0`}
      />

      {showText && (
        <span className={`font-bold tracking-tight text-6xl ${dimensions.font} ${textColor}`}>
          404
        </span>
      )}
    </div>
  );
}
