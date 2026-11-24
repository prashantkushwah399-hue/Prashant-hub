import { Download, ExternalLink, Package, Tag } from 'lucide-react';
import type { ChangelogEntry, DownloadAsset, Release } from '../../types/models';
import { formatDate, isValidExternalUrl } from '../../utils/formatters';
import { CopyLinkButton } from '../ui/CopyLinkButton';
import { EmptyState } from '../ui/EmptyState';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';

interface RepositoryReleasesProps {
  releases: Release[];
  assets: DownloadAsset[];
  changelog: ChangelogEntry[];
}

export function RepositoryReleases({ releases, assets, changelog }: RepositoryReleasesProps) {
  if (releases.length === 0) {
    return (
      <EmptyState
        icon={<Package className="w-5 h-5" />}
        title="No releases published yet"
        description="Versioned software releases and downloadable assets will appear here when published."
      />
    );
  }

  return (
    <div className="space-y-6">
      {releases.map((release) => {
        const releaseAssets = assets.filter((a) => a.releaseId === release.id);
        const releaseChanges = changelog.filter((c) => c.releaseId === release.id);

        return (
          <article
            key={release.id}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] p-6 sm:p-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                    {release.version}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize font-medium text-slate-700 dark:text-slate-300">
                    {release.releaseType}
                  </span>
                  {release.isLatest && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        Latest Release
                      </span>
                    </>
                  )}
                  {release.versionTag && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 font-mono">
                        <Tag className="w-3 h-3" />
                        {release.versionTag}
                      </span>
                    </>
                  )}
                </div>
                <h2 className="mt-2 font-display text-xl font-bold text-slate-900 dark:text-white">
                  {release.title}
                </h2>
              </div>

              <time className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
                {formatDate(release.releaseDate)}
              </time>
            </div>

            {release.description && (
              <p className="mt-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {release.description}
              </p>
            )}

            {release.notes && (
              <div className="mt-4">
                <MarkdownRenderer content={release.notes} />
              </div>
            )}

            {releaseChanges.length > 0 && (
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white mb-3">
                  Changes in this release
                </h3>
                <ul className="space-y-1.5 text-sm">
                  {releaseChanges.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300"
                    >
                      <span className="font-mono text-xs text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 min-w-[74px]">
                        [{entry.category}]
                      </span>
                      <span>{entry.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Assets */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white mb-3">
                Assets ({releaseAssets.length})
              </h3>
              {releaseAssets.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  {releaseAssets.map((asset) => {
                    const hasUrl = isValidExternalUrl(asset.downloadUrl);
                    return (
                      <div
                        key={asset.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-slate-50/50 dark:bg-[#0D0F14]"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                              {asset.name}
                            </span>
                            {asset.fileName && (
                              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                                {asset.fileName}
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            {asset.version && (
                              <>
                                <span className="font-mono text-slate-700 dark:text-slate-300">
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
                                <span>Hosted on {asset.provider}</span>
                              </>
                            )}
                          </div>
                          {asset.description && (
                            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                              {asset.description}
                            </p>
                          )}
                        </div>

                        {hasUrl ? (
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <CopyLinkButton url={asset.downloadUrl} />
                            <a
                              href={asset.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 dark:bg-white px-4 py-2 text-xs font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                              <ExternalLink className="w-3 h-3 opacity-70" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic shrink-0">
                            Download link unavailable
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No external download assets attached to this release.
                </p>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
