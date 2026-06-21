import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { StreamingText } from '../StreamingText';

describe('StreamingText', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('streams words progressively', () => {
    render(<StreamingText content="Hello world" />);
    expect(screen.getByRole('log')).toHaveAttribute('aria-live', 'polite');
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.getByRole('log').textContent).toContain('Hello');
  });
});
