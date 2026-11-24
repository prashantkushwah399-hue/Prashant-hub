import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Eye,
  FolderGit2,
  GitBranch,
  Search,
  X,
} from 'lucide-react';
import { ProjectCard } from '../components/projects/ProjectCard';
import { CopyLinkButton } from '../components/ui/CopyLinkButton';
import { EmptyState } from '../components/ui/EmptyState';
import { MarkdownRenderer } from '../components/ui/MarkdownRenderer';
import { MediaFrame } from '../components/ui/MediaFrame';
import { useSiteData } from '../context/DataContext';
import type { Project, ProjectStatus } from '../types/models';
import {
  cn,
  formatDate,
  isValidExternalUrl,
  isValidImageUrl,
  normalizeImageUrl,
} from '../utils/formatters';

type SortOption = 'updated' | 'newest' | 'name';

const STATUS_TABS: Array<{ key: 'all' | ProjectStatus; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'featured', label: 'Featured' },
  { key: 'active', label: 'Active' },
  { key: 'experimental', label: 'Experimental' },
  { key: 'archived', label: 'Archived' },
];

export function ProjectsExplorerPage() {
  const { dataset, publishedProjects, publishedReleases, publishedDocs } = useSiteData();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | ProjectStatus>('all');
  const [category, setCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [quickViewProject, setQuickViewProject] = useState<Project | null>(null);
  const [quickViewSlide, setQuickViewSlide] = useState(0);

  const categories = useMemo(() => {
    const set = new Set<string>();
    publishedProjects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [publishedProjects]);

  const publishedReleaseIds = useMemo(
    () => new Set(publishedReleases.map((r) => r.id)),
    [publishedReleases]
  );

  const publishedProjectIds = useMemo(
    () => new Set(publishedProjects.map((p) => p.id)),
    [publishedProjects]
  );

  const totalAssetsCount = useMemo(
    () =>
      dataset.assets.filter(
        (a) =>
          publishedProjectIds.has(a.projectId) &&
          (!a.releaseId || publishedReleaseIds.has(a.releaseId))
      ).length,
    [dataset.assets, publishedProjectIds, publishedReleaseIds]
  );

  const countForStatus = (tabKey: 'all' | ProjectStatus) => {
    if (tabKey === 'all') return publishedProjects.length;
    if (tabKey === 'featured') {
      return publishedProjects.filter((p) => p.featured || p.status === 'featured').length;
    }
    return publishedProjects.filter((p) => p.status === tabKey).length;
  };

  const assetsForProject = (projectId: string) =>
    dataset.assets.filter(
      (a) =>
        a.projectId === projectId && (!a.releaseId || publishedReleaseIds.has(a.releaseId))
    );

  const countAssetsForProject = (projectId: string) => assetsForProject(projectId).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return publishedProjects
      .filter((p) => {
        if (status === 'featured') {
          if (!p.featured && p.status !== 'featured') return false;
        } else if (status !== 'all') {
          if (p.status !== status) return false;
        }
        if (category !== 'All' && p.category !== category) return false;
        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.detailedDescription.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.features.some((f) => f.toLowerCase().includes(q)) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'newest') return (b.createdAt || '').localeCompare(a.createdAt || '');
        return (b.updatedAt || '').localeCompare(a.updatedAt || '');
      });
  }, [publishedProjects, query, status, category, sortBy]);

  const spotlightProject = useMemo(() => {
    if (status !== 'all' || category !== 'All' || query.trim() !== '') return null;
    return (
      publishedProjects.find((p) => p.featured || p.status === 'featured') ||
      publishedProjects[0] ||
      null
    );
  }, [publishedProjects, status, category, query]);

  const listProjects = useMemo(() => {
    if (!spotlightProject || filtered.length <= 1) return filtered;
    return filtered.filter((p) => p.id !== spotlightProject.id);
  }, [filtered, spotlightProject]);

  const spotlightReleases = spotlightProject
    ? publishedReleases.filter((r) => r.projectId === spotlightProject.id).length
    : 0;
  const spotlightAssets = spotlightProject ? countAssetsForProject(spotlightProject.id) : 0;
  const spotlightDocs = spotlightProject
    ? publishedDocs.filter((d) => d.projectId === spotlightProject.id).length
    : 0;

  const getProjectMediaList = (project: Project | null) => {
    if (!project) return [];
    const urls: string[] = [];
    const seen = new Set<string>();
    const candidates = [project.bannerUrl, ...(project.screenshots || [])];
    for (const raw of candidates) {
      const normalized = normalizeImageUrl(raw);
      if (normalized && isValidImageUrl(normalized) && !seen.has(normalized)) {
        seen.add(normalized);
        urls.push(normalized);
      }
    }
    return urls;
  };

  const spotlightMediaList = useMemo(
    () => getProjectMediaList(spotlightProject),
    [spotlightProject]
  );

  const [spotlightSlide, setSpotlightSlide] = useState(0);

  useEffect(() => {
    setSpotlightSlide(0);
  }, [spotlightProject?.id]);

  const activeSpotlightMedia =
    spotlightMediaList[spotlightSlide] || spotlightMediaList[0] || '';

  const quickViewMediaList = useMemo(
    () => getProjectMediaList(quickViewProject),
    [quickViewProject]
  );

  useEffect(() => {
    setQuickViewSlide(0);
  }, [quickViewProject?.id]);

  useEffect(() => {
    if (!quickViewProject) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setQuickViewProject(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [quickViewProject]);

  const quickViewAssets = quickViewProject ? assetsForProject(quickViewProject.id) : [];

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Architectural Header + Real Aggregate Strip */}
      <header className="space-y-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Software Hub</p>
          <div className="mt-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
                Projects &amp; Repositories
              </h1>
              <p className="mt-2 text-base text-slate-600 dark:text-slate-400 max-w-2xl">
                Explore software builds, quick overviews, key capabilities, versioned releases, documentation, and direct APK/ZIP downloads.
              </p>
            </div>
            <p className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
              Showing {filtered.length} of {publishedProjects.length}{' '}
              {publishedProjects.length === 1 ? 'repository' : 'repositories'}
            </p>
          </div>
        </div>

        {/* Real Hub Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-4 sm:p-5">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Repositories</p>
            <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-slate-900 dark:text-white">
              {publishedProjects.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Published Releases</p>
            <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-slate-900 dark:text-white">
              {publishedReleases.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Download Assets</p>
            <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-slate-900 dark:text-white">
              {totalAssetsCount}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Documentation Guides</p>
            <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-slate-900 dark:text-white">
              {publishedDocs.length}
            </p>
          </div>
        </div>

        {/* Explorer Toolbar (List view only, no Grid/List toggle) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318]">
            {STATUS_TABS.map((tab) => {
              const count = countForStatus(tab.key);
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatus(tab.key)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0',
                    status === tab.key
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  <span>{tab.label}</span>
                  <span className="font-mono text-[11px] tabular-nums opacity-70">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[200px] sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects or features..."
                aria-label="Search repositories"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {categories.length > 1 && (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label="Filter by category"
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            )}

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Sort repositories"
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="updated">Recently Updated</option>
              <option value="newest">Newest Created</option>
              <option value="name">Name (A–Z)</option>
            </select>
          </div>
        </div>
      </header>

      {/* Featured Spotlight Showcase */}
      {spotlightProject && (
        <section aria-labelledby="spotlight-heading">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      Spotlight Repository
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{spotlightProject.category}</span>
                    {spotlightProject.latestVersion && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                          {spotlightProject.latestVersion}
                        </span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      Updated {formatDate(spotlightProject.updatedAt)}
                    </span>
                  </div>

                  <h2
                    id="spotlight-heading"
                    className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white"
                  >
                    {spotlightProject.name}
                  </h2>

                  <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
                    {spotlightProject.shortDescription || 'Software project repository.'}
                  </p>

                  {spotlightProject.features.length > 0 && (
                    <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-5 border-t border-slate-100 dark:border-slate-800">
                      {spotlightProject.features.slice(0, 4).map((feat, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300"
                        >
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <span>{feat.replace(/^[-•*]\s+/, '')}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {spotlightProject.tags.length > 0 && (
                    <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                      {spotlightProject.tags.join(' · ')}
                    </p>
                  )}
                </div>

                {/* Direct Action & Quick View Row */}
                <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    to={`/projects/${spotlightProject.slug}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-white px-4 py-2.5 text-xs font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Open Repository</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setQuickViewProject(spotlightProject)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 px-3.5 py-2.5 text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100/80 dark:hover:bg-blue-950/50 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Quick View</span>
                  </button>

                  {spotlightAssets > 0 && (
                    <Link
                      to={`/projects/${spotlightProject.slug}?tab=downloads`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 transition-colors whitespace-nowrap shrink-0 tabular-nums"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Downloads ({spotlightAssets})</span>
                    </Link>
                  )}

                  {spotlightReleases > 0 && (
                    <Link
                      to={`/projects/${spotlightProject.slug}?tab=releases`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 transition-colors whitespace-nowrap shrink-0 tabular-nums"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>Releases ({spotlightReleases})</span>
                    </Link>
                  )}

                  {spotlightDocs > 0 && (
                    <Link
                      to={`/projects/${spotlightProject.slug}?tab=docs`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 transition-colors whitespace-nowrap shrink-0 tabular-nums"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Docs ({spotlightDocs})</span>
                    </Link>
                  )}

                  {isValidExternalUrl(spotlightProject.externalLinks?.demo) && (
                    <a
                      href={spotlightProject.externalLinks.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>Live Demo</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-[#090B0F] flex flex-col justify-between p-4 sm:p-5 gap-3">
                <div className="flex-1 flex items-center justify-center min-h-[280px] sm:min-h-[340px]">
                  <MediaFrame
                    src={activeSpotlightMedia}
                    alt={`${spotlightProject.name} showcase`}
                    fallbackLabel={spotlightProject.name}
                    fit="contain"
                    aspectClassName="h-[300px] sm:h-[360px] w-full"
                    className="border-0 bg-transparent dark:bg-transparent rounded-lg"
                  />
                </div>

                {spotlightMediaList.length > 1 && (
                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
                    <span className="font-mono text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
                      Preview {spotlightSlide + 1} / {spotlightMediaList.length}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setSpotlightSlide(
                            (prev) =>
                              (prev - 1 + spotlightMediaList.length) %
                              spotlightMediaList.length
                          )
                        }
                        aria-label="Previous preview image"
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111318] p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSpotlightSlide((prev) => (prev + 1) % spotlightMediaList.length)
                        }
                        aria-label="Next preview image"
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111318] p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Repository List (Single List View) */}
      {filtered.length > 0 ? (
        listProjects.length > 0 && (
          <section aria-label="Repositories list" className="space-y-4">
            {spotlightProject && (
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                  Repositories Overview
                </h2>
                <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  {listProjects.length} {listProjects.length === 1 ? 'project' : 'projects'}
                </span>
              </div>
            )}

            <div className="space-y-3">
              {listProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  view="list"
                  onQuickView={setQuickViewProject}
                  releaseCount={
                    publishedReleases.filter((r) => r.projectId === project.id).length
                  }
                  assetCount={countAssetsForProject(project.id)}
                  docCount={publishedDocs.filter((d) => d.projectId === project.id).length}
                />
              ))}
            </div>
          </section>
        )
      ) : (
        <EmptyState
          icon={<FolderGit2 className="w-5 h-5" />}
          title="No matching repositories"
          description={
            publishedProjects.length === 0
              ? 'No software projects have been published yet.'
              : 'Try adjusting your search term, category, or status filter.'
          }
          action={
            publishedProjects.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setStatus('all');
                  setCategory('All');
                }}
                className="rounded-lg border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Reset Filters
              </button>
            ) : undefined
          }
        />
      )}

      {/* Project Quick View Modal */}
      {quickViewProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-6"
          onClick={() => setQuickViewProject(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-view-title"
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#111318]/95 backdrop-blur px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">Quick View</span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{quickViewProject.status}</span>
                  <span aria-hidden="true">·</span>
                  <span>{quickViewProject.category}</span>
                  {quickViewProject.latestVersion && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                        {quickViewProject.latestVersion}
                      </span>
                    </>
                  )}
                </div>
                <h2
                  id="quick-view-title"
                  className="mt-1 font-display text-xl font-bold text-slate-900 dark:text-white truncate"
                >
                  {quickViewProject.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setQuickViewProject(null)}
                aria-label="Close quick view"
                className="rounded-lg border border-slate-200 dark:border-slate-800 p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 space-y-6">
              {/* Purpose & Description */}
              <div className="space-y-3">
                <p className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                  {quickViewProject.shortDescription || 'Software project repository.'}
                </p>

                {quickViewProject.detailedDescription && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#0D0F14] p-4 sm:p-5">
                    <MarkdownRenderer content={quickViewProject.detailedDescription} />
                  </div>
                )}
              </div>

              {/* Preview Media */}
              {quickViewMediaList.length > 0 && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-[#090B0F] p-3 sm:p-4 space-y-3">
                  <MediaFrame
                    src={quickViewMediaList[quickViewSlide] || quickViewMediaList[0]}
                    alt={`${quickViewProject.name} preview`}
                    fit="contain"
                    aspectClassName="h-64 sm:h-80 w-full"
                    className="border-0 bg-transparent dark:bg-transparent"
                  />
                  {quickViewMediaList.length > 1 && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
                      <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                        {quickViewSlide + 1} / {quickViewMediaList.length}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setQuickViewSlide(
                              (prev) =>
                                (prev - 1 + quickViewMediaList.length) %
                                quickViewMediaList.length
                            )
                          }
                          aria-label="Previous image"
                          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111318] p-1.5 text-slate-700 dark:text-slate-300"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setQuickViewSlide((prev) => (prev + 1) % quickViewMediaList.length)
                          }
                          aria-label="Next image"
                          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111318] p-1.5 text-slate-700 dark:text-slate-300"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Key Features */}
              {quickViewProject.features.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                    Key Features
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {quickViewProject.features.map((feat, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300"
                      >
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <span>{feat.replace(/^[-•*]\s+/, '')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Direct Downloads inside Quick View */}
              {quickViewAssets.filter((a) => isValidExternalUrl(a.downloadUrl)).length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                    Direct Downloads
                  </h3>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {quickViewAssets
                      .filter((a) => isValidExternalUrl(a.downloadUrl))
                      .slice(0, 3)
                      .map((asset) => (
                        <div
                          key={asset.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50/50 dark:bg-[#0D0F14]"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                              {asset.name}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {[asset.version, asset.fileType, asset.fileSize, asset.provider]
                                .filter(Boolean)
                                .join(' · ')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <CopyLinkButton url={asset.downloadUrl} />
                            <a
                              href={asset.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-white px-3 py-2 text-xs font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 whitespace-nowrap shrink-0"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </a>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {quickViewProject.tags.length > 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {quickViewProject.tags.join(' · ')}
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0D0F14] px-5 py-4 sm:px-6">
              <div className="flex flex-wrap items-center gap-2">
                {isValidExternalUrl(quickViewProject.externalLinks?.github) && (
                  <a
                    href={quickViewProject.externalLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    <span>Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {isValidExternalUrl(quickViewProject.externalLinks?.demo) && (
                  <a
                    href={quickViewProject.externalLinks.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    <span>Live Demo</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <Link
                to={`/projects/${quickViewProject.slug}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-white px-4 py-2 text-xs font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
              >
                <span>Open Full Repository</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
