import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          /* Base */
          'flex h-9 w-full rounded-lg px-3 py-2 text-sm',
          /* Colors */
          'bg-[#111111] text-[#ededed] placeholder:text-[#555555]',
          /* Border */
          'border border-white/[0.08]',
          /* Transitions */
          'transition-all duration-150',
          /* Focus */
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-0 focus-visible:border-brand-500/60',
          /* Hover */
          'hover:border-white/[0.12] hover:bg-[#161616]',
          /* File input */
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#ededed]',
          /* Disabled */
          'disabled:cursor-not-allowed disabled:opacity-40',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
