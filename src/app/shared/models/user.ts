export interface User {
  userId: number;
  username: string;
  email: string;
  passwordHash?: string; 
  expenses?: any[];
  categories?: any[];
  monthlySpendingLimits?: any[]; 
}