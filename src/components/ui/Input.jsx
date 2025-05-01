import React from "react";
export const Input = React.forwardRef(function (props, ref) {
  const { className = "", ...rest } = props;
  return (
    <input
      ref={ref}
      className={
        "flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring " +
        className
      }
      {...rest}
    />
  );
});
Input.displayName = "Input";
