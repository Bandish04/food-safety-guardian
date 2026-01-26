import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const MetricCard = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  variant = 'default',
  className,
}: MetricCardProps) => {
  const variantStyles = {
    default: 'border-border',
    success: 'border-l-4 border-l-success border-t-0 border-r-0 border-b-0',
    warning: 'border-l-4 border-l-warning border-t-0 border-r-0 border-b-0',
    danger: 'border-l-4 border-l-danger border-t-0 border-r-0 border-b-0',
  };

  const changeStyles = {
    positive: 'text-success',
    negative: 'text-danger',
    neutral: 'text-muted-foreground',
  };

  return (
    <div
      className={cn(
        'card-metric bg-card border rounded-lg p-4 shadow-sm',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold font-mono">{value}</p>
          {change && (
            <p className={cn('text-xs font-medium', changeStyles[changeType])}>
              {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-2 rounded-lg bg-muted">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
};
