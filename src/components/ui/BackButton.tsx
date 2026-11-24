import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/formatters';

interface BackButtonProps {
  fallbackTo?: string;
  label?: string;
  className?: string;
}

export function BackButton({
  fallbackTo = '/',
  label = 'Back to Home',
  className,
}: BackButtonProps) {
  return (
    <Link
      to={fallbackTo}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] px-3.5 py-2 min-h-[42px] sm:min-h-[36px] text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white active:scale-[0.98] transition-all whitespace-nowrap shrink-0',
        className
      )}
      aria-label={label}
    >
      <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}
