import { Dispatch, SetStateAction, useEffect } from "react";
import { parseAsString, useQueryState } from "nuqs";
import useDebouncedState from "./useDebouncedState";

interface DebouncedQState {
  value: string;
  debouncedQValue: string;
  setValue: Dispatch<SetStateAction<string>>;
}

function useDebouncedQState(
  key: string,
  initialValue: string,
  delay = 300,
): DebouncedQState {
  const [qValue, setQValue] = useQueryState(key, parseAsString);
  const { value, setValue, debouncedValue } = useDebouncedState(qValue || initialValue, delay);

  useEffect(() => {
    setQValue(debouncedValue)
  }, [delay, debouncedValue]);

  return {value, debouncedQValue: qValue || "", setValue}
}

export default useDebouncedQState;
