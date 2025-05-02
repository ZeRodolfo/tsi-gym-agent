import React from "react";
import { cva } from "class-variance-authority";

const buttonStyles = cva(
  "inline-flex items-center justify-center rounded-[7px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        outline:
          "border border-input hover:bg-accent hover:text-accent-foreground",
        primary:
          "bg-primary text-white text-primary-foreground hover:bg-primary/90 ",
        secondary:
          "bg-secondary text-white text-secondary-foreground hover:bg-secondary/90",
        success:
          "bg-success text-white text-success-foreground hover:bg-success/90",
        warning:
          "bg-warning text-white text-warning-foreground hover:bg-warning/90",
        error: "bg-error text-white text-error-foreground hover:bg-error/90",
      },
      size: {
        primary: "h-10 px-4 py-2",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "primary",
    },
  }
);

export function Button({ className, variant, size, ...props }) {
  return (
    <button className={buttonStyles({ variant, size, className })} {...props} />
  );
}
