/**
 * Compresses and converts selected image files into compact data URLs
 * suitable for storing safely in Firebase Realtime Database.
 */
export async function processImageFiles(
  files: FileList | File[],
  options: { maxDimension?: number; quality?: number } = {}
): Promise<{ urls: string[]; errors: string[] }> {
  const maxDim = options.maxDimension ?? 1400;
  const quality = options.quality ?? 0.82;
  const fileArray = Array.from(files);

  const results = await Promise.all(
    fileArray.map(
      (file): Promise<{ ok: true; url: string } | { ok: false; error: string }> =>
        new Promise((resolve) => {
          if (!file.type.startsWith('image/')) {
            resolve({ ok: false, error: `"${file.name}" is not a supported image file.` });
            return;
          }

          const reader = new FileReader();
          reader.onerror = () => {
            resolve({ ok: false, error: `Failed to read "${file.name}".` });
          };
          reader.onload = () => {
            const rawResult = typeof reader.result === 'string' ? reader.result : '';
            if (!rawResult) {
              resolve({ ok: false, error: `Empty data for "${file.name}".` });
              return;
            }

            // Preserve GIF animations as-is if small enough
            if (file.type === 'image/gif' && rawResult.length <= 750_000) {
              resolve({ ok: true, url: rawResult });
              return;
            }

            const img = new Image();
            img.onerror = () => {
              resolve({ ok: false, error: `Could not decode "${file.name}".` });
            };
            img.onload = () => {
              let { width, height } = img;
              if (width > maxDim || height > maxDim) {
                const ratio = Math.min(maxDim / width, maxDim / height);
                width = Math.max(1, Math.round(width * ratio));
                height = Math.max(1, Math.round(height * ratio));
              }

              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                resolve({ ok: true, url: rawResult });
                return;
              }

              ctx.drawImage(img, 0, 0, width, height);

              // Use WebP when supported, otherwise PNG for transparency or JPEG
              const hasAlphaType = file.type === 'image/png' || file.type === 'image/webp';
              let output = canvas.toDataURL('image/webp', quality);
              if (!output.startsWith('data:image/webp')) {
                output = canvas.toDataURL(hasAlphaType ? 'image/png' : 'image/jpeg', quality);
              }

              resolve({ ok: true, url: output });
            };
            img.src = rawResult;
          };
          reader.readAsDataURL(file);
        })
    )
  );

  const urls: string[] = [];
  const errors: string[] = [];
  for (const res of results) {
    if (res.ok) urls.push(res.url);
    else errors.push(res.error);
  }

  return { urls, errors };
}
