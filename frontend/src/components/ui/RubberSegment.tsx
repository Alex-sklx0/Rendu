import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  forwardRef,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  animate,
  motion,
  motionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import "./RubberSegment.css";

export interface RubberSegmentItem {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface RubberSegmentProps {
  items: RubberSegmentItem[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}

interface MotionValues {
  x: ReturnType<typeof motionValue<number>>;
  sx: ReturnType<typeof motionValue<number>>;
  sy: ReturnType<typeof motionValue<number>>;
}

const spring = (stiffness: number, mass: number, bounce: number) => ({
  type: "spring" as const,
  stiffness,
  damping: 2 * Math.sqrt(stiffness * mass) * (1 - bounce),
  mass,
});

const Chip = forwardRef<
  HTMLButtonElement,
  {
    values: MotionValues;
    children: ReactNode;
    className: string;
    type: "button";
    role: "radio";
    "aria-checked": boolean;
    tabIndex: number;
    onClick: (event: MouseEvent<HTMLButtonElement>) => void;
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  }
>(function Chip(
  {
    values,
    children,
    className,
    type,
    role,
    "aria-checked": ariaChecked,
    tabIndex,
    onClick,
    onKeyDown,
    ...rest
  },
  ref,
) {
  const transform = useTransform(
    () => `translateX(${values.x.get()}px) scale(${values.sx.get()}, ${values.sy.get()})`,
  );

  return (
    <motion.button
      ref={ref}
      className={className}
      type={type}
      role={role}
      aria-checked={ariaChecked}
      tabIndex={tabIndex}
      onClick={onClick}
      onKeyDown={onKeyDown}
      {...rest}
      style={{ transform }}
    >
      {children}
    </motion.button>
  );
});

export function RubberSegment({
  items,
  value,
  onChange,
  ariaLabel,
}: RubberSegmentProps) {
  const selectedIndex = items.findIndex((item) => item.value === value);
  const reduceMotion = useReducedMotion();
  const groupRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const widths = useRef<number[]>([]);
  const values = useRef<MotionValues[]>([]);
  const appliedIndex = useRef(selectedIndex);
  const [fontReady, setFontReady] = useState(false);

  useEffect(() => {
    document.fonts?.ready.then(() => setFontReady(true));
  }, []);

  const valuesFor = (index: number): MotionValues => {
    if (!values.current[index]) {
      values.current[index] = {
        x: motionValue(0),
        sx: motionValue(1),
        sy: motionValue(1),
      };
    }
    return values.current[index];
  };

  const measure = () => {
    const group = groupRef.current;
    if (!group) return;

    widths.current = chipRefs.current.map((chip) => chip?.offsetWidth ?? 0);
    const chipHeight = chipRefs.current[0]?.offsetHeight ?? 0;
    const maxWidth = Math.max(0, ...widths.current);
    group.style.setProperty("--rs-pad-x", `${Math.ceil((maxWidth * 0.2 * 1.3) / 2 + 6) + 2}px`);
    group.style.setProperty("--rs-pad-y", `${Math.ceil((chipHeight * 0.2) / 2) + 2}px`);
  };

  const apply = (index: number, instant: boolean) => {
    const group = groupRef.current;
    const isRtl = group
      ? getComputedStyle(group).direction === "rtl"
      : false;
    const selectedWidth = widths.current[index] ?? 0;
    const push = (selectedWidth * 0.2) / 2 + 6;

    for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
      const motionValues = valuesFor(itemIndex);
      motionValues.x.stop();
      motionValues.sx.stop();
      motionValues.sy.stop();
      const active = index >= 0 && itemIndex === index;
      const distance = Math.abs(itemIndex - index);
      const direction = Math.sign(itemIndex - index) * (isRtl ? -1 : 1);
      const scale = index < 0 ? 1 : active ? 1.2 : 0.95;
      const x = index < 0 ? 0 : direction * push;

      if (instant || reduceMotion) {
        motionValues.x.jump(x);
        motionValues.sx.jump(scale);
        motionValues.sy.jump(scale);
        continue;
      }

      const stiffness = 580 * (1 - 0.12 * Math.min(distance, 3));
      const delay = (distance * 22) / 1000;
      animate(motionValues.x, x, { ...spring(stiffness, 0.9, 0.25), delay });
      animate(motionValues.sx, scale, {
        ...spring(stiffness * 1.24, 0.8, 0.55),
        delay,
      });
      animate(motionValues.sy, scale, {
        ...spring(stiffness * 0.86, 0.95, 0.25),
        delay: delay + 0.05,
      });
    }
  };

  useLayoutEffect(() => {
    const settle = () => {
      measure();
      apply(appliedIndex.current, true);
    };

    settle();
    const observer = new ResizeObserver(settle);
    if (groupRef.current) observer.observe(groupRef.current);
    return () => observer.disconnect();
    // The item list and visual configuration are fixed for this navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, fontReady]);

  useEffect(() => {
    if (appliedIndex.current === selectedIndex) return;
    appliedIndex.current = selectedIndex;
    measure();
    apply(selectedIndex, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex]);

  useEffect(
    () => () => {
      values.current.forEach((motionValues) => {
        motionValues.x.stop();
        motionValues.sx.stop();
        motionValues.sy.stop();
      });
    },
    [],
  );

  const commit = (index: number) => {
    if (index === selectedIndex || !items[index]) return;
    appliedIndex.current = index;
    measure();
    apply(index, false);
    onChange(items[index].value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = Math.min(items.length - 1, index + 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = Math.max(0, index - 1);
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = items.length - 1;
    } else if (event.key === " " || event.key === "Enter") {
      nextIndex = index;
    }

    if (nextIndex === null) return;
    event.preventDefault();
    commit(nextIndex);
    chipRefs.current[nextIndex]?.focus();
  };

  const style = {
    "--rs-gap": "8px",
    "--rs-radius": "18px",
    "--rs-h": "36px",
    "--rs-font": "13px",
    "--rs-px": "16px",
  } as CSSProperties;

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label={ariaLabel}
      className="rubber-segment"
      data-empty={selectedIndex === -1 ? "" : undefined}
      style={style}
    >
      {items.map((item, index) => (
        <Chip
          key={item.value}
          values={valuesFor(index)}
          ref={(element) => {
            chipRefs.current[index] = element;
          }}
          type="button"
          role="radio"
          aria-checked={index === selectedIndex}
          tabIndex={index === selectedIndex || (selectedIndex === -1 && index === 0) ? 0 : -1}
          className="rubber-segment__chip"
          onClick={() => commit(index)}
          onKeyDown={(event) => handleKeyDown(event, index)}
        >
          <span className="rubber-segment__skin">
            {item.icon && <span className="rubber-segment__icon">{item.icon}</span>}
            <span className="rubber-segment__label">{item.label}</span>
          </span>
        </Chip>
      ))}
    </div>
  );
}
