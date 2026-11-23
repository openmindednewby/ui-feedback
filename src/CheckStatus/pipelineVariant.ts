import type { CheckStatusVariant } from './CheckStatus';

export const PIPELINE_COLLAPSE_BREAKPOINT = 768;

/** Tiles in one row at or above the breakpoint, one row per check below it. */
export function pipelineVariant(width: number, breakpoint: number = PIPELINE_COLLAPSE_BREAKPOINT): CheckStatusVariant {
  return width >= breakpoint ? 'tile' : 'row';
}
