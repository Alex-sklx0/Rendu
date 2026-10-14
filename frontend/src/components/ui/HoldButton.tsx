import { useEffect, useId, useRef, useState } from "react";
import "./HoldButton.css";

type HoldButtonProps = {
  children?: React.ReactNode;
  doneLabel?: string;
  icon?: React.ReactNode;
  doneIcon?: React.ReactNode;
  holdTime?: number;
  resetAfter?: number;
  disabled?: boolean;
  onHold?: () => void | Promise<void>;
  className?: string;
  title?: string;
};

export default function HoldButton({
  children = "Mantén presionado",
  doneLabel = "Eliminado",
  icon = null,
  doneIcon = null,
  holdTime = 2000,
  resetAfter = 1200,
  disabled = false,
  onHold,
  className = "",
  title,
}: HoldButtonProps) {
  const [phase, setPhase] = useState<"idle" | "holding" | "done">("idle");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const phaseRef = useRef(phase);
  const pointerId = useRef<number | null>(null);
  const startRef = useRef(0);
  const rafRef = useRef(0);
  const resetRef = useRef(0);
  const hintId = useId();

  phaseRef.current = phase;

  const setProgress = (value: number) => {
    buttonRef.current?.style.setProperty("--hb-p", value.toFixed(4));
  };

  const stopProgress = () => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
  };

  const reset = () => {
    stopProgress();
    setPhase("idle");
    setProgress(0);
  };

  const complete = () => {
    if (phaseRef.current !== "holding") return;
    stopProgress();
    setPhase("done");
    onHold?.();
    if (resetAfter > 0) resetRef.current = window.setTimeout(reset, resetAfter);
  };

  const animateProgress = () => {
    const progress = Math.min(1, (performance.now() - startRef.current) / holdTime);
    setProgress(progress);
    if (progress < 1 && phaseRef.current === "holding") {
      rafRef.current = requestAnimationFrame(animateProgress);
    } else if (progress >= 1) {
      complete();
    }
  };

  const begin = () => {
    if (disabled || phaseRef.current !== "idle") return;
    setPhase("holding");
    startRef.current = performance.now();
    rafRef.current = requestAnimationFrame(animateProgress);
  };

  const release = (event?: React.PointerEvent<HTMLButtonElement>) => {
    if (event && pointerId.current !== event.pointerId) return;
    if (phaseRef.current !== "holding") return;
    pointerId.current = null;
    stopProgress();
    setPhase("idle");
    setProgress(0);
  };

  useEffect(() => () => {
    stopProgress();
    window.clearTimeout(resetRef.current);
  }, []);

  return (
    <button
      ref={buttonRef}
      type="button"
      disabled={disabled}
      className={`hold-button hold-button--sm${className ? ` ${className}` : ""}`}
      data-phase={phase}
      aria-describedby={hintId}
      title={title}
      onPointerDown={(event) => {
        if (event.button !== 0 || !event.isPrimary) return;
        pointerId.current = event.pointerId;
        event.currentTarget.setPointerCapture(event.pointerId);
        begin();
      }}
      onPointerMove={(event) => {
        if (pointerId.current !== event.pointerId) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const outside =
          event.clientX < rect.left - 10 ||
          event.clientX > rect.right + 10 ||
          event.clientY < rect.top - 10 ||
          event.clientY > rect.bottom + 10;
        if (outside) release(event);
      }}
      onPointerUp={(event) => release(event)}
      onPointerCancel={(event) => release(event)}
      onLostPointerCapture={(event) => release(event)}
      onKeyDown={(event) => {
        if ((event.key === " " || event.key === "Enter") && !event.repeat) {
          event.preventDefault();
          begin();
        }
        if (event.key === "Escape") release();
      }}
      onKeyUp={(event) => {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          release();
        }
      }}
      onContextMenu={(event) => event.preventDefault()}
    >
      <span className="hold-button__pulse" aria-hidden="true" />
      <span className="hold-button__label">
        <span className="hold-button__idle">
          {icon ? <span className="hold-button__icon">{icon}</span> : null}
          {children}
        </span>
        <span className="hold-button__done" aria-hidden={phase !== "done"}>
          {doneIcon ? <span className="hold-button__icon">{doneIcon}</span> : null}
          {doneLabel}
        </span>
      </span>
      <span className="hold-button__clip" aria-hidden="true">
        <span className="hold-button__fill">
          <span className="hold-button__label hold-button__label--fill">
            <span className="hold-button__idle">{children}</span>
            <span className="hold-button__done">{doneLabel}</span>
          </span>
        </span>
      </span>
      <span id={hintId} className="hold-button__sr">
        Mantén presionado durante {Math.round(holdTime / 100) / 10} segundos para confirmar
      </span>
    </button>
  );
}
