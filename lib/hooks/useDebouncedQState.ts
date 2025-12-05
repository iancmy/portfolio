import { Dispatch, SetStateAction, useEffect } from "react";
import { parseAsString, useQueryState } from "nuqs";
import useDebouncedState from "./useDebouncedState";

interface DebouncedQState {
  value: string;
  debouncedQuery: string;
  setValue: Dispatch<SetStateAction<string>>;
}

function useDebouncedQState(
  key: string,
  initialValue: string,
  delay = 300,
): DebouncedQState {
  const { value, setValue, debouncedValue } = useDebouncedState(initialValue, delay);
  const [qValue, setQValue] = useQueryState(key, parseAsString.withDefault(initialValue));

  useEffect(() => {
    setQValue(debouncedValue)
  }, [delay, debouncedValue]);

  return {value, debouncedQuery: qValue, setValue}
}

export default useDebouncedQState;
