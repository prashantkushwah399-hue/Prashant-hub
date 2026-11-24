import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileDiff,
  History,
  Maximize2,
  Package,
  Tag,
  X,
} from 'lucide-react';
import type {
  ChangelogEntry,
  DocumentationPage,
  DownloadAsset,
  Project,
  ProjectActivity,
  Release,
} from '../../types/models';
import {
  formatDate,
  formatDateTime,
  isValidExternalUrl,
  isValidImageUrl,
  normalizeImageUrl,
} from '../../utils/formatters';
import { CopyLinkButton } from '../ui/CopyLinkButton';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';
import { MediaFrame } from '../ui/MediaFrame';

interface RepositoryOverviewProps {
  project: Project;
  latestRelease?: Release;
  latestAssets: DownloadAsset[];
  allAssets: DownloadAsset[];
  docs: DocumentationPage[];
  changelog: ChangelogEntry[];
  activities: ProjectActivity[];
  onSwitchTab: (tab: string) => void;
  onSelectDoc: (docId: string) => void;
}

export function RepositoryOverview({
  project,
  latestRelease,
  latestAssets,
  allAssets,
  docs,
  changelog,
  activities,
  onSwitchTab,
  onSelectDoc,
}: RepositoryOverviewProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const validLinks = [
    { label: 'Source / GitHub', url: project.externalLinks?.github },
    { label: 'Website', url: project.externalLinks?.website },
    { label: 'Live Demo', url: project.externalLinks?.demo },
    { label: 'External Docs', url: project.externalLinks?.docs },
  ].filter((l): l is { label: string; url: string } => isValidExternalUrl(l.url));

  const validScreenshots = (project.screenshots || [])
    .map((url) => normalizeImageUrl(url))
    .filter((url) => isValidImageUrl(url));

  const downloadableLatest = (latestAssets.length > 0 ? latestAssets : allAssets).filter((a) =>
    isValidExternalUrl(a.downloadUrl)
  );

  useEffect(() => {
    if (lightboxIndex === null || validScreenshots.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev - 1 + validScreenshots.length) % validScreenshots.length
        );
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev + 1) % validScreenshots.length
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, validScreenshots.length]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Main Left Column */}
      <div className="lg:col-span-8 space-y-8">
        {/* Key Features Front & Center */}
        {project.features.length > 0 && (
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-6 sm:p-8">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
              <div>
                <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                  Key Features
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Core capabilities included in this project
                </p>
              </div>
              <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                {project.features.length} {project.features.length === 1 ? 'feature' : 'features'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {project.features.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-lg border border-slate-100 dark:border-slate-800/90 bg-slate-50/60 dark:bg-[#0D0F14] p-3.5"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="min-w-0">
                    <span className="font-mono text-[11px] tabular-nums text-slate-400 dark:text-slate-500 block">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <p className="text-sm text-slate-800 dark:text-slate-200 leading-snug">
                      {feat.replace(/^[-•*]\s+/, '')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Direct Downloads Spotlight (Visible right on Overview) */}
        {downloadableLatest.length > 0 && (
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
              <div>
                <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                  Available Downloads
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Direct verified download links ({downloadableLatest.length} shown)
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSwitchTab('downloads')}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline underline-offset-4"
              >
                <span>Open Downloads Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              {downloadableLatest.slice(0, 4).map((asset) => (
                <div
                  key={asset.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50/50 dark:bg-[#0D0F14]"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {asset.name}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      {asset.version && (
                        <>
                          <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                            {asset.version}
                          </span>
                          <span aria-hidden="true">·</span>
                        </>
                      )}
                      {asset.fileType && <span>{asset.fileType}</span>}
                      {asset.fileSize && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{asset.fileSize}</span>
                        </>
                      )}
                      {asset.provider && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{asset.provider}</span>
                        </>
                      )}
                    </div>
                    {asset.description && (
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                        {asset.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <CopyLinkButton url={asset.downloadUrl} />
                    <a
                      href={asset.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 dark:bg-white px-4 py-2 text-xs font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download {asset.fileType || ''}</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Screenshots — Uncropped studio gallery supporting portrait, square, and widescreen */}
        {validScreenshots.length > 0 && (
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
              <div>
                <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                  Screenshots
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Click any screenshot to inspect full screen
                </p>
              </div>
              <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                {validScreenshots.length}{' '}
                {validScreenshots.length === 1 ? 'image' : 'images'}
              </span>
            </div>
            <div
              className={
                validScreenshots.length === 1
                  ? 'grid grid-cols-1 gap-4'
                  : 'grid grid-cols-1 sm:grid-cols-2 gap-4'
              }
            >
              {validScreenshots.map((url, idx) => (
                <button
                  key={`${idx}-${url.slice(0, 24)}`}
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  className="text-left group rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-[#090B0F] overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <div className="p-2.5 sm:p-3">
                    <MediaFrame
                      src={url}
                      alt={`${project.name} screenshot ${idx + 1}`}
                      fallbackLabel={`Screenshot ${idx + 1}`}
                      fit="contain"
                      aspectClassName={
                        validScreenshots.length === 1
                          ? 'h-72 sm:h-96 w-full'
                          : 'h-64 sm:h-72 w-full'
                      }
                      className="border-0 rounded-lg bg-transparent dark:bg-transparent"
                      imgClassName="group-hover:scale-[1.015] transition-transform duration-200"
                    />
                  </div>
                  <div className="flex items-center justify-between px-3.5 py-2 border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#111318] text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono tabular-nums">
                      Screenshot {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      <Maximize2 className="w-3 h-3" />
                      <span>Expand</span>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* README / Detailed Description */}
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Overview &amp; Architecture
            </h2>
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
              README
            </span>
          </div>

          {project.detailedDescription ? (
            <MarkdownRenderer content={project.detailedDescription} />
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {project.shortDescription || 'No detailed overview written yet.'}
            </p>
          )}
        </section>
      </div>

      {/* Sidebar Right Column */}
      <aside className="lg:col-span-4 space-y-6">
        {/* Latest Release Card */}
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-1.5">
              <Package className="w-4 h-4 text-slate-400" />
              <span>Latest Release</span>
            </h3>
            <button
              type="button"
              onClick={() => onSwitchTab('releases')}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline underline-offset-4"
            >
              All releases
            </button>
          </div>

          {latestRelease ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
                  {latestRelease.version}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                  {latestRelease.releaseType}
                </span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">{latestRelease.title}</p>
              {latestRelease.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {latestRelease.description}
                </p>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                Released {formatDate(latestRelease.releaseDate)}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No published releases yet.
            </p>
          )}
        </section>

        {/* Repository Details */}
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-5 space-y-4">
          <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
            Repository Details
          </h3>

          <dl className="space-y-2.5 text-xs">
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500 dark:text-slate-400">Category</dt>
              <dd className="font-medium text-slate-800 dark:text-slate-200">{project.category}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500 dark:text-slate-400">Status</dt>
              <dd className="capitalize font-medium text-slate-800 dark:text-slate-200">
                {project.status}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500 dark:text-slate-400">Created</dt>
              <dd className="font-mono tabular-nums text-slate-800 dark:text-slate-200">
                {formatDate(project.createdAt)}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500 dark:text-slate-400">Updated</dt>
              <dd className="font-mono tabular-nums text-slate-800 dark:text-slate-200">
                {formatDate(project.updatedAt)}
              </dd>
            </div>
          </dl>

          {project.tags.length > 0 && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
                <Tag className="w-3.5 h-3.5" />
                <span>Topics</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {project.tags.join(' · ')}
              </p>
            </div>
          )}

          {validLinks.length > 0 && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              {validLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline underline-offset-4"
                >
                  <span>{link.label}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Documentation Preview */}
        {docs.length > 0 && (
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span>Documentation</span>
              </h3>
              <button
                type="button"
                onClick={() => onSwitchTab('docs')}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline underline-offset-4"
              >
                Read all
              </button>
            </div>
            <ul className="space-y-1.5">
              {docs.slice(0, 5).map((doc) => (
                <li key={doc.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectDoc(doc.id);
                      onSwitchTab('docs');
                    }}
                    className="w-full text-left text-xs text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 py-1 truncate"
                  >
                    {doc.category} / {doc.title}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Recent Changelog Preview */}
        {changelog.length > 0 && (
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-1.5">
                <FileDiff className="w-4 h-4 text-slate-400" />
                <span>Recent Changes</span>
              </h3>
              <button
                type="button"
                onClick={() => onSwitchTab('changelog')}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline underline-offset-4"
              >
                Full log
              </button>
            </div>
            <ul className="space-y-2">
              {changelog.slice(0, 4).map((entry) => (
                <li key={entry.id} className="text-xs">
                  <span className="font-mono text-blue-600 dark:text-blue-400 mr-1.5">
                    [{entry.category}]
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">{entry.description}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Recent Activity Preview */}
        {activities.length > 0 && (
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-400" />
                <span>Recent Activity</span>
              </h3>
              <button
                type="button"
                onClick={() => onSwitchTab('activity')}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline underline-offset-4"
              >
                Timeline
              </button>
            </div>
            <ul className="space-y-2.5">
              {activities.slice(0, 4).map((act) => (
                <li key={act.id} className="text-xs">
                  <p className="font-medium text-slate-800 dark:text-slate-200">{act.title}</p>
                  <p className="text-slate-500 dark:text-slate-400 tabular-nums">
                    {formatDateTime(act.timestamp)}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </aside>

      {/* Lightbox Modal for Screenshots */}
      {lightboxIndex !== null && validScreenshots[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none">
            <span className="font-mono text-xs tabular-nums text-white/80 bg-white/10 px-3 py-1.5 rounded-lg">
              {lightboxIndex + 1} / {validScreenshots.length}
            </span>
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="pointer-events-auto rounded-lg bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label="Close screenshot preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {validScreenshots.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(
                  (lightboxIndex - 1 + validScreenshots.length) % validScreenshots.length
                );
              }}
              className="absolute left-3 sm:left-6 rounded-lg bg-white/15 p-2.5 text-white hover:bg-white/25"
              aria-label="Previous screenshot"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <img
            src={validScreenshots[lightboxIndex]}
            alt={`${project.name} screenshot ${lightboxIndex + 1}`}
            referrerPolicy="no-referrer"
            className="max-h-[82vh] max-w-[90vw] rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {validScreenshots.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((lightboxIndex + 1) % validScreenshots.length);
              }}
              className="absolute right-3 sm:right-6 rounded-lg bg-white/15 p-2.5 text-white hover:bg-white/25"
              aria-label="Next screenshot"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
