import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:     'bg-brand-500/[0.12]  text-brand-400  border border-brand-500/[0.2]',
        secondary:   'bg-white/[0.05]      text-[#a1a1a1]  border border-white/[0.07]',
        destructive: 'bg-red-500/[0.12]    text-red-400    border border-red-500/[0.2]',
        outline:     'bg-transparent       text-[#a1a1a1]  border border-white/[0.12]',
        success:     'bg-accent-500/[0.12] text-accent-400 border border-accent-500/[0.2]',
        warning:     'bg-yellow-500/[0.12] text-yellow-400 border border-yellow-500/[0.2]',
        purple:      'bg-purple-500/[0.12] text-purple-400 border border-purple-500/[0.2]',
        orange:      'bg-orange-500/[0.12] text-orange-400 border border-orange-500/[0.2]',
        cyan:        'bg-cyan-500/[0.12]   text-cyan-400   border border-cyan-500/[0.2]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
