import React from 'react';

import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { CheckStatus } from './CheckStatus';
import { pipelineItemVariant, pipelineVariant } from './pipelineVariant';

import type { CheckStatusProps } from './CheckStatus';

const GRID_GAP_SHARE = 2;

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
  phoneColumns?: number;
  statusUnderTitleEnabled?: boolean;
}

/** The checks as equal tiles in one row on a computer; on a phone one row per check, or a tile grid of `phoneColumns`. */
export const CheckPipeline = ({ items, breakpoint, accessibilityLabel, accessibilityHint, testID, phoneColumns = 1, statusUnderTitleEnabled }: CheckPipelineProps): React.ReactElement => {
  const width = useWindowDimensions().width;
  const variant = pipelineVariant(width, breakpoint);
  const itemVariant = pipelineItemVariant(width, breakpoint, phoneColumns);
  const grid = variant !== itemVariant;
  const cell = { flexBasis: `${Math.floor(100 / phoneColumns) - GRID_GAP_SHARE}%` as const, flexGrow: 1 };
  const containerStyle = variant === 'tile' ? styles.row : grid ? styles.grid : styles.list;
  return (
    <View accessibilityHint={accessibilityHint} accessibilityLabel={accessibilityLabel} accessibilityRole="summary" style={containerStyle} testID={testID}>
      {items.map(({ id, ...item }) => {
        const check = <CheckStatus key={id} {...item} statusUnderTitleEnabled={statusUnderTitleEnabled} variant={itemVariant} />;
        return grid ? <View key={id} style={cell}>{check}</View> : check;
      })}
    </View>
  );
};
export default CheckPipeline;
