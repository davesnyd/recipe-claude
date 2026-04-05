import { slugify, getIsoDate, acquireSaveFileHandle, writeToFileHandle, saveFileWithPicker } from './exportUtils';

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

describe('acquireSaveFileHandle', () => {
  afterEach(() => {
    delete (window as any).showSaveFilePicker;
    jest.restoreAllMocks();
  });

  it('returns null when showSaveFilePicker is not available', async () => {
    delete (window as any).showSaveFilePicker;
    const result = await acquireSaveFileHandle('test.pdf');
    expect(result).toBeNull();
  });

  it('returns a file handle when picker is available and user confirms', async () => {
    const mockHandle = { createWritable: jest.fn() };
    (window as any).showSaveFilePicker = jest.fn().mockResolvedValue(mockHandle);

    const result = await acquireSaveFileHandle('recipe.pdf');
    expect(result).toBe(mockHandle);
    expect((window as any).showSaveFilePicker).toHaveBeenCalledWith(
      expect.objectContaining({ suggestedName: 'recipe.pdf' })
    );
  });

  it('returns undefined when user cancels', async () => {
    (window as any).showSaveFilePicker = jest.fn().mockRejectedValue(
      new DOMException('User cancelled', 'AbortError')
    );
    const result = await acquireSaveFileHandle('recipe.pdf');
    expect(result).toBeUndefined();
  });

  it('throws for non-AbortError failures', async () => {
    (window as any).showSaveFilePicker = jest.fn().mockRejectedValue(
      new Error('Unexpected error')
    );
    await expect(acquireSaveFileHandle('recipe.pdf')).rejects.toThrow('Unexpected error');
  });
});

describe('writeToFileHandle', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does nothing when handle is undefined (user cancelled)', async () => {
    const blob = new Blob(['test']);
    await expect(writeToFileHandle(undefined, blob, 'test.pdf')).resolves.toBeUndefined();
  });

  it('writes to handle when a valid handle is provided', async () => {
    const writeMock = jest.fn();
    const closeMock = jest.fn();
    const handle = { createWritable: jest.fn().mockResolvedValue({ write: writeMock, close: closeMock }) };

    const blob = new Blob(['content'], { type: 'application/pdf' });
    await writeToFileHandle(handle, blob, 'recipe.pdf');

    expect(writeMock).toHaveBeenCalledWith(blob);
    expect(closeMock).toHaveBeenCalled();
  });

  it('falls back to anchor download when handle is null', async () => {
    const createObjectURL = jest.fn(() => 'blob:mock-url');
    const revokeObjectURL = jest.fn();
    Object.defineProperty(window, 'URL', { writable: true, value: { createObjectURL, revokeObjectURL } });

    const clickMock = jest.fn();
    jest.spyOn(document.body, 'appendChild').mockImplementation(() => document.body);
    jest.spyOn(document.body, 'removeChild').mockImplementation(() => document.body);
    jest.spyOn(document, 'createElement').mockReturnValue({ click: clickMock, href: '', download: '' } as any);

    const blob = new Blob(['test'], { type: 'application/xml' });
    await writeToFileHandle(null, blob, 'recipes.xml');

    expect(clickMock).toHaveBeenCalled();
  });
});

describe('saveFileWithPicker', () => {
  afterEach(() => {
    delete (window as any).showSaveFilePicker;
    jest.restoreAllMocks();
  });

  it('uses showSaveFilePicker when available', async () => {
    const writeMock = jest.fn();
    const closeMock = jest.fn();
    (window as any).showSaveFilePicker = jest.fn().mockResolvedValue({
      createWritable: jest.fn().mockResolvedValue({ write: writeMock, close: closeMock }),
    });

    await saveFileWithPicker(new Blob(['pdf']), 'recipe.pdf');

    expect(writeMock).toHaveBeenCalled();
    expect(closeMock).toHaveBeenCalled();
  });

  it('falls back to anchor download when picker is unavailable', async () => {
    delete (window as any).showSaveFilePicker;
    const clickMock = jest.fn();
    jest.spyOn(document.body, 'appendChild').mockImplementation(() => document.body);
    jest.spyOn(document.body, 'removeChild').mockImplementation(() => document.body);
    jest.spyOn(document, 'createElement').mockReturnValue({ click: clickMock, href: '', download: '' } as any);
    Object.defineProperty(window, 'URL', {
      writable: true,
      value: { createObjectURL: jest.fn(() => 'blob:url'), revokeObjectURL: jest.fn() },
    });

    await saveFileWithPicker(new Blob(['xml']), 'recipes.xml');
    expect(clickMock).toHaveBeenCalled();
  });
});
