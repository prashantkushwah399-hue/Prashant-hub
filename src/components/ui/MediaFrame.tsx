import { useEffect, useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { cn, isValidImageUrl, normalizeImageUrl } from '../../utils/formatters';

interface MediaFrameProps {
  src?: string;
  alt: string;
  fallbackLabel?: string;
  className?: string;
  imgClassName?: string;
  aspectClassName?: string;
  allowLocal?: boolean;
  fit?: 'cover' | 'contain';
}

export function MediaFrame({
  src,
  alt,
  fallbackLabel,
  className,
  imgClassName,
  aspectClassName = 'aspect-video',
  allowLocal = true,
  fit = 'cover',
}: MediaFrameProps) {
  const [failed, setFailed] = useState(false);

  const normalizedSrc = normalizeImageUrl(src);

  useEffect(() => {
    setFailed(false);
  }, [normalizedSrc]);

  const isLocalAsset = Boolean(allowLocal && normalizedSrc.startsWith('/src/assets/'));
  const validSrc = Boolean(
    normalizedSrc && (isLocalAsset || (!normalizedSrc.startsWith('/src/assets/') && isValidImageUrl(normalizedSrc)))
  );

  if (!validSrc || failed) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#111318] text-slate-500 dark:text-slate-400 p-6 text-center select-none',
          aspectClassName,
          className
        )}
        aria-label={alt}
      >
        <ImageIcon className="w-5 h-5 opacity-60" />
        <span className="text-xs font-medium tracking-tight max-w-[200px] truncate">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0D0F14]',
        aspectClassName,
        className
      )}
    >
      <img
        src={normalizedSrc}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={cn(
          'w-full h-full',
          fit === 'contain' ? 'object-contain' : 'object-cover',
          imgClassName
        )}
      />
    </div>
  );
}
