import NumberFlow from "@number-flow/react";
import { cn } from "@/lib/utils"; // Assuming you have shadcn's cn utility
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

interface AnimatedNumberProps {
  initialValue?: number;
  value: number;
  className?: string;
  locale?: string;
  prefix?: string;
  suffix?: string;
  animate?: boolean;
}

export function AnimatedNumber({
  initialValue = 0,
  value,
  className,
  locale = "en-US",
  prefix,
  suffix,
  animate = true,
}: AnimatedNumberProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  const [currentValue, setCurrentValue] = useState(initialValue);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!animate) {
      setCurrentValue(value);
      setHasAnimated(true);
      return;
    }

    if (!inView) {
      setCurrentValue(0);
      setHasAnimated(false);
      return;
    }

    if (inView && !hasAnimated && value !== initialValue) {
      setCurrentValue(value);
      setHasAnimated(true);
    }
  }, [inView, hasAnimated, value, initialValue, animate]);

  return (
    <div
      ref={ref}
      className={cn("inline-block gap-1 font-body tabular-nums", className)}
    >
      {!!prefix && <span className="mr-1">{prefix}</span>}
      <NumberFlow
        value={currentValue}
        locales={locale}
        format={{
          notation: "compact",
          compactDisplay: "short",
          maximumFractionDigits: 2,
        }}
        animated={animate}
      />
      {!!suffix && (
        <span className="ml-1">
          {suffix}
          {value > 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}
