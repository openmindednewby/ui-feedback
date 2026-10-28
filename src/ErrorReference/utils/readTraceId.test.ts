import { readTraceId } from './readTraceId';

describe('readTraceId', () => {
  it('with a traceId on the error, returns it trimmed', () => {
    const error = Object.assign(new Error('boom'), { traceId: ' 4bf92f3577b34da6 ' });

    const result = readTraceId(error);

    expect(result).toBe('4bf92f3577b34da6');
  });

  it('with no traceId property, returns undefined', () => {
    const error = new Error('boom');

    const result = readTraceId(error);

    expect(result).toBeUndefined();
  });

  it('with a blank traceId, returns undefined', () => {
    const error = { traceId: '   ' };

    const result = readTraceId(error);

    expect(result).toBeUndefined();
  });

  it('with a non-string traceId, returns undefined', () => {
    const error = { traceId: 42 };

    const result = readTraceId(error);

    expect(result).toBeUndefined();
  });

  it('with a non-object error, returns undefined', () => {
    const error = 'boom';

    const result = readTraceId(error);

    expect(result).toBeUndefined();
  });
});
