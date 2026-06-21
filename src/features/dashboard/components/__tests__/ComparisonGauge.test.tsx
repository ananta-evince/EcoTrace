import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { ComparisonGauge } from '../ComparisonGauge';

describe('ComparisonGauge', () => {
  it('renders gauge with accessible description', () => {
    render(<ComparisonGauge userDaily={8.5} nationalDaily={14.2} targetDaily={6.8} />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', expect.stringContaining('8.5'));
  });
});
