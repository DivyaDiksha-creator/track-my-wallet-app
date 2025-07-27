// src/app/shared/models/expense.response.ts
export interface Expense {
  id?: number; 
  description: string;
  amount: number;
  date: string; 
  categoryId: number; 
  categoryName: string; 
}

// Interface for the full API response from getAllExpenses
export interface ExpenseApiResponse {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalExpenses: number;
  expenses: Expense[];
}