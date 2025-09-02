import * as React from "react";

export function FullWidth({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.ComponentProps<"div">) {
  return (
    <div className="rounded-lg border p-4" {...props}>
      {children}
    </div>
  );
}
