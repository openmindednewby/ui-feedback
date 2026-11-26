import type { CheckStatusVariant } from './CheckStatus';

export const PIPELINE_COLLAPSE_BREAKPOINT = 768;

/** Tiles in one row at or above the breakpoint, one row per check below it. */
export function pipelineVariant(width: number, breakpoint: number = PIPELINE_COLLAPSE_BREAKPOINT): CheckStatusVariant {
  return width >= breakpoint ? 'tile' : 'row';
}

/** The variant each check takes: a phone grid of more than one column keeps tiles, else the pipeline variant. */
export function pipelineItemVariant(width: number, breakpoint: number = PIPELINE_COLLAPSE_BREAKPOINT, phoneColumns = 1): CheckStatusVariant {
  const variant = pipelineVariant(width, breakpoint);
  return variant === 'row' && phoneColumns > 1 ? 'tile' : variant;
}
