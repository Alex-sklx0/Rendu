import { forwardRef, type TextareaHTMLAttributes } from "react";
import clsx from "@/lib/clsx";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  hasError?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ hasError, className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={clsx("field-input min-h-[120px] resize-y", hasError && "field-input-error", className)}
      {...props}
    />
  )
);

Textarea.displayName = "Textarea";
