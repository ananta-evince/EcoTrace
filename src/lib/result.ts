/** Result type for explicit error handling without exceptions. */
export type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

/** Creates a successful Result. */
export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

/** Creates a failed Result. */
export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

/** Maps a successful Result value. */
export function mapResult<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U,
): Result<U, E> {
  if (!result.ok) return result;
  return ok(fn(result.value));
}

/** Chains Result operations. */
export function flatMapResult<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>,
): Result<U, E> {
  if (!result.ok) return result;
  return fn(result.value);
}

/** Unwraps a Result or returns a default. */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  return result.ok ? result.value : defaultValue;
}
