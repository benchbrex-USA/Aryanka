'use client';

import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cva, type VariantProps } from 'class-variance-authority';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const ToastProvider = ToastPrimitives.Provider;

/* ─── Viewport ───────────────────────────────────────────── */
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-h-screen w-full max-w-sm',
      'sm:bottom-6 sm:right-6',
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

/* ─── Variants ───────────────────────────────────────────── */
const toastVariants = cva(
  [
    'group pointer-events-auto relative flex w-full items-start gap-3',
    'overflow-hidden rounded-xl border p-4 pr-10',
    'shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.04)_inset]',
    'backdrop-blur-md transition-all duration-300',
    'data-[swipe=cancel]:translate-x-0',
    'data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]',
    'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[swipe=end]:animate-out',
    'data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full',
    'data-[state=open]:slide-in-from-bottom-full',
  ].join(' '),
  {
    variants: {
      variant: {
        default:     'bg-[#1a1a1a]      border-white/[0.1]  text-[#ededed]',
        success:     'bg-[#0d1f17]      border-accent-500/30 text-[#ededed]',
        destructive: 'bg-[#1f0d0d]      border-red-500/30    text-[#ededed]',
        warning:     'bg-[#1f1a0d]      border-yellow-500/30 text-[#ededed]',
        info:        'bg-[#0d1220]      border-brand-500/30  text-[#ededed]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

/* ─── Icon map ───────────────────────────────────────────── */
const toastIcons = {
  default:     <Info className="h-4 w-4 text-[#666] mt-0.5 shrink-0" />,
  success:     <CheckCircle2 className="h-4 w-4 text-accent-400 mt-0.5 shrink-0" />,
  destructive: <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />,
  warning:     <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />,
  info:        <Info className="h-4 w-4 text-brand-400 mt-0.5 shrink-0" />,
};

/* ─── Toast ──────────────────────────────────────────────── */
const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant = 'default', children, ...props }, ref) => (
  <ToastPrimitives.Root
    ref={ref}
    className={cn(toastVariants({ variant }), className)}
    {...props}
  >
    {toastIcons[variant ?? 'default']}
    <div className="flex-1 min-w-0">{children}</div>
  </ToastPrimitives.Root>
));
Toast.displayName = ToastPrimitives.Root.displayName;

/* ─── Action ─────────────────────────────────────────────── */
const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      'inline-flex h-7 shrink-0 items-center justify-center rounded-md',
      'border border-white/[0.1] bg-white/[0.05] px-3 text-xs font-medium',
      'transition-colors hover:bg-white/[0.08]',
      'focus:outline-none focus:ring-2 focus:ring-brand-500/50',
      'disabled:pointer-events-none disabled:opacity-40',
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

/* ─── Close ──────────────────────────────────────────────── */
const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      'absolute right-2.5 top-2.5 rounded-md p-1',
      'text-[#555] opacity-0 transition-all duration-150',
      'hover:text-[#ededed] hover:bg-white/[0.06]',
      'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50',
      'group-hover:opacity-100',
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-3.5 w-3.5" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

/* ─── Title ──────────────────────────────────────────────── */
const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn('text-sm font-semibold text-[#ededed] leading-snug', className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

/* ─── Description ────────────────────────────────────────── */
const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn('text-xs text-[#888] mt-0.5 leading-relaxed', className)}
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
