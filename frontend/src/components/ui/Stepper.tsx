import clsx from "@/lib/clsx";

type Step = {
  label: string;
};

type StepperProps = {
  steps: Step[];
  currentStep: number; // 0-indexed
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
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
