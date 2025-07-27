import { Category } from './category-request';

export interface Expense {
  expenseId: number;
  description: string;
  amount: number;
  dateIncurred: Date | string;
  categoryId: number;
  category?: Category; 
  userId: number;
}