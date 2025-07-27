// src/app/features/dashboard/dashboard.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DashboardSummary,
  MonthlySpendingLimit,
  SetMonthlySpendingLimitRequest,
} from '../../../shared/models/dashboard-spendlimit';
import { ApiEndpoints } from '../../../shared/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  /**
   * Fetches the dashboard summary for the current user.
   * @param startDate Optional start date for the summary period (ISO string).
   * @param endDate Optional end date for the summary period (ISO string).
   * @returns An Observable of DashboardSummary.
   */
  getDashboardSummary(startDate?: string, endDate?: string): Observable<DashboardSummary> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.http.get<DashboardSummary>(ApiEndpoints.Dashboard.Summary, { params });
  }

  /**
   * Fetches the monthly spending limit for the current user for a specific month.
   * @param month Optional month (first day of the month as ISO string) for which to retrieve the limit.
   * If not provided, the backend defaults to the current month.
   * @returns An Observable of MonthlySpendingLimit.
   */
  getMonthlySpendingLimit(month?: string): Observable<MonthlySpendingLimit> {
    let params = new HttpParams();
    if (month) {
      params = params.set('month', month);
    }
    return this.http.get<MonthlySpendingLimit>(ApiEndpoints.Dashboard.SpendingLimit, { params });
  }

  /**
   * Sets or updates the monthly spending limit for the current user for a specific month.
   * @param request The SetMonthlySpendingLimitRequest object containing the limit amount and optional effective month.
   * @returns An Observable indicating the success of the operation.
   */
  setMonthlySpendingLimit(request: SetMonthlySpendingLimitRequest): Observable<any> {
    return this.http.post<any>(ApiEndpoints.Dashboard.SpendingLimit, request);
  }
}