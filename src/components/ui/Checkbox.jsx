import React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
export const Checkbox = React.forwardRef(function (props, ref) {
  const { className = "", ...rest } = props;
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={
        "peer h-4 w-4 rounded border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 " +
        className
      }
      {...rest}
    >
      <CheckboxPrimitive.Indicator>
        <Check className="h-4 w-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});
Checkbox.displayName = "Checkbox";
