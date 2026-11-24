import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Newspaper } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { useSiteData } from '../context/DataContext';
import { cn, formatDate } from '../utils/formatters';

const CATEGORIES = [
  'All',
  'Development',
  'Experiments',
  'Learning',
  'Announcements',
  'Project Updates',
];

export function UpdatesPage() {
  const { publishedUpdates, publishedProjects } = useSiteData();
  const [category, setCategory] = useState('All');

  const filtered = useMemo(() => {
    if (category === 'All') return publishedUpdates;
    return publishedUpdates.filter((u) => u.category === category);
  }, [publishedUpdates, category]);

  return (
    <div className="mx-auto max-w-[1000px] px-4 sm:px-6 py-12 sm:py-16 space-y-10">
      <header className="border-b border-slate-200 dark:border-slate-800 pb-8">
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Personal Feed</p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          Updates
        </h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-400 max-w-2xl">
          Notes on development, technical experiments, learning, and project announcements.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((cat) => (
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
      </header>

      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((post) => {
            const linked = publishedProjects.find((p) => p.id === post.projectId);
            return (
              <article
                key={post.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-6 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {post.category}
                  </span>
                  <span aria-hidden="true">·</span>
                  <time className="font-mono tabular-nums">{formatDate(post.date)}</time>
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

                <h2 className="mt-2 font-display text-xl font-semibold text-slate-900 dark:text-white">
                  <Link
                    to={`/updates/${post.id}`}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {post.title}
                  </Link>
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-3">
                  {post.content.replace(/[#*`>]/g, '')}
                </p>

                <div className="mt-4">
                  <Link
                    to={`/updates/${post.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline underline-offset-4"
                  >
                    <span>Read update</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Newspaper className="w-5 h-5" />}
          title="No updates found"
          description="Published updates in this category will appear here."
        />
      )}
    </div>
  );
}
