import {
  barFraction,
  defaultGroupId,
  mergeRunSteps,
  progressPercent,
  splitShorterSteps,
  summariseDoneGroups,
} from './runGroups';

import type { FlatRunStep, RunGroup, RunStep } from './runGroups';

function flat(groupId: string, label: string, durationSec: number, state: FlatRunStep['state'] = 'done'): FlatRunStep {
  return { groupId, groupLabel: groupId, label, durationSec, state };
}

function group(id: string, state: RunGroup['state'], durationSec = 1): RunGroup {
  return { id, label: id, state, durationSec, steps: [] };
}

describe('mergeRunSteps', () => {
  it('with a fetching step and a 0s done marker, returns one group holding only the fetching step', () => {
    const steps = [flat('UN', 'fetching', 4), flat('UN', 'done', 0)];

    const result = mergeRunSteps(steps);

    expect(result).toEqual([
      { id: 'UN', label: 'UN', state: 'done', durationSec: 4, steps: [{ label: 'fetching', durationSec: 4, state: 'done' }] },
    ]);
  });

  it('with interleaved groups, keeps first-seen order and sums each group', () => {
    const steps = [flat('UN', 'fetching', 4), flat('W', 'a', 10), flat('UN', 'persist', 2), flat('W', 'b', 5, 'running')];

    const result = mergeRunSteps(steps);

    expect(result.map((g) => [g.id, g.durationSec, g.state, g.steps.length])).toEqual([
      ['UN', 6, 'done', 2],
      ['W', 15, 'running', 2],
    ]);
  });

  it('with a failed step after a running one, marks the group failed', () => {
    const steps = [flat('X', 'a', 1, 'running'), flat('X', 'b', 1, 'failed')];

    const result = mergeRunSteps(steps);

    expect(result[0].state).toBe('failed');
  });

  it('with a running 0s step or a negative duration, keeps the step and clamps the time to zero', () => {
    const steps = [flat('X', 'fetching', 0, 'running'), flat('X', 'skew', -5, 'pending')];

    const result = mergeRunSteps(steps);

    expect(result[0].steps).toEqual([
      { label: 'fetching', durationSec: 0, state: 'running' },
      { label: 'skew', durationSec: 0, state: 'pending' },
    ]);
  });
});

describe('splitShorterSteps', () => {
  const steps: RunStep[] = [
    { label: 'a', durationSec: 10, state: 'done' },
    { label: 'b', durationSec: 1, state: 'done' },
    { label: 'c', durationSec: 30, state: 'done' },
    { label: 'd', durationSec: 2, state: 'running' },
  ];

  it('with more steps than the cap, keeps the longest plus the running one in original order', () => {
    const keep = 2;

    const result = splitShorterSteps(steps, keep);

    expect(result).toEqual({ visible: [steps[0], steps[2], steps[3]], hiddenCount: 1 });
  });

  it('with no more steps than the cap, hides none', () => {
    const keep = 4;

    const result = splitShorterSteps(steps, keep);

    expect(result.hiddenCount).toBe(0);
  });
});

describe('defaultGroupId', () => {
  it('with a running group, returns it', () => {
    const groups = [group('a', 'done'), group('b', 'running'), group('c', 'pending')];

    const result = defaultGroupId(groups);

    expect(result).toBe('b');
  });

  it('with only finished groups, returns the last one', () => {
    const groups = [group('a', 'done'), group('b', 'done')];

    const result = defaultGroupId(groups);

    expect(result).toBe('b');
  });

  it('with no groups, returns null', () => {
    const groups: RunGroup[] = [];

    const result = defaultGroupId(groups);

    expect(result).toBeNull();
  });
});

describe('summariseDoneGroups', () => {
  it('with done and running groups, counts and sums only the done ones', () => {
    const groups = [group('a', 'done', 4), group('b', 'done', 27), group('c', 'running', 900)];

    const result = summariseDoneGroups(groups);

    expect(result).toEqual({ count: 2, durationSec: 31 });
  });
});

describe('barFraction', () => {
  it.each([
    [30, 60, 0.5],
    [0, 60, 0],
    [5, 0, 0],
    [1, 10000, 0.02],
    [90, 60, 1],
  ])('with %p of %p, returns %p', (duration, max, expected) => {
    const input = { duration, max };

    const result = barFraction(input.duration, input.max);

    expect(result).toBeCloseTo(expected);
  });
});

describe('progressPercent', () => {
  it('with 440 of 5562, returns the share as a percent', () => {
    const progress = { done: 440, total: 5562 };

    const result = progressPercent(progress);

    expect(result).toBeCloseTo(7.91, 1);
  });

  it.each([null, undefined, { done: 3, total: 0 }])('with %p, returns null', (progress) => {
    const input = progress;

    const result = progressPercent(input);

    expect(result).toBeNull();
  });
});
