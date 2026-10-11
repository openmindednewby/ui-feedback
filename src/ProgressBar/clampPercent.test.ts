import { clampPercent } from './clampPercent';

describe('clampPercent', () => {
  it('with a value inside 0-100, returns it unchanged', () => {
    const value = 42.5;

    const result = clampPercent(value);

    expect(result).toBe(value);
  });

  it('with a value above 100, returns 100', () => {
    const value = 140;

    const result = clampPercent(value);

    expect(result).toBe(100);
  });

  it('with a negative value, returns 0', () => {
    const value = -3;

    const result = clampPercent(value);

    expect(result).toBe(0);
  });

  it.each([null, undefined, Number.NaN, Number.POSITIVE_INFINITY])('with %p, returns 0', (value) => {
    const input = value;

    const result = clampPercent(input);

    expect(result).toBe(0);
  });
});
