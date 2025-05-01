import React from "react";
export function Card({ className = "", ...props }) {
  return (
    <div
      className={"bg-gray-200 border border-gray-300 text-card-foreground rounded-md shadow " + className}
      {...props}
    />
  );
}
export function CardHeader({ className = "", ...props }) {
  return (
    <div className={"flex flex-col space-y-1.5 p-4 " + className} {...props} />
  );
}
export function CardTitle({ className = "", ...props }) {
  return (
    <h3
      className={"text-lg font-semibold leading-none " + className}
      {...props}
    />
  );
}
export function CardContent({ className = "", ...props }) {
  return <div className={"p-4 pt-0 " + className} {...props} />;
}
export function CardFooter({ className = "", ...props }) {
  return (
    <div className={"flex items-center p-4 pt-0 " + className} {...props} />
  );
}
