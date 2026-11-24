import { Link, useParams } from 'react-router-dom';
import { EmptyState } from '../components/ui/EmptyState';
import { MarkdownRenderer } from '../components/ui/MarkdownRenderer';
import { MediaFrame } from '../components/ui/MediaFrame';
import { useSiteData } from '../context/DataContext';
import { formatDate } from '../utils/formatters';

export function UpdateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { publishedUpdates, publishedProjects, loading } = useSiteData();

  const post = publishedUpdates.find((u) => u.id === id);
  const linked = post ? publishedProjects.find((p) => p.id === post.projectId) : undefined;

  if (loading) {
    return (
      <div className="mx-auto max-w-[800px] px-4 sm:px-6 py-16">
        <div className="h-8 w-48 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="mt-4 h-64 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-[800px] px-4 sm:px-6 py-16">
        <EmptyState
          title="Update not found"
          description="This update may be unpublished or removed."
          action={
            <Link
              to="/updates"
              className="rounded-lg bg-slate-900 dark:bg-white px-4 py-2 text-xs font-medium text-white dark:text-slate-900"
            >
              Back to Updates
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-[800px] px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      <div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium text-blue-600 dark:text-blue-400">{post.category}</span>
          <span aria-hidden="true">·</span>
          <time className="font-mono tabular-nums">{formatDate(post.date)}</time>
          {linked && (
            <>
              <span aria-hidden="true">·</span>
              <Link
                to={`/projects/${linked.slug}`}
                className="text-slate-700 dark:text-slate-300 hover:underline underline-offset-4"
              >
                {linked.name}
              </Link>
            </>
          )}
        </div>

        <h1 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
          {post.title}
        </h1>
      </div>

      {post.imageUrl && (
        <MediaFrame src={post.imageUrl} alt={post.title} aspectClassName="aspect-video" />
      )}

      <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
        <MarkdownRenderer content={post.content} />
      </div>
    </article>
  );
}
