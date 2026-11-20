import type { ComponentType, ReactElement, ReactNode } from 'react';

import type { LocalModel, LocalModelBlock } from '@dloizides/text-generation';

export interface LocalModelGateLabels {
  blocked: (block: LocalModelBlock | null) => string;
  title: string;
  offerBody: string;
  consent: string;
  consentHint: string;
  loading: (percent: string) => string;
  failed: string;
  retry: string;
}

export interface LocalModelGateTestIds {
  blocked: string;
  offer: string;
  loading: string;
  failed: string;
  consent: string;
}

export interface LocalModelGateSlots {
  Card: ComponentType<{ testID: string; children: ReactNode }>;
  Text: ComponentType<{ heading?: boolean; children: string }>;
  Button: ComponentType<{ label: string; hint: string; testID: string; onPress: () => void }>;
}

export interface LocalModelGateProps {
  model: LocalModel;
  labels: LocalModelGateLabels;
  testIds: LocalModelGateTestIds;
  slots: LocalModelGateSlots;
  children: ReactElement;
}
