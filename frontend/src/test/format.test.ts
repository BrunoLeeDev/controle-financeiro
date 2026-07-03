import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../utils/format';

describe('formatCurrency', () => {
  it('should format BRL currency', () => {
    expect(formatCurrency(1234.56)).toContain('1.234,56');
  });
});
