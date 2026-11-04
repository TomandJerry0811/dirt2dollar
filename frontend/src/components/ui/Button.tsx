import * as React from 'react';
import { cn } from '@/utils';
import { Loader2 } from 'lucide-react';

// ============================================================
// Button Component — Enterprise Design System
// ============================================================

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'link'
  // Legacy aliases kept for backwards compat
  | 'default'
  | 'brand';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon-sm' | 'icon' | 'icon-lg' | 'default';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white shadow-primary hover:bg-[hsl(221,83%,47%)] active:bg-[hsl(221,83%,43%)]',
  default:
    'bg-primary text-white shadow-primary hover:bg-[hsl(221,83%,47%)] active:bg-[hsl(221,83%,43%)]',
  brand:
    'bg-primary text-white shadow-primary hover:bg-[hsl(221,83%,47%)] active:bg-[hsl(221,83%,43%)]',
  secondary:
    'bg-secondary text-foreground border border-border hover:bg-[hsl(210,40%,93%)] active:bg-[hsl(210,40%,91%)]',
  outline:
    'bg-transparent text-foreground border border-border hover:bg-secondary active:bg-[hsl(210,40%,93%)]',
  ghost:
    'bg-transparent text-foreground hover:bg-secondary active:bg-[hsl(210,40%,93%)]',
  destructive:
    'bg-destructive text-white hover:bg-[hsl(0,84%,55%)] active:bg-[hsl(0,84%,50%)]',
  link:
    'bg-transparent text-primary underline-offset-4 hover:underline p-0 h-auto',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm:       'h-8 px-3 text-[12.5px] rounded-md',
  md:       'h-9 px-4 text-[13px] rounded-md',
  lg:       'h-10 px-5 text-[14px] rounded-md',
  default:  'h-9 px-4 text-[13px] rounded-md',
  'icon-sm': 'h-7 w-7 rounded-md',
  icon:     'h-9 w-9 rounded-md',
  'icon-lg': 'h-10 w-10 rounded-md',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium',
          'transition-all duration-150 select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1',
          'disabled:pointer-events-none disabled:opacity-50',
          'active:scale-[0.98]',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin flex-shrink-0" aria-hidden="true" />
        ) : (
          leftIcon && <span className="flex-shrink-0" aria-hidden="true">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && (
          <span className="flex-shrink-0" aria-hidden="true">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
