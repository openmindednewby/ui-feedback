import { render, screen } from '@testing-library/react';

import { ProgressBar } from './ProgressBar';

const TEST_ID = 'job-progress';

describe('ProgressBar', () => {
  it('with a percent above 100, reports aria-valuenow 100', () => {
    const percent = 180;

    render(<ProgressBar percent={percent} testID={TEST_ID} />);

    expect(screen.getByTestId(TEST_ID).getAttribute('aria-valuenow')).toBe('100');
  });

  it('with a determinate percent, exposes the progressbar role and 0-100 range', () => {
    const percent = 37;

    render(<ProgressBar percent={percent} testID={TEST_ID} />);

    const bar = screen.getByTestId(TEST_ID);
    expect([bar.getAttribute('role'), bar.getAttribute('aria-valuemin'), bar.getAttribute('aria-valuemax')])
      .toEqual(['progressbar', '0', '100']);
  });

  it('with indeterminate set, omits aria-valuenow and marks the bar busy', () => {
    const indeterminate = true;

    render(<ProgressBar indeterminate={indeterminate} testID={TEST_ID} />);

    const bar = screen.getByTestId(TEST_ID);
    expect([bar.getAttribute('aria-valuenow'), bar.getAttribute('aria-busy')]).toEqual([null, 'true']);
  });

  it('with a label and no accessibilityLabel, uses the label as the accessible name', () => {
    const label = '40 / 100 (40%)';

    render(<ProgressBar label={label} percent={40} testID={TEST_ID} />);

    expect(screen.getByTestId(TEST_ID).getAttribute('aria-label')).toBe(label);
  });

  it('with an explicit accessibilityLabel, prefers it over the label', () => {
    const accessibilityLabel = 'Import progress';

    render(<ProgressBar accessibilityLabel={accessibilityLabel} label="40%" percent={40} testID={TEST_ID} />);

    expect(screen.getByTestId(TEST_ID).getAttribute('aria-label')).toBe(accessibilityLabel);
  });
});
