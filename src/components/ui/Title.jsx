import React from "react";
export const Title = React.forwardRef(function (props, ref) {
  const { className = "", ...rest } = props;
  return (
    <h4
      ref={ref}
      className={
        "font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 " +
        className
      }
      {...rest}
    />
  );
});
Title.displayName = "Title";
