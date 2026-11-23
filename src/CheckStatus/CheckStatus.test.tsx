import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { AttentionCard } from '../AttentionCard';
import { meetsThreshold, meterPercent, ThresholdMeter } from '../ThresholdMeter';
import { CheckStatus } from './CheckStatus';
import { pipelineVariant, PIPELINE_COLLAPSE_BREAKPOINT } from './pipelineVariant';

const TEST_ID = 'check';

describe('CheckStatus', () => {
  it('with onPress, calls it once when pressed', () => {
    const onPress = jest.fn();
    render(<CheckStatus accessibilityHint="Opens it" accessibilityLabel="Document, passed" testID={TEST_ID} title="Document" onPress={onPress} />);

    fireEvent.click(screen.getByTestId(TEST_ID));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('without onPress, exposes no button role', () => {
    const label = 'Document, passed';

    render(<CheckStatus accessibilityHint="Status" accessibilityLabel={label} testID={TEST_ID} title="Document" />);

    expect(screen.getByTestId(TEST_ID).getAttribute('role')).toBeNull();
  });
});

describe('pipelineVariant', () => {
  it('at the breakpoint width, returns tile', () => {
    const width = PIPELINE_COLLAPSE_BREAKPOINT;

    const variant = pipelineVariant(width);

    expect(variant).toBe('tile');
  });

  it('one pixel below a custom breakpoint, returns row', () => {
    const breakpoint = 1024;

    const variant = pipelineVariant(breakpoint - 1, breakpoint);

    expect(variant).toBe('row');
  });
});

describe('meterPercent', () => {
  it('with a value of 0.42 out of 1, returns 42', () => {
    const value = 0.42;

    const percent = meterPercent(value, 1);

    expect(percent).toBeCloseTo(42);
  });

  it('with a zero max, returns 0', () => {
    const max = 0;

    const percent = meterPercent(5, max);

    expect(percent).toBe(0);
  });
});

describe('meetsThreshold', () => {
  it('with a value equal to the threshold, passes', () => {
    const threshold = 0.8;

    const passes = meetsThreshold(0.8, threshold, false);

    expect(passes).toBe(true);
  });

  it('with lowerPasses and a value above the threshold, fails', () => {
    const lowerPasses = true;

    const passes = meetsThreshold(0.9, 0.5, lowerPasses);

    expect(passes).toBe(false);
  });
});

describe('ThresholdMeter', () => {
  it('with a value below the threshold, marks the meter as not passing and reports the value', () => {
    const value = 0.61;

    render(<ThresholdMeter accessibilityHint="Score against the pass line" label="Similarity" testID="meter" threshold={0.8} value={value} valueText="61% (pass 80%)" />);

    const meter = screen.getByTestId('meter');
    expect([meter.getAttribute('data-passes'), meter.getAttribute('aria-valuenow')]).toEqual(['false', '0.61']);
  });
});

describe('AttentionCard', () => {
  it('without a heading, renders no head row', () => {
    const message = 'Every check passed.';

    render(<AttentionCard message={message} testID="attention" title="Needs a person" />);

    expect(screen.queryByTestId('attention-head')).toBeNull();
  });
});
