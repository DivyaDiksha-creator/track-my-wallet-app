// src/app/features/expenses/expense-list/expense-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core'; // Add OnDestroy
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { forkJoin, Subscription, interval } from 'rxjs'; // Add Subscription, interval
import { map, startWith, switchMap } from 'rxjs/operators'; // Add startWith, switchMap
import { Expense, ExpenseApiResponse } from '../../../shared/models/expense-response';
import { ExpenseService } from '../../../shared/services/expenses.service';
import { Category } from '../../../shared/models/category-request';
import { CategoryService } from '../../../shared/services/category.service';
import { CurrencyConverterComponent } from '../../../features/currency/currency-converter.component';
import { QuoteService } from '../../../shared/services/quote.service';

interface Quote {
  text: string;
  author: string;
}

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BaseChartDirective,
    CurrencyConverterComponent,
  ],
  templateUrl: './expense-list.html',
  styleUrls: ['./expense-list.scss']
})
export class ExpenseListComponent implements OnInit, OnDestroy { // Implement OnDestroy

  expenses: Expense[] = [];
  isLoading = false;
  error: string | null = null;
  private allCategories: Category[] = [];

  currentDate: Date = new Date();
  displayMonthYear: string = '';

  currentSortColumn: string = 'date';
  currentSortDirection: 'desc' | 'asc' = 'desc';

