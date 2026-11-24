import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileDiff, FolderGit2, Newspaper, Package, Search } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { useSiteData } from '../context/DataContext';
import { cn, formatDate } from '../utils/formatters';

type SearchScope = 'all' | 'projects' | 'releases' | 'docs' | 'updates' | 'changelog';

const SCOPES: Array<{ key: SearchScope; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'projects', label: 'Projects' },
  { key: 'releases', label: 'Releases' },
  { key: 'docs', label: 'Documentation' },
  { key: 'updates', label: 'Updates' },
  { key: 'changelog', label: 'Changelog' },
];

export function SearchPage() {
  const {
    publishedProjects,
    publishedReleases,
    publishedDocs,
    publishedUpdates,
    publishedChangelog,
  } = useSiteData();

  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<SearchScope>('all');

  const q = query.trim().toLowerCase();

  const projectById = useMemo(() => {
    const map = new Map(publishedProjects.map((p) => [p.id, p]));
    return map;
  }, [publishedProjects]);

  const results = useMemo(() => {
    if (!q) {
      return {
        projects: [],
        releases: [],
        docs: [],
        updates: [],
        changelog: [],
      };
    }

    const projects =
      scope === 'all' || scope === 'projects'
        ? publishedProjects.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.slug.toLowerCase().includes(q) ||
              p.shortDescription.toLowerCase().includes(q) ||
              p.category.toLowerCase().includes(q) ||
              p.tags.some((t) => t.toLowerCase().includes(q))
          )
        : [];

    const releases =
      scope === 'all' || scope === 'releases'
        ? publishedReleases.filter((r) => {
            const proj = projectById.get(r.projectId);
            return (
              Boolean(proj) &&
              (r.title.toLowerCase().includes(q) ||
                r.version.toLowerCase().includes(q) ||
                r.description.toLowerCase().includes(q) ||
                r.notes.toLowerCase().includes(q))
            );
          })
        : [];

    const docs =
      scope === 'all' || scope === 'docs'
        ? publishedDocs.filter((d) => {
            const proj = projectById.get(d.projectId);
            return (
              Boolean(proj) &&
              (d.title.toLowerCase().includes(q) ||
                d.category.toLowerCase().includes(q) ||
                d.content.toLowerCase().includes(q))
            );
          })
        : [];

    const updates =
      scope === 'all' || scope === 'updates'
        ? publishedUpdates.filter(
            (u) =>
              u.title.toLowerCase().includes(q) ||
              u.category.toLowerCase().includes(q) ||
              u.content.toLowerCase().includes(q)
          )
        : [];

    const changelog =
      scope === 'all' || scope === 'changelog'
        ? publishedChangelog.filter((c) => {
            const proj = projectById.get(c.projectId);
            return (
              Boolean(proj) &&
              (c.description.toLowerCase().includes(q) ||
                c.version.toLowerCase().includes(q) ||
                c.category.toLowerCase().includes(q))
            );
          })
        : [];

    return { projects, releases, docs, updates, changelog };
  }, [
    q,
    scope,
    publishedProjects,
    publishedReleases,
    publishedDocs,
    publishedUpdates,
    publishedChangelog,
    projectById,
  ]);

  const totalCount =
    results.projects.length +
    results.releases.length +
    results.docs.length +
    results.updates.length +
    results.changelog.length;

  return (
    <div className="mx-auto max-w-[1000px] px-4 sm:px-6 py-12 sm:py-16 space-y-8">
      <header className="border-b border-slate-200 dark:border-slate-800 pb-8">
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Platform Index</p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          Search
        </h1>
        <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
          Search across projects, releases, documentation, updates, and changelog entries.
        </p>

        <div className="mt-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type keywords (e.g., project name, version, documentation topic)..."
            aria-label="Global platform search"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {SCOPES.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setScope(s.key)}
              className={cn(
                'px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0',
                scope === s.key
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </header>

      {!q ? (
        <EmptyState
          icon={<Search className="w-5 h-5" />}
          title="Start typing to search"
          description="Results appear instantaneously across all published projects, releases, documentation, updates, and changelogs."
        />
      ) : totalCount === 0 ? (
        <EmptyState
          icon={<Search className="w-5 h-5" />}
          title="No matching results"
          description={`No published content matched "${query}".`}
        />
      ) : (
        <div className="space-y-8">
          <p className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
            Found {totalCount} {totalCount === 1 ? 'result' : 'results'}
          </p>

          {results.projects.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Projects ({results.projects.length})</span>
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {results.projects.map((p) => (
                  <Link
                    key={p.id}
                    to={`/projects/${p.slug}`}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <p className="font-display text-base font-semibold text-slate-900 dark:text-white">
                      {p.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {p.shortDescription}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.releases.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Releases ({results.releases.length})</span>
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {results.releases.map((r) => {
                  const proj = projectById.get(r.projectId);
                  if (!proj) return null;
                  return (
                    <Link
                      key={r.id}
                      to={`/projects/${proj.slug}?tab=releases`}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {proj.name}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{r.version}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{formatDate(r.releaseDate)}</span>
                      </div>
                      <p className="mt-1 font-display text-base font-semibold text-slate-900 dark:text-white">
                        {r.title}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {results.docs.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Documentation ({results.docs.length})</span>
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {results.docs.map((d) => {
                  const proj = projectById.get(d.projectId);
                  if (!proj) return null;
                  return (
                    <Link
                      key={d.id}
                      to={`/projects/${proj.slug}?tab=docs&doc=${d.id}`}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {proj.name}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{d.category}</span>
                      </div>
                      <p className="mt-1 font-display text-base font-semibold text-slate-900 dark:text-white">
                        {d.title}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {results.updates.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Updates ({results.updates.length})</span>
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {results.updates.map((u) => (
                  <Link
                    key={u.id}
                    to={`/updates/${u.id}`}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>{u.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{formatDate(u.date)}</span>
                    </div>
                    <p className="mt-1 font-display text-base font-semibold text-slate-900 dark:text-white">
                      {u.title}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.changelog.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
                <FileDiff className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Changelog ({results.changelog.length})</span>
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {results.changelog.map((c) => {
                  const proj = projectById.get(c.projectId);
                  if (!proj) return null;
                  return (
                    <Link
                      key={c.id}
                      to={`/projects/${proj.slug}?tab=changelog`}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {proj.name}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{c.category}</span>
                        {c.version && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono">{c.version}</span>
                          </>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                        {c.description}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
