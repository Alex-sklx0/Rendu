// Pantalla de bienvenida con el logo

import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import renduIcon from "@/img/rendu-icon.svg";

export default function SplashPage() {
  const navigate = useNavigate();

    useEffect(() => {
    // Redirecciona automáticamente a splash1 después de 5 segundos
    const timer = setTimeout(() => {
      navigate("/splash1");
    }, 7000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 select-none">
      {/* Logo de Rendu */}
      <Link
        to="/splash1"
        className="flex flex-col items-center justify-center"
      >
        <img
          src={renduIcon}
          alt="Rendu"
          className="h-64 w-64 object-contain sm:h-72 sm:w-72"
        />
        <span className="mt-4 text-3xl font-extrabold tracking-tight text-[#23ce6b] sm:text-4xl">
          Rendu
        </span>
      </Link>
    </div>
  );
}
