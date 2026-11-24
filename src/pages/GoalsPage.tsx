import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Target } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { useSiteData } from '../context/DataContext';
import type { GoalCategory } from '../types/models';
import { cn, formatDate } from '../utils/formatters';

const CATEGORIES: Array<'All' | GoalCategory> = ['All', 'Active', 'Upcoming', 'Completed'];

export function GoalsPage() {
  const { publishedGoals, publishedProjects } = useSiteData();
  const [filter, setFilter] = useState<'All' | GoalCategory>('All');

  const filtered = useMemo(() => {
    if (filter === 'All') return publishedGoals;
    return publishedGoals.filter((g) => g.category === filter);
  }, [publishedGoals, filter]);

  return (
    <div className="mx-auto max-w-[1000px] px-4 sm:px-6 py-12 sm:py-16 space-y-10">
      <header className="border-b border-slate-200 dark:border-slate-800 pb-8">
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Roadmap & Focus</p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          Goals
        </h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-400 max-w-2xl">
          Active priorities, upcoming initiatives, and completed objectives.
        </p>

        <div className="mt-6 inline-flex flex-wrap items-center gap-1 p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318]">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={cn(
                'px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0',
                filter === cat
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((goal) => {
            const linked = publishedProjects.find((p) => p.id === goal.projectId);
            return (
              <div
                key={goal.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-5"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {goal.category}
                      {goal.status ? ` · ${goal.status}` : ''}
                    </span>
                    {goal.targetDate && (
                      <span className="font-mono tabular-nums">
                        Target {formatDate(goal.targetDate)}
                      </span>
                    )}
                  </div>

                  <h2 className="mt-2 font-display text-lg font-semibold text-slate-900 dark:text-white">
                    {goal.title}
                  </h2>

                  {goal.description && (
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {goal.description}
                    </p>
                  )}
                </div>

                <div className="mt-5 space-y-3">
                  {typeof goal.progress === 'number' && (
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                        <span>Manual Progress</span>
                        <span className="font-mono tabular-nums">{goal.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-600 dark:bg-blue-500"
                          style={{ width: `${Math.min(100, Math.max(0, goal.progress))}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {linked && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Project: </span>
                      <Link
                        to={`/projects/${linked.slug}`}
                        className="font-medium text-blue-600 dark:text-blue-400 hover:underline underline-offset-4"
                      >
                        {linked.name}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Target className="w-5 h-5" />}
          title="No goals in this category"
          description="Published goals will appear here once added in the admin dashboard."
        />
      )}
    </div>
  );
}
