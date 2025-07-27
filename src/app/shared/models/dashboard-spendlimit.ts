
export interface MonthlySpendingLimit {
  limitId: number;
  limitAmount: number;
  // Dates are typically received as ISO 8601 strings from the backend.
  // You can convert them to Date objects in your service or component if needed.
  effectiveMonth: string;
}

/**
 * Represents the data structure for setting or updating a monthly spending limit to the API.
 */
export interface SetMonthlySpendingLimitRequest {
  limitAmount: number;
  // Optional: Send as ISO 8601 string (e.g., '2024-07-01T00:00:00Z')
  // If omitted, the backend will default to the current month.
  effectiveMonth?: string;
}

/**
 * Represents a summary of expenses by category for the dashboard.
 * This DTO is part of the overall dashboard summary.
 */
export interface CategoryExpenseSummary {
  categoryId: number;
  categoryName: string;
  totalAmount: number;
}

/**
 * Represents the comprehensive dashboard summary received from the API.
 * This includes total expenses, category breakdown, and the new spending limit data.
 */
export interface DashboardSummary {
  totalExpense: number;
  categoryExpenses: CategoryExpenseSummary[];
  // Nullable if no limit is set for the current month in the backend
  monthlySpendingLimit?: number;
  // Nullable if no limit is set or total expense exceeds limit
  remainingBudget?: number;
}