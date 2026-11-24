import { useMemo, useState } from 'react';
import { FileDiff } from 'lucide-react';
import type { ChangelogCategory, ChangelogEntry, Release } from '../../types/models';
import { cn, formatDate } from '../../utils/formatters';
import { EmptyState } from '../ui/EmptyState';

interface RepositoryChangelogProps {
  entries: ChangelogEntry[];
  releases: Release[];
}

const CATEGORIES: Array<'All' | ChangelogCategory> = [
  'All',
  'Added',
  'Improved',
  'Fixed',
  'Removed',
  'Security',
];

const CATEGORY_COLORS: Record<ChangelogCategory, string> = {
  Added: 'text-emerald-600 dark:text-emerald-400',
  Improved: 'text-blue-600 dark:text-blue-400',
  Fixed: 'text-amber-600 dark:text-amber-400',
  Removed: 'text-rose-600 dark:text-rose-400',
  Security: 'text-purple-600 dark:text-purple-400',
};

export function RepositoryChangelog({ entries, releases }: RepositoryChangelogProps) {
  const [filter, setFilter] = useState<'All' | ChangelogCategory>('All');

  const filtered = useMemo(() => {
    if (filter === 'All') return entries;
    return entries.filter((e) => e.category === filter);
  }, [entries, filter]);

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={<FileDiff className="w-5 h-5" />}
        title="No changelog entries yet"
        description="Versioned changes (Added, Improved, Fixed, Removed, Security) will appear here."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={cn(
              'px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0',
              filter === cat
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] divide-y divide-slate-100 dark:divide-slate-800">
        {filtered.map((entry) => {
          const release = releases.find((r) => r.id === entry.releaseId);
          return (
            <div key={entry.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'font-mono text-xs font-semibold min-w-[76px] pt-0.5',
                    CATEGORY_COLORS[entry.category] || 'text-slate-500'
                  )}
                >
                  {entry.category}
                </span>
                <div>
                  <p className="text-sm text-slate-800 dark:text-slate-200">{entry.description}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    {(entry.version || release?.version) && (
                      <span className="font-mono tabular-nums">
                        {entry.version || release?.version}
                      </span>
                    )}
                    {release && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{release.title}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {entry.date && (
                <time className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
                  {formatDate(entry.date)}
                </time>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
