import { describe, expect, test } from 'vitest';

import {
  hasNumberProp,
  hasProp,
  hasStringProp,
  isNumber,
  isObject,
  isString,
} from '../../src/shared/guards';

describe('shared/guards', () => {
  test('isObject', () => {
    expect(isObject({})).toBe(true);
    expect(isObject([])).toBe(true);
    expect(isObject(null)).toBe(false);
    expect(isObject(123)).toBe(false);
  });

  test('isString', () => {
    expect(isString('a')).toBe(true);
    expect(isString(1)).toBe(false);
  });

  test('isNumber (finite only)', () => {
    expect(isNumber(1)).toBe(true);
    expect(isNumber(NaN)).toBe(false);
    expect(isNumber(Infinity)).toBe(false);
    expect(isNumber('1' as any)).toBe(false);
  });

  test('hasProp', () => {
    const obj: any = { a: 1 };
    expect(hasProp(obj, 'a')).toBe(true);
    expect(hasProp(obj, 'b')).toBe(false);
  });

  test('hasStringProp / hasNumberProp', () => {
    const obj: any = { s: 'x', n: 2, inf: Infinity };
    expect(hasStringProp(obj, 's')).toBe(true);
    expect(hasStringProp(obj, 'n')).toBe(false);
    expect(hasNumberProp(obj, 'n')).toBe(true);
    expect(hasNumberProp(obj, 'inf')).toBe(false);
  });
});
