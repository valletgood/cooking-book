"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="light"
      position="bottom-center"
      style={
        {
          "--normal-bg": "var(--color-cottage-text)",
          "--normal-text": "var(--color-cottage-bg)",
          "--normal-border": "var(--color-cottage-border)",
          "--border-radius": "0.75rem",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export { Toaster };
