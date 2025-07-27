// // import { Injectable } from '@angular/core';
// // import { HttpClient } from '@angular/common/http';
// // import { Observable } from 'rxjs';
// // import { Expense } from '../../shared/models/expense.request'; 
// // import { ApiEndpoints } from '../../shared/api-endpoints';

// // @Injectable({
// //   providedIn: 'root'
// // })
// // export class ExpenseService {

// //   constructor(private http: HttpClient) { }

// //   getAllExpenses(): Observable<Expense[]> {
// //     return this.http.get<Expense[]>(ApiEndpoints.Expenses.Base);
// //   }

// //   getExpenseById(id: number): Observable<Expense> {
// //     return this.http.get<Expense>(ApiEndpoints.Expenses.ById(id));
// //   }

// //   createExpense(expense: Omit<Expense, 'expenseId' | 'userId' | 'category'>): Observable<Expense> {
// //     return this.http.post<Expense>(ApiEndpoints.Expenses.Base, expense);
// //   }

// //   updateExpense(id: number, expense: Partial<Omit<Expense, 'expenseId' | 'userId' | 'category'>>): Observable<void> {
// //     return this.http.put<void>(ApiEndpoints.Expenses.ById(id), expense);
// //   }

// //   deleteExpense(id: number): Observable<void> {
// //     return this.http.delete<void>(ApiEndpoints.Expenses.ById(id));
// //   }
// // }

// // src/app/shared/services/expense.service.ts
// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { Expense, ExpenseApiResponse } from '../../shared/models/expense-response';
// import { ApiEndpoints } from '../../shared/api-endpoints';

// @Injectable({
//   providedIn: 'root'
// })
// export class ExpenseService {

//   constructor(private http: HttpClient) { }

//   // Now returns ExpenseApiResponse, which contains the 'expenses' array
//   getAllExpenses(): Observable<ExpenseApiResponse> {
//     return this.http.get<ExpenseApiResponse>(ApiEndpoints.Expenses.Base);
//   }

//   getExpenseById(id: number): Observable<Expense> {
//     return this.http.get<Expense>(ApiEndpoints.Expenses.ById(id));
//   }

//   // Define a type for the payload sent to create/update
//   // This aligns with what you'd send: description, amount, date, and categoryId
//   // The backend will generate id, userId, and categoryName from categoryId
//   createExpense(expense: { description: string; amount: number; date: string; categoryId: number; }): Observable<Expense> {
//     return this.http.post<Expense>(ApiEndpoints.Expenses.Base, expense);
//   }

//   // Define a type for the payload sent to update
//   updateExpense(id: number, expense: { description?: string; amount?: number; date?: string; categoryId?: number; }): Observable<void> {
//     return this.http.put<void>(ApiEndpoints.Expenses.ById(id), expense);
//   }

//   deleteExpense(id: number): Observable<void> {
//     return this.http.delete<void>(ApiEndpoints.Expenses.ById(id));
//   }
// }

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Expense, ExpenseApiResponse } from '../../shared/models/expense-response';
import { ApiEndpoints } from '../../shared/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  constructor(private http: HttpClient) { }

  getAllExpenses(startDate?: string, endDate?: string): Observable<ExpenseApiResponse> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    params = params.set('sortBy', 'date');
    params = params.set('sortOrder', 'asc');

    return this.http.get<ExpenseApiResponse>(ApiEndpoints.Expenses.Base, { params });
  }

  getExpenseById(id: number): Observable<Expense> {
    return this.http.get<Expense>(ApiEndpoints.Expenses.ById(id));
  }

  createExpense(expense: { description: string; amount: number; date: string; categoryId: number; }): Observable<Expense> {
    return this.http.post<Expense>(ApiEndpoints.Expenses.Base, expense);
  }

  updateExpense(id: number, expense: { description?: string; amount?: number; date?: string; categoryId?: number; }): Observable<void> {
    return this.http.put<void>(ApiEndpoints.Expenses.ById(id), expense);
  }

  deleteExpense(id: number): Observable<void> {
    return this.http.delete<void>(ApiEndpoints.Expenses.ById(id));
  }
}