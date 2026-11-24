import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Download,
  ExternalLink,
  Eye,
  FolderGit2,
  GitBranch,
} from 'lucide-react';
import type { Project } from '../../types/models';
import {
  cn,
  formatDate,
  isValidExternalUrl,
  isValidImageUrl,
  normalizeImageUrl,
} from '../../utils/formatters';

interface ProjectCardProps {
  project: Project;
  releaseCount?: number;
  assetCount?: number;
  docCount?: number;
  view?: 'grid' | 'list';
  onQuickView?: (project: Project) => void;
}

const STATUS_LABELS: Record<Project['status'], string> = {
  featured: 'Featured',
  active: 'Active',
  experimental: 'Experimental',
  archived: 'Archived',
};

function toPlainSnippet(markdown?: string, maxLength = 220): string {
  if (!markdown) return '';
  const cleaned = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/[*_~>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return '';
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength).trimEnd()}...`;
}

export function ProjectCard({
  project,
  releaseCount = 0,
  assetCount = 0,
  docCount = 0,
  view = 'grid',
  onQuickView,
}: ProjectCardProps) {
  const [bannerError, setBannerError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const logoSrc = normalizeImageUrl(project.logoUrl);
  const bannerSrc = normalizeImageUrl(project.bannerUrl);
  const firstScreenshotSrc =
    (project.screenshots || [])
      .map((u) => normalizeImageUrl(u))
      .find((u) => isValidImageUrl(u)) || '';
  const previewSrc = isValidImageUrl(bannerSrc) ? bannerSrc : firstScreenshotSrc;
  const isBannerPreview = isValidImageUrl(bannerSrc);
  const hasLogo = isValidImageUrl(logoSrc) && !logoError;
  const hasPreview = Boolean(previewSrc) && !bannerError;
  const hasGithub = isValidExternalUrl(project.externalLinks?.github);
  const hasDemo = isValidExternalUrl(project.externalLinks?.demo);

  const overviewSnippet = toPlainSnippet(project.detailedDescription, 220);
  const showOverviewSnippet =
    Boolean(overviewSnippet) &&
    overviewSnippet.toLowerCase() !== (project.shortDescription || '').trim().toLowerCase();

  if (view === 'list') {
    return (
      <article className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-5 sm:p-6 hover:border-slate-300 dark:hover:border-slate-700 transition-colors duration-150 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0 flex-1">
            {hasLogo ? (
              <img
                src={logoSrc}
                alt={`${project.name} logo`}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => setLogoError(true)}
                className="h-12 w-12 rounded-xl border border-slate-200 dark:border-slate-800 object-cover shrink-0 bg-slate-100 dark:bg-[#171A21]"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#171A21] text-slate-700 dark:text-slate-300 font-display font-semibold text-sm">
                {project.name.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {STATUS_LABELS[project.status] || project.status}
                </span>
                <span aria-hidden="true">·</span>
                <span>{project.category}</span>
                {project.latestVersion && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums text-blue-600 dark:text-blue-400">
                      {project.latestVersion}
                    </span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">Updated {formatDate(project.updatedAt)}</span>
              </div>

              <div className="mt-1 flex flex-wrap items-baseline gap-2.5">
                <Link
                  to={`/projects/${project.slug}`}
                  className="inline-flex items-center gap-1.5 font-display text-lg font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <span>{project.name}</span>
                  <ArrowUpRight className="w-4 h-4 shrink-0 text-slate-400" />
                </Link>
                <span className="font-mono text-xs text-slate-400 dark:text-slate-500">
                  /projects/{project.slug}
                </span>
              </div>

              {/* Purpose / Short Description & Quick Overview Snippet */}
              <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {project.shortDescription || 'Software project repository.'}
              </p>

              {showOverviewSnippet && (
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
                  {overviewSnippet}
                </p>
              )}

              {/* Key Features inline summary */}
              {project.features.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                  {project.features.slice(0, 3).map((feat, idx) => (
                    <li
                      key={idx}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                      <span>{feat.replace(/^[-•*]\s+/, '')}</span>
                    </li>
                  ))}
                </ul>
              )}

              {project.tags.length > 0 && (
                <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400">
                  {project.tags.slice(0, 6).join(' · ')}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 lg:pt-1">
            {onQuickView && (
              <button
                type="button"
                onClick={() => onQuickView(project)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 px-3 py-2 text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100/80 dark:hover:bg-blue-950/50 transition-colors whitespace-nowrap shrink-0"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Quick View</span>
              </button>
            )}
            {releaseCount > 0 && (
              <Link
                to={`/projects/${project.slug}?tab=releases`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 whitespace-nowrap shrink-0 tabular-nums"
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>{releaseCount} Releases</span>
              </Link>
            )}
            {assetCount > 0 && (
              <Link
                to={`/projects/${project.slug}?tab=downloads`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 whitespace-nowrap shrink-0 tabular-nums"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{assetCount} Downloads</span>
              </Link>
            )}
            {docCount > 0 && (
              <Link
                to={`/projects/${project.slug}?tab=docs`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 whitespace-nowrap shrink-0 tabular-nums"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{docCount} Docs</span>
              </Link>
            )}
            <Link
              to={`/projects/${project.slug}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-white px-3.5 py-2 text-xs font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
            >
              <span>Open</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-colors duration-150">
      <div>
        {hasPreview && (
          <Link
            to={`/projects/${project.slug}`}
            className={cn(
              'block relative w-full overflow-hidden border-b border-slate-100 dark:border-slate-800',
              isBannerPreview
                ? 'aspect-[21/8] bg-slate-100 dark:bg-[#171A21]'
                : 'h-56 p-3 bg-slate-100/90 dark:bg-[#090B0F]'
            )}
          >
            <img
              src={previewSrc}
              alt={`${project.name} preview`}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setBannerError(true)}
              className={cn(
                'h-full w-full group-hover:scale-[1.02] transition-transform duration-200',
                isBannerPreview ? 'object-cover' : 'object-contain'
              )}
            />
          </Link>
        )}

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <Link to={`/projects/${project.slug}`} className="flex items-center gap-3 min-w-0">
              {hasLogo ? (
                <img
                  src={logoSrc}
                  alt={`${project.name} logo`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoError(true)}
                  className="h-11 w-11 rounded-lg border border-slate-200 dark:border-slate-800 object-cover shrink-0 bg-slate-100 dark:bg-[#171A21]"
                />
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#171A21] text-slate-700 dark:text-slate-300 font-display font-semibold text-sm">
                  {project.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {project.name}
                </h3>
                <p className="font-mono text-xs text-slate-500 dark:text-slate-400 truncate">
                  /projects/{project.slug}
                </p>
              </div>
            </Link>

            <Link
              to={`/projects/${project.slug}`}
              aria-label={`Open ${project.name}`}
              className="rounded-lg p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
            >
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-2">
            {project.shortDescription || 'Software project repository.'}
          </p>

          {/* Key Features Preview */}
          {project.features.length > 0 && (
            <ul className="mt-4 space-y-1.5 border-t border-slate-100 dark:border-slate-800/80 pt-3">
              {project.features.slice(0, 2).map((feat, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <span className="line-clamp-1">{feat.replace(/^[-•*]\s+/, '')}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Unboxed Topic List */}
          {project.tags.length > 0 && (
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 truncate">
              {project.tags.slice(0, 5).join(' · ')}
            </p>
          )}
        </div>
      </div>

      {/* Card Footer: Metadata + Direct Feature Links */}
      <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0D0F14] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {STATUS_LABELS[project.status] || project.status}
            </span>
            <span aria-hidden="true">·</span>
            <span>{project.category}</span>
            {project.latestVersion && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums text-blue-600 dark:text-blue-400">
                  {project.latestVersion}
                </span>
              </>
            )}
          </div>

          <span className="inline-flex items-center gap-1 tabular-nums">
            <FolderGit2 className="w-3.5 h-3.5" />
            {formatDate(project.updatedAt)}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-800/70">
          <div className="flex flex-wrap items-center gap-2">
            {releaseCount > 0 && (
              <Link
                to={`/projects/${project.slug}?tab=releases`}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 tabular-nums"
              >
                <GitBranch className="w-3 h-3" />
                <span>{releaseCount} Releases</span>
              </Link>
            )}
            {assetCount > 0 && (
              <Link
                to={`/projects/${project.slug}?tab=downloads`}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 tabular-nums"
              >
                <Download className="w-3 h-3" />
                <span>{assetCount} Downloads</span>
              </Link>
            )}
            {docCount > 0 && (
              <Link
                to={`/projects/${project.slug}?tab=docs`}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 tabular-nums"
              >
                <BookOpen className="w-3 h-3" />
                <span>{docCount} Docs</span>
              </Link>
            )}
            {releaseCount === 0 && assetCount === 0 && docCount === 0 && (
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Overview &amp; Specs
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {hasDemo && (
              <a
                href={project.externalLinks.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white whitespace-nowrap shrink-0"
              >
                <span>Demo</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {hasGithub && (
              <a
                href={project.externalLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white whitespace-nowrap shrink-0"
              >
                <span>Source</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <Link
              to={`/projects/${project.slug}`}
              className={cn(
                'inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline underline-offset-4 whitespace-nowrap shrink-0'
              )}
            >
              <span>Explore</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