  // New properties for quotes
  currentQuote: Quote | null = null;
  private quoteSubscription: Subscription | undefined;

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: 2,
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#555',
          font: {
            size: 12
          }
        }
      },
      y: {
        min: 0,
        grid: {
          color: 'rgba(0,0,0,0.05)'
        },
        ticks: {
          color: '#555',
          font: {
            size: 12
          },
          callback: function(value: any) {
            return '$' + value;
          }
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#333',
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        cornerRadius: 4,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            if (label) {
              return `${label}: $${(context.parsed.y as number).toFixed(2)}`;
            }
            return `$${(context.parsed.y as number).toFixed(2)}`;
          }
        }
      }
    }
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Spending by Category',
        backgroundColor: [
          '#4CAF50', '#FFC107', '#2196F3', '#FF5722', '#9C27B0', '#00BCD4'
        ],
        borderColor: [
          '#388E3C', '#FFA000', '#1976D2', '#E64A19', '#7B1FA2', '#0097A7'
        ],
        borderWidth: 1,
        hoverBackgroundColor: [
          '#5cb85c', '#f0ad4e', '#5bc0de', '#f0ad4e', '#5cb85c', '#5bc0de'
        ]
      }
    ]
  };
  public barChartLegend = true;

  constructor(
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    private quoteService: QuoteService
  ) { }

  ngOnInit(): void {
    this.updateDisplayMonthYear();
    this.loadAllData();
    this.setupQuoteRotation(); // NEW: Setup quote rotation
  }

  ngOnDestroy(): void { // NEW: Lifecycle hook to unsubscribe
    if (this.quoteSubscription) {
      this.quoteSubscription.unsubscribe();
    }
  }

  loadAllData(): void {
    this.isLoading = true;
    this.error = null;

    const startDate = this.getStartDateOfMonth(this.currentDate);
    const endDate = this.getEndDateOfMonth(this.currentDate);

    forkJoin({
      expensesResponse: this.expenseService.getAllExpenses(startDate, endDate),
      categories: this.categoryService.getCategories()
    }).subscribe({
      next: (data) => {
        this.expenses = data.expensesResponse.expenses;
        this.allCategories = data.categories;

        this.expenses = this.expenses.map(expense => ({
          ...expense,
          categoryName: this.getCategoryName(expense.categoryId)
        }));

        this.sortExpenses(this.currentSortColumn, true);

        this.isLoading = false;
        this.processExpensesForChart(this.expenses);
      },
      error: (err) => {
        this.error = 'Failed to load data.';
        this.isLoading = false;
        console.error('Error loading expenses or categories:', err);
      }
    });
  }

  // NEW: Quote rotation logic
  setupQuoteRotation(): void {
    // Fetch a quote immediately, then every 10 seconds
    this.quoteSubscription = interval(10000).pipe( // Change interval as desired (e.g., 10000ms = 10 seconds)
      startWith(0), // Emit immediately on subscription
      switchMap(() => this.quoteService.getRandomQuote())
    ).subscribe({
      next: (quote) => {
        this.currentQuote = quote;
      },
      error: (err) => {
        console.error('Error fetching quote:', err);
        this.currentQuote = { text: 'Failed to load quote.', author: 'System' };
      }
    });
  }

  private processExpensesForChart(expenses: Expense[]): void {
    const categorySpending: { [key: string]: number } = {};

    expenses.forEach(expense => {
      const amount = expense.amount != null ? expense.amount : 0;
      const categoryName = expense.categoryName || 'Uncategorized';

      if (categorySpending[categoryName]) {
        categorySpending[categoryName] += amount;
      } else {
        categorySpending[categoryName] = amount;
      }
    });

    const sortedCategories = Object.keys(categorySpending).sort((a, b) => categorySpending[b] - categorySpending[a]);

    this.barChartData.labels = sortedCategories;
    this.barChartData.datasets[0].data = sortedCategories.map(cat => categorySpending[cat]);

    const chart = this.barChartData.datasets[0];
    if (chart) {
      this.barChartData = {
        ...this.barChartData,
        datasets: [...this.barChartData.datasets]
      };
    }
  }

  getCategoryName(categoryId: number | undefined): string {
    if (categoryId === undefined) {
      return 'Uncategorized';
    }
    return this.allCategories.find(cat => cat.id === categoryId)?.name || 'Uncategorized';
  }

  shouldShowNoChartDataMessage(): boolean {
    const dataset = this.barChartData.datasets[0];
    if (!dataset || dataset.data.length === 0) {
      return true;
    }
    return dataset.data.every(val => val === 0 || val === null);
  }

  updateDisplayMonthYear(): void {
    this.displayMonthYear = this.currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  private getStartDateOfMonth(date: Date): string {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    return start.toISOString().split('T')[0];
  }

  private getEndDateOfMonth(date: Date): string {
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return end.toISOString().split('T')[0];
  }

  goToPreviousMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.updateDisplayMonthYear();
    this.loadAllData();
  }

  goToNextMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.updateDisplayMonthYear();
    this.loadAllData();
  }

  goToPreviousYear(): void {
    this.currentDate.setFullYear(this.currentDate.getFullYear() - 1);
    this.updateDisplayMonthYear();
    this.loadAllData();
  }

  goToNextYear(): void {
    this.currentDate.setFullYear(this.currentDate.getFullYear() + 1);
    this.updateDisplayMonthYear();
    this.loadAllData();
  }

  deleteExpense(id: number): void {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenseService.deleteExpense(id).subscribe({
        next: () => {
          console.log('Expense deleted successfully!');
          this.loadAllData();
        },
        error: (err) => {
          console.error('Error deleting expense:', err);
        }
      });
    }
  }

  sortExpenses(column: string, initialLoad: boolean = false): void {
    if (this.currentSortColumn === column && !initialLoad) {
      this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else if (this.currentSortColumn !== column) {
      this.currentSortColumn = column;
      this.currentSortDirection = 'desc';
    }

    this.expenses.sort((a: Expense, b: Expense) => {
      let aValue: any;
      let bValue: any;

      if (column === 'categoryName') {
        aValue = a.categoryName;
        bValue = b.categoryName;
      } else if (column === 'date') {
        aValue = new Date(a.date);
        bValue = new Date(b.date);
      } else {
        aValue = (a as any)[column];
        bValue = (b as any)[column];
      }

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return this.currentSortDirection === 'asc' ? -1 : 1;
      if (bValue == null) return this.currentSortDirection === 'asc' ? 1 : -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return this.currentSortDirection === 'asc' ?
          aValue.localeCompare(bValue) :
          bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return this.currentSortDirection === 'asc' ?
          aValue - bValue :
          bValue - aValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        return this.currentSortDirection === 'asc' ?
          aValue.getTime() - bValue.getTime() :
          bValue.getTime() - aValue.getTime();
      }
      return 0;
    });
  }

  public chartClicked({ event, active }: { event?: ChartEvent, active?: {}[] }): void {
  }

  public chartHovered({ event, active }: { event?: ChartEvent, active?: {}[] }): void {
  }
}