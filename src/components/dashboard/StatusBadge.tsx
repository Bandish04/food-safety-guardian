import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'pass' | 'fail' | 'warning' | 'pending';
  label?: string;
  className?: string;
}

export const StatusBadge = ({ status, label, className }: StatusBadgeProps) => {
  const statusConfig = {
    pass: {
      label: label || 'Pass',
      classes: 'status-pass',
    },
    fail: {
      label: label || 'Fail',
      classes: 'status-fail',
    },
    warning: {
      label: label || 'Warning',
      classes: 'status-warning',
    },
    pending: {
      label: label || 'Pending',
      classes: 'status-pending',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.classes,
        className
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full mr-1.5',
          status === 'pass' && 'bg-success',
          status === 'fail' && 'bg-danger',
          status === 'warning' && 'bg-warning',
          status === 'pending' && 'bg-muted-foreground'
        )}
      />
      {config.label}
    </span>
  );
};
