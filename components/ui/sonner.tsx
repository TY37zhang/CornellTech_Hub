"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-surface group-[.toaster]:text-t1 group-[.toaster]:border-subtle group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-t3",
          actionButton: "group-[.toast]:bg-cta group-[.toast]:text-cta",
          cancelButton:
            "group-[.toast]:bg-surface-active group-[.toast]:text-t2",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
