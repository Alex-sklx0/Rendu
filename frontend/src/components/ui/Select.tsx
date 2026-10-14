// Selector desplegable reutilizable

import {
  Children,
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type SelectHTMLAttributes,
} from "react";
import clsx from "@/lib/clsx";
import "./Select.css";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  hasError?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ hasError, className, children, value, defaultValue, onChange, disabled, ...props }, ref) => {
    const id = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const selectRef = useRef<HTMLSelectElement | null>(null);
    const [open, setOpen] = useState(false);
    const [internalValue, setInternalValue] = useState(String(defaultValue ?? ""));
    const currentValue = value === undefined ? internalValue : String(value);
    const options = Children.toArray(children).filter(
      (child): child is React.ReactElement<{ value?: string; disabled?: boolean; children?: React.ReactNode }> =>
        typeof child === "object" && child !== null && "type" in child,
    );
    const optionValue = (option: (typeof options)[number]) =>
      String(option.props.value ?? option.props.children ?? "");
    const selectedOption = options.find((option) => optionValue(option) === currentValue);
    const label = selectedOption?.props.children ?? "Selecciona una opción";

    useEffect(() => {
      const close = (event: PointerEvent) => {
        if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
      };
      document.addEventListener("pointerdown", close);
      return () => document.removeEventListener("pointerdown", close);
    }, []);

    const choose = (nextValue: string, optionDisabled?: boolean) => {
      if (optionDisabled || disabled || !selectRef.current) return;
      selectRef.current.value = nextValue;
      setInternalValue(nextValue);
      selectRef.current.dispatchEvent(new Event("change", { bubbles: true }));
      setOpen(false);
    };

    return (
      <div ref={rootRef} className={clsx("glide-select", className)}>
        <select
          {...props}
          ref={(element) => {
            selectRef.current = element;
            if (typeof ref === "function") ref(element);
            else if (ref) ref.current = element;
          }}
          value={value}
          defaultValue={defaultValue}
          onChange={(event) => {
            setInternalValue(event.target.value);
            onChange?.(event);
          }}
          disabled={disabled}
          className="glide-select__native"
          aria-hidden="true"
          tabIndex={-1}
        >
          {children}
        </select>
        <button
          type="button"
          className={clsx("glide-select__trigger", hasError && "glide-select__trigger-error")}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${id}-options`}
          disabled={disabled}
          onClick={() => setOpen((isOpen) => !isOpen)}
        >
          <span className={clsx(!selectedOption && "glide-select__placeholder")}>{label}</span>
          <span className="glide-select__chevron" aria-hidden="true">⌄</span>
        </button>
        {open && (
          <div className="glide-select__menu" id={`${id}-options`} role="listbox">
            <div className="glide-select__list">
              {options.map((option, index) => {
                const valueForOption = optionValue(option);
                const isSelected = valueForOption === currentValue;
                return (
                  <button
                    key={`${valueForOption}-${index}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={clsx("glide-select__option", isSelected && "glide-select__option-selected")}
                    onClick={() => choose(valueForOption, option.props.disabled)}
                  >
                    <span>{option.props.children}</span>
                    {isSelected && <span aria-hidden="true">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
