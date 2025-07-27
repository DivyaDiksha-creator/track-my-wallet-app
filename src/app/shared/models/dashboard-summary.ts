export interface CategoryExpenseSummary {
  categoryId: number;
  categoryName: string;
  totalAmount: number;
}

export interface DashboardSummaryResponse {
  totalExpense: number;
  categoryExpenses: CategoryExpenseSummary[];
}