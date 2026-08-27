import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useDebounceCallback } from "@/hooks/useDebounce";

interface DebouncedInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange"
  > {
  value: string;
  onValueChange: (value: string) => void;
  debounceDelay?: number;
}

const DebouncedInput = React.forwardRef<HTMLInputElement, DebouncedInputProps>(
  ({ value, onValueChange, debounceDelay = 500, onBlur, ...props }, ref) => {
    const [localValue, setLocalValue] = useState<string>(value);

    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    const debouncedChange = useDebounceCallback((val: string) => {
      onValueChange(val);
    }, debounceDelay);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      debouncedChange(newValue);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      onValueChange(localValue);
      if (onBlur) onBlur(e);
    };

    return (
      <Input
        {...props}
        ref={ref}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    );
  }
);

export default DebouncedInput;
