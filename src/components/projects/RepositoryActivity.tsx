import { History } from 'lucide-react';
import type { ProjectActivity } from '../../types/models';
import { formatDateTime } from '../../utils/formatters';
import { EmptyState } from '../ui/EmptyState';

interface RepositoryActivityProps {
  activities: ProjectActivity[];
}

export function RepositoryActivity({ activities }: RepositoryActivityProps) {
  if (activities.length === 0) {
    return (
      <EmptyState
        icon={<History className="w-5 h-5" />}
        title="No project activity recorded"
        description="Activity entries appear here when releases are published, documentation is updated, or manual logs are added."
      />
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] divide-y divide-slate-100 dark:divide-slate-800">
      {activities.map((item) => (
        <div
          key={item.id}
          className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
        >
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-blue-600 dark:text-blue-400">{item.type}</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{item.source}</span>
            </div>
            <h3 className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              {item.title}
            </h3>
            {item.description && (
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{item.description}</p>
            )}
          </div>
          <time className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
            {formatDateTime(item.timestamp)}
          </time>
        </div>
      ))}
    </div>
  );
}
