import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { MediaFrame } from '../components/ui/MediaFrame';
import { useSiteData } from '../context/DataContext';
import { cn, formatDate } from '../utils/formatters';

export function JourneyPage() {
  const { publishedJourney, publishedProjects } = useSiteData();
  const [category, setCategory] = useState<string>('All');

  const categories = useMemo(() => {
    const set = new Set<string>();
    publishedJourney.forEach((m) => {
      if (m.category) set.add(m.category);
    });
    return ['All', ...Array.from(set)];
  }, [publishedJourney]);

  const filtered = useMemo(() => {
    if (category === 'All') return publishedJourney;
    return publishedJourney.filter((m) => m.category === category);
  }, [publishedJourney, category]);

  return (
    <div className="mx-auto max-w-[1000px] px-4 sm:px-6 py-12 sm:py-16 space-y-10">
      <header className="border-b border-slate-200 dark:border-slate-800 pb-8">
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Personal Timeline</p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          My Journey
        </h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-400 max-w-2xl">
          Key milestones, learning phases, and projects built along the way.
        </p>

        {categories.length > 1 && (
          <div className="mt-6 flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0',
                  category === cat
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </header>

      {filtered.length > 0 ? (
        <div className="relative pl-6 sm:pl-8 border-l border-slate-200 dark:border-slate-800 space-y-8">
          {filtered.map((milestone) => {
            const linked = publishedProjects.find((p) => p.id === milestone.projectId);
            return (
              <article
                key={milestone.id}
                className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-5 sm:p-6"
              >
                <span
                  aria-hidden="true"
                  className="absolute -left-[29px] sm:-left-[37px] top-6 h-2.5 w-2.5 rounded-full border-2 border-blue-600 dark:border-blue-400 bg-slate-50 dark:bg-[#0A0B0E]"
                />
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <time className="font-mono tabular-nums">{formatDate(milestone.date)}</time>
                  {milestone.category && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {milestone.category}
                      </span>
                    </>
                  )}
                  {linked && (
                    <>
                      <span aria-hidden="true">·</span>
                      <Link
                        to={`/projects/${linked.slug}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline underline-offset-4"
                      >
                        {linked.name}
                      </Link>
                    </>
                  )}
                </div>

                <h2 className="mt-2 font-display text-lg font-semibold text-slate-900 dark:text-white">
                  {milestone.title}
                </h2>
                {milestone.description && (
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {milestone.description}
                  </p>
                )}

                {milestone.imageUrl && (
                  <div className="mt-4 max-w-md">
                    <MediaFrame
                      src={milestone.imageUrl}
                      alt={milestone.title}
                      aspectClassName="aspect-video"
                    />
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Compass className="w-5 h-5" />}
          title="No milestones published"
          description="Milestones added and published through the admin panel will form this timeline."
        />
      )}
    </div>
  );
}
