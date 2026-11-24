import { Link } from 'react-router-dom';
import { Award } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { MediaFrame } from '../components/ui/MediaFrame';
import { useSiteData } from '../context/DataContext';
import { formatDate } from '../utils/formatters';

export function AchievementsPage() {
  const { publishedAchievements, publishedProjects } = useSiteData();

  return (
    <div className="mx-auto max-w-[1000px] px-4 sm:px-6 py-12 sm:py-16 space-y-10">
      <header className="border-b border-slate-200 dark:border-slate-800 pb-8">
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Recognition & Milestones</p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          Achievements
        </h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-400 max-w-2xl">
          Verified accomplishments, recognitions, and project milestones.
        </p>
      </header>

      {publishedAchievements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {publishedAchievements.map((item) => {
            const linked = publishedProjects.find((p) => p.id === item.projectId);
            return (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-6 space-y-4"
              >
                {item.imageUrl && (
                  <MediaFrame
                    src={item.imageUrl}
                    alt={item.title}
                    aspectClassName="aspect-video"
                  />
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    {item.category && (
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {item.category}
                      </span>
                    )}
                    {item.category && item.date && <span aria-hidden="true">·</span>}
                    {item.date && (
                      <time className="font-mono tabular-nums">{formatDate(item.date)}</time>
                    )}
                  </div>
                  <h2 className="mt-2 font-display text-lg font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </h2>
                  {item.description && (
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {item.description}
                    </p>
                  )}
                  {linked && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Related Project: </span>
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
          icon={<Award className="w-5 h-5" />}
          title="No achievements published yet"
          description="Achievements published in the admin panel will be displayed here."
        />
      )}
    </div>
  );
}
