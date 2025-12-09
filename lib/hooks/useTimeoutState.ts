import { useEffect, useState } from "react";

export function useTimeoutState(initialValue: boolean, duration: number = 2000) {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    if (state === true) {
      const timer = setTimeout(() => setState(false), duration);
      return () => clearTimeout(timer);
    }
  }, [state, duration]);

  return [state, setState] as const;
}
