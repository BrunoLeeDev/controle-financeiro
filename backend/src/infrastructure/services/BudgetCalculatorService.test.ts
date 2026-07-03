import { BudgetCalculatorService } from '../../infrastructure/services/BudgetCalculatorService';

describe('BudgetCalculatorService', () => {
  const calculator = new BudgetCalculatorService();

  it('should calculate spent, remaining and percentage', () => {
    const budgets = [
      {
        id: '1',
        userId: 'u1',
        categoryId: 'c1',
        month: 6,
        year: 2026,
        limitAmount: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const spentMap = new Map([['c1', 750]]);

    const result = calculator.calculateStatus(budgets, spentMap);

    expect(result[0].spent).toBe(750);
    expect(result[0].remaining).toBe(250);
    expect(result[0].percentage).toBe(75);
  });

  it('should handle zero limit', () => {
    const budgets = [
      {
        id: '1',
        userId: 'u1',
        categoryId: 'c1',
        month: 6,
        year: 2026,
        limitAmount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const result = calculator.calculateStatus(budgets, new Map());

    expect(result[0].percentage).toBe(0);
  });
});
