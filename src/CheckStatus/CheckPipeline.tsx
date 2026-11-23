import React from 'react';

import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { CheckStatus } from './CheckStatus';
import { pipelineVariant } from './pipelineVariant';

import type { CheckStatusProps } from './CheckStatus';

const styles = StyleSheet.create({
  list: { gap: 8 },
  row: { flexDirection: 'row', gap: 12 },
});

export interface CheckPipelineItem extends Omit<CheckStatusProps, 'variant'> {
  id: string;
}

export interface CheckPipelineProps {
  items: readonly CheckPipelineItem[];
  breakpoint?: number;
  accessibilityLabel: string;
  accessibilityHint: string;
  testID?: string;
}

/** The checks as equal tiles in one row on a computer and one row per check on a phone. */
export const CheckPipeline = ({ items, breakpoint, accessibilityLabel, accessibilityHint, testID }: CheckPipelineProps): React.ReactElement => {
  const variant = pipelineVariant(useWindowDimensions().width, breakpoint);
  return (
    <View accessibilityHint={accessibilityHint} accessibilityLabel={accessibilityLabel} accessibilityRole="summary" style={variant === 'tile' ? styles.row : styles.list} testID={testID}>
      {items.map(({ id, ...item }) => <CheckStatus key={id} {...item} variant={variant} />)}
    </View>
  );
};

export default CheckPipeline;
