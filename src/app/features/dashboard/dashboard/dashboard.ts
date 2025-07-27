// src/app/features/dashboard/dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../app/core/auth/auth.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { QuoteDisplayComponent } from '../../../features/expenses/quote-display/quote-display-component';
import {
  DashboardSummary,
  MonthlySpendingLimit,
  SetMonthlySpendingLimitRequest,
} from '../../../shared/models/dashboard-spendlimit';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, QuoteDisplayComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class DashboardComponent implements OnInit {
  // #region Properties
  userName = '';
  welcomeMessage = '';

  dashboardSummary: DashboardSummary | null = null;
  isLoadingSummary = false;
  summaryError: string | null = null;

  // Spending Limit Properties
  currentMonthlyLimit: MonthlySpendingLimit | null = null;
  newLimitAmount: number | null = null;
  showSetLimitModal = false;
  isSettingLimit = false;
  setLimitError: string | null = null;
  setLimitSuccess: string | null = null;
  showBudgetDetails: boolean = true;
  budgetUsagePercentage: number = 0;
  
  // Properties for messages based on budget usage
  showNoLimitMessage: boolean = false;
  showOverBudgetMessage: boolean = false;

  // #endregion

  // #region Constructor
  constructor(
    private authService: AuthService,
    private router: Router,
    private dashboardService: DashboardService,
  ) {}
  // #endregion

  // #region Lifecycle Hooks
  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.userName = currentUser.username;
      this.welcomeMessage = `Hello, ${this.userName}!`;
    } else {
      this.router.navigate(['/login']);
    }

    this.getDashboardSummary();
    this.getMonthlySpendingLimit();
  }
  // #endregion

  // #region Core Data Fetching
  /**
   * Fetches the comprehensive dashboard summary.
   */
  getDashboardSummary(): void {
    this.isLoadingSummary = true;
    this.summaryError = null;

    this.dashboardService.getDashboardSummary().subscribe({
      next: (data) => {
        this.dashboardSummary = data;
        this.isLoadingSummary = false;
        this.calculateBudgetUsage(); // Calculate after summary loads
        console.log('Dashboard Summary:', data);
      },
      error: (err: any) => {
        console.error('Failed to load dashboard summary:', err);
        this.summaryError = 'Failed to load dashboard summary. Please try again later.';
        this.isLoadingSummary = false;
      },
    });
  }

  /**
   * Fetches the monthly spending limit for the current month.
   */
  getMonthlySpendingLimit(): void {
    this.dashboardService.getMonthlySpendingLimit().subscribe({
      next: (data) => {
        this.currentMonthlyLimit = data;
        this.newLimitAmount = data.limitAmount; // Pre-fill modal input if limit exists
        this.calculateBudgetUsage(); // Calculate after limit loads
        console.log('Monthly Spending Limit:', data);
      },
      error: (err: any) => {
        console.warn('No monthly spending limit set or failed to fetch:', err);
        this.currentMonthlyLimit = null; // Ensure it's null if not found
        this.newLimitAmount = null; // Clear input if no limit
        this.calculateBudgetUsage(); // Recalculate if limit is null
      },
    });
  }
  // #endregion

  // #region Tap and Reveal Logic
  toggleBudgetDetails(): void {
    this.showBudgetDetails = !this.showBudgetDetails;
  }
  // #endregion

  // #region Budget Usage Calculation
  calculateBudgetUsage(): void {
    const totalExpenses = this.dashboardSummary?.totalExpense || 0;
    const monthlyLimit = this.currentMonthlyLimit?.limitAmount || 0;

    if (monthlyLimit > 0) {
      this.budgetUsagePercentage = (totalExpenses / monthlyLimit) * 100;
      this.showNoLimitMessage = false;
      this.showOverBudgetMessage = this.budgetUsagePercentage > 100;
    } else {
      this.budgetUsagePercentage = 0;
      this.showNoLimitMessage = true; // Show message if no limit is set
      this.showOverBudgetMessage = false;
    }
    // The progress bar will now update automatically via Angular's data binding
    // No direct DOM manipulation needed here.
  }
  // #endregion

  // #region Spending Limit Management
  openSetLimitModal(): void {
    this.setLimitError = null;
    this.setLimitSuccess = null;
    this.showSetLimitModal = true;
    if (this.currentMonthlyLimit) {
      this.newLimitAmount = this.currentMonthlyLimit.limitAmount;
    } else {
      this.newLimitAmount = null;
    }
  }

  /**
   * Closes the modal for setting/updating the monthly spending limit.
   */
  closeSetLimitModal(): void {
    this.showSetLimitModal = false;
    this.setLimitError = null;
    this.setLimitSuccess = null;
    this.newLimitAmount = null;
  }

  /**
   * Saves or updates the monthly spending limit.
   */
  saveSpendingLimit(): void {
    if (this.newLimitAmount === null || this.newLimitAmount < 0) {
      this.setLimitError = 'Please enter a valid non-negative limit amount.';
      return;
    }

    this.isSettingLimit = true;
    this.setLimitError = null;
    this.setLimitSuccess = null;

    const request: SetMonthlySpendingLimitRequest = {
      limitAmount: this.newLimitAmount,
    };

    this.dashboardService.setMonthlySpendingLimit(request).subscribe({
      next: (res) => {
        this.isSettingLimit = false;
        this.setLimitSuccess = res.message || 'Spending limit updated successfully!';
        this.closeSetLimitModal();
        this.getDashboardSummary();
        this.getMonthlySpendingLimit();
      },
      error: (err: any) => {
        console.error('Failed to set spending limit:', err);
        this.isSettingLimit = false;
        this.setLimitError =
          err.error?.message ||
          'Failed to set spending limit. Please check the amount and try again.';
      },
    });
  }
  // #endregion

  // #region Navigation
  goToExpenses(): void {
    this.router.navigate(['/expenses']);
  }

  goToCategories(): void {
    this.router.navigate(['/categories']);
  }
  // #endregion
}
