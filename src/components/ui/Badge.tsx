import { cn } from '@/lib/utils';

type BadgeProps = {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'default';
  className?: string;
};

/** Small status badge with semantic colour variants. */
export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    success: 'bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
