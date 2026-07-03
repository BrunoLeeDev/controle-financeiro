import { Budget, BudgetWithStatus } from '../../domain/entities';
import { IBudgetCalculator } from '../../domain/repositories';

export class BudgetCalculatorService implements IBudgetCalculator {
  calculateStatus(budgets: Budget[], spentByCategory: Map<string, number>): BudgetWithStatus[] {
    return budgets.map((budget) => {
      const spent = spentByCategory.get(budget.categoryId) ?? 0;
      const remaining = Math.max(budget.limitAmount - spent, 0);
      const percentage = budget.limitAmount > 0 ? (spent / budget.limitAmount) * 100 : 0;

      return {
        ...budget,
        spent,
        remaining,
        percentage: Math.round(percentage * 100) / 100,
      };
    });
  }
}
