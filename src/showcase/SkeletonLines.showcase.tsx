import React from 'react';

import { FeedbackUiProvider } from '../context/FeedbackUiContext';
import type { FeedbackTheme } from '../context/FeedbackUiContext';
import { SkeletonLines } from '../SkeletonLines/SkeletonLines';

const FIGURE_LINES = [{ height: 13, width: '45%' }, { height: 34, width: '60%' }, { height: 13, width: '80%' }];
const CHART_LINES = [{ height: 18, width: '50%' }, { height: 180, radius: 8 }, { height: 13, width: '70%' }];

/** Showcase story: a figure-sized and a chart-sized skeleton, as a dashboard shows them before its data arrives. */
export const SkeletonLinesShowcase = ({ theme }: { theme: FeedbackTheme }): React.ReactElement => (
  <FeedbackUiProvider t={(key) => key} theme={theme}>
    <SkeletonLines lines={FIGURE_LINES} testID="skeleton-lines-figure" />
    <SkeletonLines lines={CHART_LINES} testID="skeleton-lines-chart" />
  </FeedbackUiProvider>
);
