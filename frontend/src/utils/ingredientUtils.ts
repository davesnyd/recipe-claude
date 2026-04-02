/**
 * Returns the measurement name for display, treating the "unit" sentinel
 * (stored by the backend when no unit is specified) as blank.
 */
export function getMeasurementDisplay(name: string | null | undefined): string {
  if (!name || name.toLowerCase() === 'unit') return '';
  return name;
}
