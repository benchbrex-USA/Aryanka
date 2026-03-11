import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium',
    'transition-all duration-150 select-none cursor-pointer',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:ring-offset-1 focus-visible:ring-offset-[#0a0a0a]',
    'disabled:pointer-events-none disabled:opacity-40',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        /* Primary — filled brand blue */
        default: [
          'bg-brand-500 text-white rounded-lg',
          'hover:bg-brand-400 active:bg-brand-600',
          'shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]',
          'hover:shadow-[0_2px_8px_rgba(59,130,246,0.4)]',
        ].join(' '),

        /* Secondary — subtle surface */
        secondary: [
          'bg-[#1a1a1a] text-[#ededed] rounded-lg border border-white/[0.08]',
          'hover:bg-[#222] hover:border-white/[0.12] active:bg-[#1a1a1a]',
          'shadow-[0_1px_2px_rgba(0,0,0,0.4)]',
        ].join(' '),

        /* Outline — bordered ghost */
        outline: [
          'bg-transparent text-[#ededed] rounded-lg border border-white/[0.12]',
          'hover:bg-white/[0.04] hover:border-white/[0.18] active:bg-white/[0.02]',
        ].join(' '),

        /* Ghost — no background */
        ghost: [
          'bg-transparent text-[#a1a1a1] rounded-lg',
          'hover:bg-white/[0.06] hover:text-[#ededed] active:bg-white/[0.04]',
        ].join(' '),

        /* Destructive */
        destructive: [
          'bg-red-500/10 text-red-400 rounded-lg border border-red-500/20',
          'hover:bg-red-500/20 hover:border-red-500/30 active:bg-red-500/10',
        ].join(' '),

        /* Accent / green */
        accent: [
          'bg-accent-500 text-white rounded-lg',
          'hover:bg-accent-400 active:bg-accent-600',
          'shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]',
          'hover:shadow-[0_2px_8px_rgba(16,185,129,0.35)]',
        ].join(' '),

        /* Gradient */
        gradient: [
          'bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-lg',
          'hover:from-brand-400 hover:to-accent-400 active:from-brand-600 active:to-accent-600',
          'shadow-[0_1px_2px_rgba(0,0,0,0.5)]',
          'hover:shadow-[0_4px_16px_rgba(59,130,246,0.35)]',
        ].join(' '),

        /* Link */
        link: 'text-brand-400 underline-offset-4 hover:underline hover:text-brand-300 rounded',
      },
      size: {
        xs:      'h-7  px-2.5  text-xs  [&_svg]:size-3',
        sm:      'h-8  px-3    text-xs  [&_svg]:size-3.5',
        default: 'h-9  px-4    text-sm  [&_svg]:size-4',
        md:      'h-10 px-4    text-sm  [&_svg]:size-4',
        lg:      'h-11 px-5    text-sm  [&_svg]:size-4',
        xl:      'h-12 px-6    text-base [&_svg]:size-5',
        icon:    'h-8  w-8  rounded-lg [&_svg]:size-4',
        'icon-sm':'h-7 w-7  rounded-md [&_svg]:size-3.5',
        'icon-lg':'h-10 w-10 rounded-lg [&_svg]:size-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
