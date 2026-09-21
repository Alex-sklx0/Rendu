// Pantalla de bienvenida con el logo

import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import iconImg from "@/img/icon.png";

export default function SplashPage() {
  const navigate = useNavigate();

    useEffect(() => {
    // Redirecciona automáticamente a splash1 después de 5 segundos
    const timer = setTimeout(() => {
      navigate("/splash1");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#eef2f0] px-4 select-none">
      {/* Logo de Rendu */}
      <Link
        to="/splash1"
        className="group flex flex-col items-center justify-center transition-transform duration-300 "
      >
        <img
          src={iconImg}
          alt="Rendu"
          className="h-80 w-80 object-contain sm:h-80 sm:w-80 drop-shadow-sm"
        />
        <span className="mt-4 text-3xl font-extrabold tracking-tight text-[#23ce6b] sm:text-4xl">
          Rendu
        </span>
      </Link>


    </div>
  );
}
