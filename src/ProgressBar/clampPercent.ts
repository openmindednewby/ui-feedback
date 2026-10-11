export const MIN_PERCENT = 0;
export const MAX_PERCENT = 100;

/** Clamps a possibly missing or non-finite percent into the 0-100 range. */
export function clampPercent(value: number | null | undefined): number {
  if (value === null || value === undefined || !Number.isFinite(value)) return MIN_PERCENT;
  return Math.min(MAX_PERCENT, Math.max(MIN_PERCENT, value));
}
