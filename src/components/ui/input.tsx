import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      {...props}
      disabled
      className={cn(
        'w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:opacity-70 disabled:cursor-not-allowed',
        className
      )}
    />
  );
});

Input.displayName = 'Input';
