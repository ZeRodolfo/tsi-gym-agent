import React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva } from "class-variance-authority";

const tabsListStyles = cva("flex border-b border-border");
export const Tabs = TabsPrimitive.Root;
export function TabsList({ className = "", ...props }) {
  return (
    <TabsPrimitive.List className={tabsListStyles({ className })} {...props} />
  );
}
export const TabsTrigger = React.forwardRef(function (props, ref) {
  const { className = "", ...rest } = props;
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={
        "px-3 py-1.5 text-md font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary " +
        className
      }
      {...rest}
    />
  );
});
TabsTrigger.displayName = "TabsTrigger";
export const TabsContent = React.forwardRef(function (props, ref) {
  const { className = "", ...rest } = props;
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={"mt-2 outline-none " + className}
      {...rest}
    />
  );
});
TabsContent.displayName = "TabsContent";
