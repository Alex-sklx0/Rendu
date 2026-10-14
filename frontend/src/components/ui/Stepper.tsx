// Indicador de pasos de un formulario

import clsx from "@/lib/clsx";
import inlineSvg6 from "@/img/check-green.svg";

type Step = {
  label: string;
};

type StepperProps = {
  steps: Step[];
  currentStep: number; // comienza en 0
};

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="stepper">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isPending = index > currentStep;

        return (
          <div key={step.label} className="flex items-center">
            {index > 0 && (
              <div
                className={clsx(
                  "stepper-line",
                  isCompleted && "stepper-line-completed"
                )}
              />
            )}
            <div className="stepper-step">
              <div
                className={clsx(
                  "stepper-circle",
                  (isActive || isCompleted) && "stepper-circle-active",
                  isPending && "stepper-circle-pending"
                )}
              >
                {isCompleted ? (
                  <img src={inlineSvg6} width={"16"} height={"16"} alt="" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={clsx(
                  "stepper-label",
                  (isActive || isCompleted) && "stepper-label-active"
                )}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
