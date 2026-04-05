/**
 * Converts a recipe title to a URL/filename-safe slug.
 * Replaces runs of non-alphanumeric characters with a single dash.
 */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * Returns today's date in YYYY-MM-DD (ISO) format.
 */
export const getIsoDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

const getMime = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const mimeMap: Record<string, string> = {
    pdf: 'application/pdf',
    xml: 'application/xml',
    json: 'application/ld+json',
  };
  return mimeMap[ext] || 'application/octet-stream';
};

/**
 * Opens the native Save As dialog immediately (while the browser's user-gesture
 * activation is still valid) and returns a FileSystemFileHandle.
 *
 * Returns null when showSaveFilePicker is unavailable (use anchor fallback).
 * Returns undefined when the user cancelled.
 *
 * IMPORTANT: Call this as the very first await in any export handler, before
 * any async data-fetching, so the browser honours the user-gesture requirement.
 */
export const acquireSaveFileHandle = async (filename: string): Promise<any | null | undefined> => {
  if (typeof (window as any).showSaveFilePicker !== 'function') return null;
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const mime = getMime(filename);
  try {
    return await (window as any).showSaveFilePicker({
      suggestedName: filename,
      types: [{ description: 'File', accept: { [mime]: [`.${ext}`] } }],
    });
  } catch (err: any) {
    if (err.name === 'AbortError') return undefined; // user cancelled
    throw err;
  }
};

/**
 * Writes a Blob to a previously acquired FileSystemFileHandle, or falls back
 * to an anchor download if handle is null (no showSaveFilePicker support).
 * Does nothing if handle is undefined (user cancelled the picker).
 */
export const writeToFileHandle = async (
  handle: any | null | undefined,
  blob: Blob,
  filename: string
): Promise<void> => {
  if (handle === undefined) return; // user cancelled
  if (handle !== null) {
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
  } else {
    // Anchor fallback for Firefox / Safari
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

/**
 * Convenience wrapper for cases where there is no async work before saving
 * (e.g. the blob is already built synchronously).  Calls acquireSaveFileHandle
 * then writeToFileHandle in one step.
 */
export const saveFileWithPicker = async (blob: Blob, filename: string): Promise<void> => {
  const handle = await acquireSaveFileHandle(filename);
  await writeToFileHandle(handle, blob, filename);
};
