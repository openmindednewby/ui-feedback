import type { RunGroup, RunStepState } from './runGroups';

export interface LiveRunCardLabels {
  status: string;
  meta: string;
  progress?: string;
  progressA11y: string;
  cancel: string;
  cancelHint: string;
  stepTimings: string;
  stepTimingsHint: string;
  groupHint: string;
  moreStepsHint: string;
  fewerSteps: string;
  formatDuration: (sec: number) => string;
  moreSteps: (count: number) => string;
  doneSummary: (count: number, duration: string) => string;
  groupA11y: (label: string, state: RunStepState, duration: string) => string;
  stepA11y: (label: string, duration: string) => string;
}

export interface LiveRunCardProps {
  title: string;
  status?: RunStepState;
  currentStep?: string | null;
  progress?: { done: number; total: number } | null;
  groups: readonly RunGroup[];
  labels: LiveRunCardLabels;
  onCancel?: () => void;
  cancelDisabled?: boolean;
  compact?: boolean;
  maxBars?: number;
  testID?: string;
}
