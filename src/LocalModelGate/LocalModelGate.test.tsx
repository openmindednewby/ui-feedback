import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { createLocalModel, LocalModelBlock } from '@dloizides/text-generation';

import { LocalModelGate } from './LocalModelGate';

import type { LocalModelGateLabels, LocalModelGateSlots, LocalModelGateTestIds } from './types';
import type { LocalModelDeps, TextGenerator } from '@dloizides/text-generation';

const GENERATOR: TextGenerator = { generate: async () => 'ok' };
const HALF = 0.5;

const LABELS: LocalModelGateLabels = {
  blocked: (block) => `blocked:${String(block)}`,
  title: 'title',
  offerBody: 'body',
  consent: 'consent',
  consentHint: 'hint',
  loading: (percent) => `loading:${percent}`,
  failed: 'failed',
  retry: 'retry',
};

const IDS: LocalModelGateTestIds = {
  blocked: 'gate-blocked',
  offer: 'gate-offer',
  loading: 'gate-loading',
  failed: 'gate-failed',
  consent: 'gate-consent',
};

const SLOTS: LocalModelGateSlots = {
  Card: ({ testID, children }) => <div data-testid={testID}>{children}</div>,
  Text: ({ heading, children }) => <span data-heading={heading === true ? 'yes' : 'no'}>{children}</span>,
  Button: ({ label, testID, onPress }) => (
    <button data-testid={testID} type="button" onClick={onPress}>
      {label}
    </button>
  ),
};

async function renderGate(deps: LocalModelDeps): Promise<void> {
  const model = createLocalModel(deps);
  render(
    <LocalModelGate labels={LABELS} model={model} slots={SLOTS} testIds={IDS}>
      <p data-testid="gate-children">ready</p>
    </LocalModelGate>,
  );
  await act(async () => {
    await model.check();
  });
}

describe('LocalModelGate', () => {
  it('with low memory, shows the blocked card with the reason', async () => {
    const deps = { block: async () => LocalModelBlock.LowMemory, load: async () => GENERATOR };

    await renderGate(deps);

    expect(screen.getByTestId(IDS.blocked).textContent).toBe(`blocked:${LocalModelBlock.LowMemory}`);
  });

  it('with a capable browser, offers the download and hides the children', async () => {
    const deps = { block: async () => null, load: async () => GENERATOR };

    await renderGate(deps);

    expect([screen.queryByTestId(IDS.offer) !== null, screen.queryByTestId('gate-children')]).toEqual([true, null]);
  });

  it('on consent, shows the children once loaded', async () => {
    await renderGate({ block: async () => null, load: async () => GENERATOR });

    await act(async () => {
      fireEvent.click(screen.getByTestId(IDS.consent));
    });

    expect(screen.getByTestId('gate-children').textContent).toBe('ready');
  });

  it('during the download, shows the percent', async () => {
    let finish: (generator: TextGenerator) => void = () => undefined;
    await renderGate({
      block: async () => null,
      load: async (onProgress) => {
        onProgress(HALF);
        return new Promise<TextGenerator>((resolve) => {
          finish = resolve;
        });
      },
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId(IDS.consent));
    });

    expect(screen.getByTestId(IDS.loading).textContent).toBe('loading:50');
    finish(GENERATOR);
  });

  it('when the download fails, offers a retry', async () => {
    await renderGate({ block: async () => null, load: async () => Promise.reject(new Error('offline')) });

    await act(async () => {
      fireEvent.click(screen.getByTestId(IDS.consent));
    });

    expect(screen.getByTestId(IDS.consent).textContent).toBe(LABELS.retry);
  });
});
