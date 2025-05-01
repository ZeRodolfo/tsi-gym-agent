import React from "react";
export const Label = React.forwardRef(function (props, ref) {
  const { className = "", ...rest } = props;
  return (
    <label
      ref={ref}
      className={
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 " +
        className
      }
      {...rest}
    />
  );
});
Label.displayName = "Label";
