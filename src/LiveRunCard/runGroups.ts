export type RunStepState = 'done' | 'running' | 'pending' | 'failed';

export interface RunStep {
  label: string;
  durationSec: number;
  state: RunStepState;
}

export interface RunGroup {
  id: string;
  label: string;
  state: RunStepState;
  durationSec: number;
  steps: RunStep[];
}

export interface FlatRunStep extends RunStep {
  groupId: string;
  groupLabel: string;
}

export interface StepSplit {
  visible: RunStep[];
  hiddenCount: number;
}

export interface DoneSummary {
  count: number;
  durationSec: number;
}

const STATE_RANK: Record<RunStepState, number> = { done: 0, pending: 1, running: 2, failed: 3 };
const MIN_BAR_FRACTION = 0.02;
const NONE = 0;

function isEmptyDoneMarker(step: RunStep): boolean {
  return step.state === 'done' && step.durationSec <= NONE;
}

/** Folds flat steps into groups in first-seen order: sums each group's time, drops 0s done rows, worst state wins. */
export function mergeRunSteps(flat: readonly FlatRunStep[]): RunGroup[] {
  const groups: RunGroup[] = [];
  const byId = new Map<string, RunGroup>();
  for (const s of flat) {
    let group = byId.get(s.groupId);
    if (group === undefined) {
      group = { id: s.groupId, label: s.groupLabel, state: 'done', durationSec: NONE, steps: [] };
      byId.set(s.groupId, group);
      groups.push(group);
    }
    const durationSec = Math.max(NONE, s.durationSec);
    group.durationSec += durationSec;
    if (STATE_RANK[s.state] > STATE_RANK[group.state]) group.state = s.state;
    if (!isEmptyDoneMarker(s)) group.steps.push({ label: s.label, durationSec, state: s.state });
  }
  return groups;
}

/** Keeps the `keep` longest steps (and any running one) in their original order; counts the rest. */
export function splitShorterSteps(steps: readonly RunStep[], keep: number): StepSplit {
  if (steps.length <= keep) return { visible: [...steps], hiddenCount: NONE };
  const ranked = steps
    .map((step, index) => ({ step, index }))
    .sort((a, b) => b.step.durationSec - a.step.durationSec || a.index - b.index);
  const kept = new Set(ranked.slice(0, keep).map((r) => r.index));
  steps.forEach((step, index) => {
    if (step.state === 'running') kept.add(index);
  });
  const visible = steps.filter((_, index) => kept.has(index));
  return { visible, hiddenCount: steps.length - visible.length };
}

/** The group whose steps show first: the running one, else a failed one, else the last. */
export function defaultGroupId(groups: readonly RunGroup[]): string | null {
  const active = groups.find((g) => g.state === 'running') ?? groups.find((g) => g.state === 'failed');
  if (active !== undefined) return active.id;
  return groups.at(-1)?.id ?? null;
}

/** How many groups finished and their total time, for the compact one-chip summary. */
export function summariseDoneGroups(groups: readonly RunGroup[]): DoneSummary {
  const done = groups.filter((g) => g.state === 'done');
  return { count: done.length, durationSec: done.reduce((sum, g) => sum + g.durationSec, NONE) };
}

/** A step bar's width as a 0-1 fraction of the longest step; a non-zero step never draws invisibly thin. */
export function barFraction(durationSec: number, maxSec: number): number {
  if (maxSec <= NONE || durationSec <= NONE) return NONE;
  return Math.min(1, Math.max(MIN_BAR_FRACTION, durationSec / maxSec));
}

/** 0-100 from done/total, or null when the total is unknown. */
export function progressPercent(progress: { done: number; total: number } | null | undefined): number | null {
  if (!progress || progress.total <= NONE) return null;
  return (Math.max(NONE, progress.done) / progress.total) * 100;
}
