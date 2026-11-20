import React, { useCallback } from 'react';

import { LocalModelPhase } from '@dloizides/text-generation';

import { useLocalModel } from './useLocalModel';

import type { LocalModelGateProps } from './types';

const PERCENT = 100;

/** Shows its children only once the local model is ready; before that it offers the download or says why it cannot run. */
export const LocalModelGate = ({
  model,
  labels,
  testIds,
  slots,
  children,
}: LocalModelGateProps): React.ReactElement | null => {
  const { phase, block, progress } = useLocalModel(model);
  const consent = useCallback((): void => {
    model.consent().catch(() => undefined);
  }, [model]);
  const { Card, Text, Button } = slots;
  switch (phase) {
    case LocalModelPhase.Checking:
      return null;
    case LocalModelPhase.Blocked:
      return (
        <Card testID={testIds.blocked}>
          <Text>{labels.blocked(block)}</Text>
        </Card>
      );
    case LocalModelPhase.Offer:
      return (
        <Card testID={testIds.offer}>
          <Text heading>{labels.title}</Text>
          <Text>{labels.offerBody}</Text>
          <Button hint={labels.consentHint} label={labels.consent} testID={testIds.consent} onPress={consent} />
        </Card>
      );
    case LocalModelPhase.Loading:
      return (
        <Card testID={testIds.loading}>
          <Text>{labels.loading(String(Math.round(progress * PERCENT)))}</Text>
        </Card>
      );
    case LocalModelPhase.Failed:
      return (
        <Card testID={testIds.failed}>
          <Text>{labels.failed}</Text>
          <Button hint={labels.consentHint} label={labels.retry} testID={testIds.consent} onPress={consent} />
        </Card>
      );
    case LocalModelPhase.Ready:
    default:
      return children;
  }
};
