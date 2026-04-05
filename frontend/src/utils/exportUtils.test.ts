import { slugify, getIsoDate, saveFileWithPicker } from './exportUtils';

describe('slugify', () => {
  it('lowercases and replaces spaces with dashes', () => {
    expect(slugify('Apple Pie')).toBe('apple-pie');
  });

  it('collapses multiple special characters into one dash', () => {
    expect(slugify('Matzoh & Pesto -- Sandwich!')).toBe('matzoh-pesto-sandwich');
  });

  it('strips leading and trailing dashes', () => {
    expect(slugify('  Hello World  ')).toBe('hello-world');
  });

  it('handles all-numeric titles', () => {
    expect(slugify('365 Days')).toBe('365-days');
  });

  it('returns empty string for empty input', () => {
    expect(slugify('')).toBe('');
  });
});

describe('getIsoDate', () => {
  it('returns a string matching YYYY-MM-DD', () => {
    expect(getIsoDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('saveFileWithPicker', () => {
  const originalShowSaveFilePicker = (window as any).showSaveFilePicker;

  afterEach(() => {
    if (originalShowSaveFilePicker === undefined) {
      delete (window as any).showSaveFilePicker;
    } else {
      (window as any).showSaveFilePicker = originalShowSaveFilePicker;
    }
    jest.restoreAllMocks();
  });

  it('falls back to anchor download when showSaveFilePicker is not available', async () => {
    delete (window as any).showSaveFilePicker;

    const createObjectURL = jest.fn(() => 'blob:mock-url');
    const revokeObjectURL = jest.fn();
    Object.defineProperty(window, 'URL', {
      writable: true,
      value: { createObjectURL, revokeObjectURL },
    });

    const clickMock = jest.fn();
    const appendChildMock = jest.spyOn(document.body, 'appendChild').mockImplementation(() => document.body);
    const removeChildMock = jest.spyOn(document.body, 'removeChild').mockImplementation(() => document.body);
    jest.spyOn(document, 'createElement').mockReturnValue({ click: clickMock, href: '', download: '' } as any);

    const blob = new Blob(['test'], { type: 'text/plain' });
    await saveFileWithPicker(blob, 'test.xml');

    expect(clickMock).toHaveBeenCalled();
    appendChildMock.mockRestore();
    removeChildMock.mockRestore();
  });

  it('uses showSaveFilePicker when available', async () => {
    const writeMock = jest.fn();
    const closeMock = jest.fn();
    const createWritableMock = jest.fn().mockResolvedValue({ write: writeMock, close: closeMock });
    (window as any).showSaveFilePicker = jest.fn().mockResolvedValue({ createWritable: createWritableMock });

    const blob = new Blob(['test'], { type: 'application/pdf' });
    await saveFileWithPicker(blob, 'recipe.pdf');

    expect((window as any).showSaveFilePicker).toHaveBeenCalledWith(
      expect.objectContaining({ suggestedName: 'recipe.pdf' })
    );
    expect(writeMock).toHaveBeenCalledWith(blob);
    expect(closeMock).toHaveBeenCalled();
  });

  it('silently ignores AbortError when user cancels picker', async () => {
    const abortError = new DOMException('User cancelled', 'AbortError');
    (window as any).showSaveFilePicker = jest.fn().mockRejectedValue(abortError);

    const blob = new Blob(['test'], { type: 'application/pdf' });
    await expect(saveFileWithPicker(blob, 'recipe.pdf')).resolves.toBeUndefined();
  });
});
