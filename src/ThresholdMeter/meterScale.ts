import { clampPercent } from '../ProgressBar/clampPercent';

const PERCENT = 100;

/** A value as a 0-100 share of max; a non-positive max gives 0. */
export function meterPercent(value: number, max: number): number {
  return max > 0 ? clampPercent((value / max) * PERCENT) : 0;
}

/** Whether a value meets its threshold: at or above it, or at or below it when lower passes. */
export function meetsThreshold(value: number, threshold: number, lowerPasses: boolean): boolean {
  return lowerPasses ? value <= threshold : value >= threshold;
}
