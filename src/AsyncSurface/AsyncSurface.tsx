/**
 * AsyncSurface — the load / error / loaded contract every data screen shares, resolved once.
 *
 *   failed  → the shared `<ErrorState>` WITH a retry button
 *   loading → the shared shimmer `<PageSkeleton>` (NOT a bare spinner on a blank page)
 *   ok      → the screen's content
 *
 * Pure composition over this package's own `ErrorState` and `PageSkeleton`, so no screen
 * hand-rolls a spinner or an error card and every one of them fails the same way.
 *
 * EMPTY states are deliberately NOT handled here — an empty list is a per-screen designed
 * message + call-to-action (`<EmptyListState>`), not a generic card.
 *
 * ── Why the branch order is what it is, and why it is pinned by a test ──────────────────
 * This component was duplicated in two portals with OPPOSITE branch order, and the
 * difference was a live bug. React Query holds `isError` true while a retry refetch is in
 * flight and raises `isLoading`/`isFetching` at the same time, so during a retry a surface
 * is genuinely BOTH loading and failed. Checking `loading` first makes that overlap render
 * as: error card → skeleton → error card. The retry button is unmounted from under the
 * operator's cursor mid-click, and a user whose first retry failed cannot reach a second.
 *
 * Error therefore wins: a surface that is both loading and failed keeps saying it failed.
 * `AsyncSurface.test.tsx` asserts the both-true case directly — the ordering is a
 * behavioural contract, not an implementation detail, and it must not silently flip back.
 */
import React from 'react';

import { useFeedbackUi } from '../context/FeedbackUiContext';
import { ErrorState } from '../ErrorState/ErrorState';
import { PageSkeleton } from '../PageSkeleton/PageSkeleton';

/** Skeleton rows shown while a list/detail surface loads. */
const DEFAULT_SKELETON_ROWS = 6;

export interface AsyncSurfaceProps {
  /** Truthy while the query is in flight. */
  loading: boolean;
  /** Truthy when the query failed. Takes precedence over `loading` — see the docblock. */
  isError: boolean;
  onRetry: () => void;
  /** Skeleton rows while loading. Match the surface so the layout does not jump. */
  skeletonRows?: number;
  /** `'cards'` for dashboard tiles, `'list'` for tables and forms. */
  variant?: 'list' | 'cards';
  /**
   * Failure message. Defaults to the `common.loadFailed` key from the provider's `t`, so the
   * server's raw text is never shown to a user.
   */
  message?: string;
  children: React.ReactNode;
}

export const AsyncSurface = ({
  loading,
  isError,
  onRetry,
  skeletonRows = DEFAULT_SKELETON_ROWS,
  variant = 'list',
  message,
  children,
}: AsyncSurfaceProps): React.ReactNode => {
  const { t } = useFeedbackUi();

  // Error FIRST. See the docblock — reversing these two lines reintroduces the vanishing
  // retry button, and `AsyncSurface.test.tsx` fails if it is reversed.
  if (isError) return <ErrorState message={message ?? t('common.loadFailed')} onRetry={onRetry} />;
  if (loading) return <PageSkeleton showHeader rows={skeletonRows} variant={variant} />;

  return children;
};

export default AsyncSurface;
