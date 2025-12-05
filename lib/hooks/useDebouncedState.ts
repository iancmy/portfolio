import { useState, useEffect, Dispatch, SetStateAction } from "react";

interface DebouncedState<T> {
  value: T;
  debouncedValue: T;
  setValue: Dispatch<SetStateAction<T>>;
}

function useDebouncedState<T>(
  initialValue: T,
  delay = 300,
): DebouncedState<T> {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [delay, value]);

  return { value, debouncedValue, setValue };
}

export default useDebouncedState;
