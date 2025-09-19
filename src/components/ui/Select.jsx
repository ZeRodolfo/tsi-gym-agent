import React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
export const Select = SelectPrimitive.Root;
export const SelectTrigger = React.forwardRef(function (props, ref) {
  const { className = "", children, ...rest } = props;
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={
        "flex h-10 w-full items-center justify-between rounded-xl border border-input bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring " +
        className
      }
      {...rest}
    >
      {children}
      <ChevronDown className="ml-2 h-4 w-4" />
    </SelectPrimitive.Trigger>
  );
});
SelectTrigger.displayName = "SelectTrigger";
export const SelectValue = SelectPrimitive.Value;
export const SelectContent = React.forwardRef(function (props, ref) {
  const { className = "", ...rest } = props;
  return (
    <SelectPrimitive.Content
      ref={ref}
      className={
        "overflow-hidden w-auto bg-white rounded-xl bg-popover text-popover-foreground " +
        className
      }
      {...rest}
    />
  );
});
SelectContent.displayName = "SelectContent";
export const SelectItem = React.forwardRef(function (props, ref) {
  const { className = "", ...rest } = props;
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={
        "relative flex w-full cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground " +
        className
      }
      {...rest}
    >
      <SelectPrimitive.ItemText {...rest} />
      {/* <SelectPrimitive.ItemIndicator className="w-full absolute left-2 inline-flex items-center">
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator> */}
    </SelectPrimitive.Item>
  );
});
SelectItem.displayName = "SelectItem";
