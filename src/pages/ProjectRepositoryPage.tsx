import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Download,
  ExternalLink,
  FileDiff,
  FolderGit2,
  Globe,
  History,
  LayoutGrid,
  Package,
  Play,
} from 'lucide-react';
import { RepositoryActivity } from '../components/projects/RepositoryActivity';
import { RepositoryChangelog } from '../components/projects/RepositoryChangelog';
import { RepositoryDocumentation } from '../components/projects/RepositoryDocumentation';
import { RepositoryDownloads } from '../components/projects/RepositoryDownloads';
import { RepositoryOverview } from '../components/projects/RepositoryOverview';
import { RepositoryReleases } from '../components/projects/RepositoryReleases';
import { EmptyState } from '../components/ui/EmptyState';
import { useSiteData } from '../context/DataContext';
import {
  cn,
  formatDate,
  isValidExternalUrl,
  isValidImageUrl,
  normalizeImageUrl,
} from '../utils/formatters';

type RepoTab = 'overview' | 'releases' | 'downloads' | 'docs' | 'changelog' | 'activity';

const TABS: Array<{ key: RepoTab; label: string; icon: typeof LayoutGrid }> = [
  { key: 'overview', label: 'Overview', icon: LayoutGrid },
  { key: 'releases', label: 'Releases', icon: Package },
  { key: 'downloads', label: 'Downloads', icon: Download },
  { key: 'docs', label: 'Documentation', icon: BookOpen },
  { key: 'changelog', label: 'Changelog', icon: FileDiff },
  { key: 'activity', label: 'Activity', icon: History },
];

