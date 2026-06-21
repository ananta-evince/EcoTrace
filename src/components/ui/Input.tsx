import { cn } from '@/lib/utils';
import { forwardRef, type InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

/** Accessible labelled text input with optional error message. */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, required, ...props }, ref) => {
    const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s/g, '-');
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="space-y-1">
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
          {required && (
            <span className="ml-1 text-carbon-high" aria-hidden="true">
              *
            </span>
          )}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={cn(
            'w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 transition-all duration-200',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
            'dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100',
            error && 'border-carbon-high',
            className,
          )}
          {...props}
        />
        {error && (
          <p id={errorId} className="flex items-center gap-1 text-sm text-carbon-high" role="alert">
            <span aria-hidden="true">⚠</span> {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';
