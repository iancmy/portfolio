import { useEffect, useState } from "react";

export function useClearState<T>(initialValue: T, duration: number = 2000) {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => setState(initialValue), duration);
    return () => clearTimeout(timer);
  }, [state, duration]);

  return [state, setState] as const;
}
