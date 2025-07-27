import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Expense } from '../../shared/models/expense-response'; 
import { ApiEndpoints } from '../../shared/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class ChartService {
  // #region Constructor
  constructor(private http: HttpClient) {}
  // #endregion

  // #region Chart Data Fetching and Processing
  getMonthlySpendingTrendData(): Observable<any[]> {
    return this.http.get<Expense[]>(ApiEndpoints.Expenses.Base).pipe(
      map((expenses) => {
        const monthlyData: { [key: string]: number } = {};

        expenses.forEach((expense) => {
          const date = new Date(expense.date);
                    const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
          monthlyData[monthYear] = (monthlyData[monthYear] || 0) + expense.amount;
        });

        const series = Object.keys(monthlyData)
          .sort((a, b) => {
            const dateA = new Date(a.replace(/(\w+) (\d+)/, '$1 1, $2'));
            const dateB = new Date(b.replace(/(\w+) (\d+)/, '$1 1, $2'));
            return dateA.getTime() - dateB.getTime();
          })
          .map((monthYear) => ({
            name: monthYear,
            value: monthlyData[monthYear],
          }));

        return [
          {
            name: 'Monthly Spending', 
            series: series,
          },
        ];
      })
    );
  }
  // #endregion
}
