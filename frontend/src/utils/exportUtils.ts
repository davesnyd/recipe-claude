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

/**
 * Saves a Blob to a user-chosen location.
 *
 * On browsers that support the File System Access API (Chrome, Edge) this opens
 * the native "Save As" dialog, letting the user pick any directory. The browser
 * remembers the last-used directory automatically.
 *
 * On other browsers (Firefox, Safari) it falls back to a standard anchor-based
 * download to the default Downloads folder.
 */
export const saveFileWithPicker = async (blob: Blob, filename: string): Promise<void> => {
  if (typeof (window as any).showSaveFilePicker === 'function') {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const mimeMap: Record<string, string> = {
      pdf: 'application/pdf',
      xml: 'application/xml',
      json: 'application/ld+json',
    };
    const mime = mimeMap[ext] || 'application/octet-stream';
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [{ description: 'File', accept: { [mime]: [`.${ext}`] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
    } catch (err: any) {
      // AbortError means the user cancelled — not an error
      if (err.name !== 'AbortError') throw err;
    }
  } else {
    // Fallback: browser-controlled download to default Downloads folder
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