export function ProjectRepositoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    dataset,
    loading,
    publishedProjects,
    publishedReleases,
    publishedChangelog,
    publishedDocs,
  } = useSiteData();

  const [bannerError, setBannerError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const initialTab = (searchParams.get('tab') as RepoTab) || 'overview';
  const [activeTab, setActiveTab] = useState<RepoTab>(
    TABS.some((t) => t.key === initialTab) ? initialTab : 'overview'
  );
  const [selectedDocId, setSelectedDocId] = useState<string | null>(
    searchParams.get('doc') || null
  );

  useEffect(() => {
    setBannerError(false);
    setLogoError(false);
  }, [slug]);

  useEffect(() => {
    const t = searchParams.get('tab') as RepoTab | null;
    if (t && TABS.some((tab) => tab.key === t)) {
      setActiveTab(t);
    }
    const d = searchParams.get('doc');
    if (d) setSelectedDocId(d);
  }, [searchParams]);

  const switchTab = (tab: string) => {
    const next = tab as RepoTab;
    setActiveTab(next);
    setSearchParams((prev) => {
      const copy = new URLSearchParams(prev);
      copy.set('tab', next);
      return copy;
    });
  };

  const project = publishedProjects.find((p) => p.slug === slug);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-12 space-y-6">
        <div className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
        <div className="h-80 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-[900px] px-4 sm:px-6 py-16">
        <EmptyState
          icon={<FolderGit2 className="w-5 h-5" />}
          title="Repository not found"
          description="This project repository does not exist or has not been published yet."
          action={
            <Link
              to="/projects"
              className="rounded-lg bg-slate-900 dark:bg-white px-4 py-2 text-xs font-medium text-white dark:text-slate-900"
            >
              Back to Project Explorer
            </Link>
          }
        />
      </div>
    );
  }

  const projectReleases = publishedReleases.filter((r) => r.projectId === project.id);
  const publishedRelIds = new Set(projectReleases.map((r) => r.id));
  const latestRelease =
    projectReleases.find((r) => r.isLatest) || projectReleases[0] || undefined;

  const projectAssets = dataset.assets.filter((a) => a.projectId === project.id);
  const validProjectAssets = projectAssets.filter(
    (a) => !a.releaseId || publishedRelIds.has(a.releaseId)
  );
  const projectLevelAssets = projectAssets.filter((a) => !a.releaseId);
  const latestAssets = latestRelease
    ? [
        ...projectAssets.filter((a) => a.releaseId === latestRelease.id),
        ...projectLevelAssets,
      ]
    : projectLevelAssets;

  const projectChangelog = publishedChangelog.filter((c) => c.projectId === project.id);
  const projectDocs = publishedDocs.filter((d) => d.projectId === project.id);
  const projectActivities = dataset.projectActivity.filter((a) => a.projectId === project.id);

  const fileTypesSummary = Array.from(
    new Set(
      validProjectAssets
        .map((a) => (a.fileType || '').trim().toUpperCase())
        .filter(Boolean)
    )
  ).slice(0, 3);

  const validScreenshots = (project.screenshots || [])
    .map((url) => normalizeImageUrl(url))
    .filter((url) => isValidImageUrl(url));
  const bannerSrc = normalizeImageUrl(project.bannerUrl);
  const logoSrc = normalizeImageUrl(project.logoUrl);
  const hasBanner = isValidImageUrl(bannerSrc) && !bannerError;
  const hasLogo = isValidImageUrl(logoSrc) && !logoError;

  const metaForTab = (key: RepoTab): { badge: string; hint: string } => {
    switch (key) {
      case 'overview':
        return {
          badge: `${project.features.length} features`,
          hint:
            validScreenshots.length > 0
              ? `${validScreenshots.length} screenshots`
              : 'Specs & README',
        };
      case 'releases':
        return {
          badge: `${projectReleases.length}`,
          hint: latestRelease ? `Latest ${latestRelease.version}` : 'No releases yet',
        };
      case 'downloads':
        return {
          badge: `${validProjectAssets.length}`,
          hint: fileTypesSummary.length > 0 ? fileTypesSummary.join(' · ') : 'APK / ZIP links',
        };
      case 'docs':
        return {
          badge: `${projectDocs.length}`,
          hint: projectDocs.length > 0 ? 'Guides & usage' : 'No guides yet',
        };
      case 'changelog':
        return {
          badge: `${projectChangelog.length}`,
          hint: projectChangelog.length > 0 ? 'Version history' : 'No entries yet',
        };
      case 'activity':
        return {
          badge: `${projectActivities.length}`,
          hint: projectActivities.length > 0 ? 'Recent updates' : 'No events yet',
        };
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Architectural Repository Hero Card */}
      <header className="space-y-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] overflow-hidden">
          {hasBanner && (
            <div className="relative aspect-[24/7] max-h-60 w-full overflow-hidden border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#171A21]">
              <img
                src={bannerSrc}
                alt={`${project.name} banner`}
                referrerPolicy="no-referrer"
                onError={() => setBannerError(true)}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            </div>
          )}

          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="flex items-start gap-4 min-w-0">
                {hasLogo ? (
                  <img
                    src={logoSrc}
                    alt={`${project.name} logo`}
                    referrerPolicy="no-referrer"
                    onError={() => setLogoError(true)}
                    className="h-16 w-16 rounded-xl border border-slate-200 dark:border-slate-800 object-cover shrink-0 bg-slate-100 dark:bg-[#171A21]"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#171A21] font-display text-xl font-bold text-slate-800 dark:text-slate-200">
                    {project.name.slice(0, 2).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Link
                      to="/projects"
                      className="font-medium text-blue-600 dark:text-blue-400 hover:underline underline-offset-4"
                    >
                      Projects
                    </Link>
                    <span aria-hidden="true">/</span>
                    <span className="font-mono">{project.slug}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize font-medium text-slate-700 dark:text-slate-300">
                      {project.status}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{project.category}</span>
                    {(project.latestVersion || latestRelease?.version) && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums text-blue-600 dark:text-blue-400">
                          {project.latestVersion || latestRelease?.version}
                        </span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">Updated {formatDate(project.updatedAt)}</span>
                  </div>

                  <h1 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
                    {project.name}
                  </h1>

                  {project.shortDescription && (
                    <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                      {project.shortDescription}
                    </p>
                  )}

                  {project.tags.length > 0 && (
                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                      {project.tags.join(' · ')}
                    </p>
                  )}
                </div>
              </div>

              {/* Unified Primary & External Action Bar */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {validProjectAssets.some((a) => isValidExternalUrl(a.downloadUrl)) && (
                  <button
                    type="button"
                    onClick={() => switchTab('downloads')}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-white px-4 py-2.5 text-xs font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Downloads ({validProjectAssets.length})</span>
                  </button>
                )}

                {isValidExternalUrl(project.externalLinks?.demo) && (
                  <a
                    href={project.externalLinks.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0D0F14] px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Live Demo</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                )}

                {isValidExternalUrl(project.externalLinks?.github) && (
                  <a
                    href={project.externalLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0D0F14] px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 transition-colors whitespace-nowrap shrink-0"
                  >
                    <FolderGit2 className="w-3.5 h-3.5" />
                    <span>Source</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                )}

                {isValidExternalUrl(project.externalLinks?.website) && (
                  <a
                    href={project.externalLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0D0F14] px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Website</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                )}

                {isValidExternalUrl(project.externalLinks?.docs) && (
                  <a
                    href={project.externalLinks.docs}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0D0F14] px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 transition-colors whitespace-nowrap shrink-0"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>External Docs</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* All Project Capabilities Visible at a Glance */}
        <nav
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5"
          aria-label="Repository sections"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            const meta = metaForTab(tab.key);

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => switchTab(tab.key)}
                aria-pressed={active}
                className={cn(
                  'group text-left rounded-xl border p-3.5 transition-all duration-150',
                  active
                    ? 'border-blue-600 dark:border-blue-500 bg-white dark:bg-[#111318] ring-1 ring-blue-600/20 dark:ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] hover:border-slate-300 dark:hover:border-slate-700'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0 transition-colors',
                      active
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                    )}
                  />
                  <span
                    className={cn(
                      'font-mono text-xs font-semibold tabular-nums',
                      active
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-700 dark:text-slate-300'
                    )}
                  >
                    {meta.badge}
                  </span>
                </div>
                <p className="mt-2 font-display text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {tab.label}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {meta.hint}
                </p>
              </button>
            );
          })}
        </nav>
      </header>

      {/* Active Repository View */}
      <div>
        {activeTab === 'overview' && (
          <RepositoryOverview
            project={project}
            latestRelease={latestRelease}
            latestAssets={latestAssets}
            allAssets={validProjectAssets}
            docs={projectDocs}
            changelog={projectChangelog}
            activities={projectActivities}
            onSwitchTab={switchTab}
            onSelectDoc={setSelectedDocId}
          />
        )}
        {activeTab === 'releases' && (
          <RepositoryReleases
            releases={projectReleases}
            assets={projectAssets}
            changelog={projectChangelog}
          />
        )}
        {activeTab === 'changelog' && (
          <RepositoryChangelog entries={projectChangelog} releases={projectReleases} />
        )}
        {activeTab === 'docs' && (
          <RepositoryDocumentation
            pages={projectDocs}
            selectedDocId={selectedDocId}
            onSelectDoc={setSelectedDocId}
          />
        )}
        {activeTab === 'downloads' && (
          <RepositoryDownloads releases={projectReleases} assets={projectAssets} />
        )}
        {activeTab === 'activity' && <RepositoryActivity activities={projectActivities} />}
      </div>
    </div>
  );
}
