import { Download, ExternalLink, HardDrive } from 'lucide-react';
import type { DownloadAsset, Release } from '../../types/models';
import { formatDate, isValidExternalUrl } from '../../utils/formatters';
import { CopyLinkButton } from '../ui/CopyLinkButton';
import { EmptyState } from '../ui/EmptyState';

interface RepositoryDownloadsProps {
  releases: Release[];
  assets: DownloadAsset[];
}

function AssetRow({ asset, fallbackVersion }: { asset: DownloadAsset; fallbackVersion?: string }) {
  const valid = isValidExternalUrl(asset.downloadUrl);
  const displayVersion = asset.version || fallbackVersion;

  return (
    <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{asset.name}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          {displayVersion && (
            <>
              <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                {displayVersion}
              </span>
              <span aria-hidden="true">·</span>
            </>
          )}
          {asset.fileName && <span className="font-mono">{asset.fileName}</span>}
          {asset.fileType && (
            <>
              {asset.fileName && <span aria-hidden="true">·</span>}
              <span>{asset.fileType}</span>
            </>
          )}
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
          <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">{asset.description}</p>
        )}
      </div>

      {valid ? (
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <CopyLinkButton url={asset.downloadUrl} className="py-2.5 sm:py-2" />
          <a
            href={asset.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 dark:bg-white px-4 py-2.5 sm:py-2 text-xs font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download via {asset.provider || 'External'}</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        </div>
      ) : (
        <span className="text-xs text-slate-400 italic shrink-0">URL missing or invalid</span>
      )}
    </div>
  );
}

export function RepositoryDownloads({ releases, assets }: RepositoryDownloadsProps) {
  const publishedReleaseIds = new Set(releases.map((r) => r.id));
  const releaseBoundAssets = assets.filter(
    (a) => a.releaseId && publishedReleaseIds.has(a.releaseId)
  );
  const projectLevelAssets = assets.filter((a) => !a.releaseId);

  if (releaseBoundAssets.length === 0 && projectLevelAssets.length === 0) {
    return (
      <EmptyState
        icon={<HardDrive className="w-5 h-5" />}
        title="No downloadable assets available"
        description="External download links (APK, ZIP, PDF, etc.) attached to this project or its releases will appear here."
      />
    );
  }

  return (
    <div className="space-y-6">
      {projectLevelAssets.length > 0 && (
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <span className="font-display text-sm font-semibold text-slate-900 dark:text-white">
              Project Downloads
            </span>
            <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
              {projectLevelAssets.length}{' '}
              {projectLevelAssets.length === 1 ? 'file' : 'files'}
            </span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {projectLevelAssets.map((asset) => (
              <AssetRow key={asset.id} asset={asset} />
            ))}
          </div>
        </section>
      )}

      {releases.map((release) => {
        const items = releaseBoundAssets.filter((a) => a.releaseId === release.id);
        if (items.length === 0) return null;

        return (
          <section
            key={release.id}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111318] overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
                  {release.version}
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-400">{release.title}</span>
                {release.isLatest && (
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    · Latest
                  </span>
                )}
              </div>
              <time className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {formatDate(release.releaseDate)}
              </time>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((asset) => (
                <AssetRow key={asset.id} asset={asset} fallbackVersion={release.version} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
