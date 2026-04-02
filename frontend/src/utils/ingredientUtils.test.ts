import { getMeasurementDisplay } from './ingredientUtils';

describe('getMeasurementDisplay', () => {
  it('returns empty string for "unit"', () => {
    expect(getMeasurementDisplay('unit')).toBe('');
  });

  it('returns empty string for "Unit" (case-insensitive)', () => {
    expect(getMeasurementDisplay('Unit')).toBe('');
  });

  it('returns empty string for null', () => {
    expect(getMeasurementDisplay(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(getMeasurementDisplay(undefined)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(getMeasurementDisplay('')).toBe('');
  });

  it('returns measurement name for valid unit like "cup"', () => {
    expect(getMeasurementDisplay('cup')).toBe('cup');
  });

  it('returns measurement name for "tablespoon"', () => {
    expect(getMeasurementDisplay('tablespoon')).toBe('tablespoon');
  });

  it('returns measurement name for "oz"', () => {
    expect(getMeasurementDisplay('oz')).toBe('oz');
  });
});
