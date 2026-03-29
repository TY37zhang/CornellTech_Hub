"use client";

import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { X, CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";

import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:max-w-[360px]",
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center gap-3 overflow-hidden rounded-none border p-4 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "",
        success: "",
        warning: "",
        destructive: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const VARIANT_STYLES = {
  default: {
    light: { bg: "#ffffff", border: "#e0e0e0", text: "#0a0a0a" },
    dark: { bg: "#141414", border: "#333333", text: "#ededed" },
    icon: Info,
    iconColor: { light: "#6b7280", dark: "#9ca3af" },
  },
  success: {
    light: { bg: "#f0fdf4", border: "#86efac", text: "#14532d" },
    dark: { bg: "#052e16", border: "#22633a", text: "#bbf7d0" },
    icon: CheckCircle2,
    iconColor: { light: "#16a34a", dark: "#4ade80" },
  },
  warning: {
    light: { bg: "#fffbeb", border: "#fcd34d", text: "#78350f" },
    dark: { bg: "#2a1a00", border: "#92631a", text: "#fde68a" },
    icon: AlertTriangle,
    iconColor: { light: "#d97706", dark: "#fbbf24" },
  },
  destructive: {
    light: { bg: "#fef2f2", border: "#fca5a5", text: "#7f1d1d" },
    dark: { bg: "#2a0a0a", border: "#7f2d2d", text: "#fecaca" },
    icon: XCircle,
    iconColor: { light: "#dc2626", dark: "#f87171" },
  },
} as const;

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, style, children, ...props }, ref) => {
  const v = (variant || "default") as keyof typeof VARIANT_STYLES;
  const config = VARIANT_STYLES[v] || VARIANT_STYLES.default;
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const colors = isDark ? config.dark : config.light;
  const iconColor = isDark ? config.iconColor.dark : config.iconColor.light;
  const IconComponent = config.icon;

  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
        color: colors.text,
        ...style,
      }}
      {...props}
    >
      <IconComponent
        className="h-5 w-5 shrink-0"
        style={{ color: iconColor }}
      />
      <div className="flex-1">{children}</div>
    </ToastPrimitives.Root>
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-none border px-3 text-sm font-mono font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50",
      "border-current/20 bg-transparent text-inherit hover:bg-current/10",
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-none p-1 opacity-0 transition-opacity focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100",
      className,
    )}
    style={{ color: "inherit", opacity: undefined }}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4 opacity-40 hover:opacity-100 transition-opacity" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold font-mono", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-xs opacity-80", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
