// Pagina para ingresar y validar el medio de contacto segun el canal seleccionado

import { useMemo, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { actualizarContactoEmpresa } from "@/api/client";
import { RenduLogo } from "@/components/ui/RenduLogo";
import arrowIcon from "@/img/arrow-white.svg";
import { resolveContactMethod } from "@/lib/contactMethods";

type NavigationState = {
  method?: string;
  id_medio?: number;
};

export default function CommunicationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationState = location.state as NavigationState | null;

  const currentMethodName = useMemo(() => {
    const fromSearch = new URLSearchParams(location.search).get("method");
    const fromStorage = localStorage.getItem("selected_contact_method");
    return fromSearch || navigationState?.method || fromStorage || "WhatsApp";
  }, [location.search, navigationState?.method]);

  const currentMedioId = useMemo(() => {
    const fromStorage = localStorage.getItem("selected_contact_method_id");
    return navigationState?.id_medio ?? (fromStorage ? Number(fromStorage) : 1);
  }, [navigationState?.id_medio]);

  const config = useMemo(() => resolveContactMethod(currentMethodName), [currentMethodName]);

  const getUserEmail = () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        return parsed.email || "";
      }
    } catch {
      // ignorar
    }
    return "";
  };

  const isEmailMethod = useMemo(() => {
    const norm = currentMethodName.toLowerCase().trim();
    return config.id === "Correo" || norm.includes("correo") || norm.includes("email") || norm.includes("mail");
  }, [config.id, currentMethodName]);

  const [handle, setHandle] = useState(() => {
    if (isEmailMethod) {
      return getUserEmail();
    }
    return "";
  });

  useEffect(() => {
    if (isEmailMethod && !handle) {
      const email = getUserEmail();
      if (email) setHandle(email);
    }
  }, [isEmailMethod]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleInputChange(value: string) {
    setHandle(value);
    if (errorMessage) setErrorMessage(null);
  }

  async function handleContinue() {
    const validation = config.validate(handle);
    if (!validation.valid) {
      setErrorMessage(validation.error || "El formato ingresado no es válido.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    const contactoLimpio = handle.trim();

    try {
      const storedUser = localStorage.getItem("user");
      const currentUser = storedUser ? JSON.parse(storedUser) : null;

      if (currentUser?.id_empresa) {
        await actualizarContactoEmpresa(currentUser.id_empresa, {
          id_medio_contacto: currentMedioId,
          contacto: contactoLimpio,
        });
      }

      if (currentUser) {
        currentUser.medio_contacto = config.id;
        currentUser.contacto = contactoLimpio;
        localStorage.setItem("user", JSON.stringify(currentUser));
      }

      navigate("/catalog");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Error al guardar el medio de contacto.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[90vh] items-center justify-center bg-[#eef2f0] px-4 py-10">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white p-8 shadow-xl sm:p-14">
        <div className="pointer-events-none absolute left-6 top-6 h-12 w-24 rounded-tl-2xl border-l-4 border-t-4 border-[#23ce6b]" />
        <div className="pointer-events-none absolute bottom-6 left-6 h-16 w-36 rounded-bl-2xl border-b-4 border-l-4 border-[#23ce6b]" />

        <div className="mb-6 flex justify-center">
          <RenduLogo size="lg" />
        </div>

        <div className="relative z-10 mx-auto mb-8 max-w-xl text-center">
          <h1 className="text-2xl font-extrabold leading-snug text-ink-900 sm:text-3xl">
            {config.title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-600 sm:text-base">
            {config.subtitle}
          </p>
        </div>

        {errorMessage && (
          <div className="relative z-10 mx-auto mb-6 max-w-lg rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="relative z-10 mx-auto my-8 max-w-lg">
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr ${config.gradient} p-0.5 shadow-md`}>
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white">
                <img src={config.icon} alt={config.name} width={30} height={30} />
              </div>
            </div>

            <div className="w-full flex-1">
              <input
                id="contacto-input"
                type="text"
                value={handle}
                onChange={(event) => handleInputChange(event.target.value)}
                placeholder={config.placeholder}
                className={`w-full rounded-2xl border bg-white px-5 py-3.5 text-base text-ink-900 shadow-xs transition-colors placeholder:text-ink-300 focus:outline-none ${
                  errorMessage
                    ? "border-red-400 ring-2 ring-red-100 focus:border-red-500"
                    : "border-surface-300 focus:border-[#23ce6b]"
                }`}
              />
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-10 flex flex-col items-center justify-between gap-4pt-6 sm:flex-row">
          <Link
            to="/communication-method"
            className="inline-flex items-center gap-2 rounded-full border border-surface-300 bg-surface-100 px-5 py-2.5 text-[16px] font-bold text-ink-700 transition-colors hover:bg-surface-200"
          >
            Volver atrás
          </Link>

          <button
            type="button"
            onClick={handleContinue}
            disabled={isSubmitting}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#23ce6b] px-8 py-3.5 text-lg font-bold text-white shadow-sm transition-all hover:bg-[#1fb85f] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {isSubmitting ? "Guardando..." : "Guardar y continuar"}
            <img src={arrowIcon} width="18" height="18" alt="" />
          </button>
        </div>
      </div>
    </div>
  );
}
