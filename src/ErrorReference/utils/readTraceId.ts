function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** The trace id `@dloizides/bff-web-client` (>= 1.4.0) attaches to a failed request, if any. */
export function readTraceId(error: unknown): string | undefined {
  if (!isRecord(error)) return undefined;
  const id = error.traceId;
  if (typeof id !== 'string') return undefined;
  const trimmed = id.trim();
  return trimmed === '' ? undefined : trimmed;
}
