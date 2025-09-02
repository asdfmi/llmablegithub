export const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

export const isString = (v: unknown): v is string => typeof v === "string";

export const isNumber = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);

export const hasProp = <K extends string>(o: unknown, k: K): o is Record<K, unknown> =>
  isObject(o) && k in o;

export const hasStringProp = <K extends string>(o: unknown, k: K): o is Record<K, string> =>
  hasProp(o, k) && isString((o as Record<string, unknown>)[k]);

export const hasNumberProp = <K extends string>(o: unknown, k: K): o is Record<K, number> =>
  hasProp(o, k) && isNumber((o as Record<string, unknown>)[k]);
