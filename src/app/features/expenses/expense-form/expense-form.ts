// src/app/features/expenses/expense-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Expense } from '../../../shared/models/expense-response';
import { Category } from '../../../shared/models/category-request';
import { ExpenseService } from '../../../shared/services/expenses.service';
import { CategoryService } from '../../../shared/services/category.service';
import { EMPTY } from 'rxjs'; 
import { map } from 'rxjs/operators';
import { switchMap, catchError } from 'rxjs/operators';
import { ParamMap } from '@angular/router';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './expense-form.html',
  styleUrls: ['./expense-form.scss']
})
export class ExpenseFormComponent implements OnInit {

  expenseForm!: FormGroup;
  isEditMode = false;
  expenseId: number | null = null;
  pageTitle = 'Add New Expense';

  categories: Category[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  categoryLoadError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private expenseService: ExpenseService,
    private categoryService: CategoryService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadInitialData();
  }

  private initForm(): void {
    this.expenseForm = this.fb.group({
      description: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      date: ['', Validators.required],
      categoryId: [null, Validators.required]
    });
  }

  private loadInitialData(): void {
    this.categoryLoadError = null;

    this.categoryService.getCategories().pipe(
      catchError(err => {
        this.categoryLoadError = 'Failed to load categories. Please refresh.';
        console.error('Error loading categories:', err);
        return EMPTY;
      }),
      switchMap((categories: Category[]) => {
        this.categories = categories;
        return this.route.paramMap.pipe(
          switchMap((params: ParamMap) => {
            const id = params.get('id');
            if (id) {
              this.isEditMode = true;
              this.expenseId = +id;
              this.pageTitle = 'Edit Expense';
              return this.expenseService.getExpenseById(this.expenseId).pipe(
                catchError(err => {
                  this.errorMessage = `Failed to load expense with ID ${id}.`;
                  console.error('Error loading expense for edit:', err);
                  this.router.navigate(['/expenses']);
                  return EMPTY;
                })
              );
            } else {
              return EMPTY;
            }
          })
        );
      })
    ).subscribe({
      next: (value: any) => { // Change 'expense: Expense' to 'value: any' or 'value: Expense | void'
        // Only attempt to patch if 'value' is a valid Expense object (i.e., not from EMPTY)
        if (value && 'id' in value && 'description' in value) { // Basic check to ensure it's an Expense
          const expense = value as Expense; // Cast to Expense
          const formattedDate = expense.date ? new Date(expense.date).toISOString().split('T')[0] : '';
          this.expenseForm.patchValue({
            description: expense.description,
            amount: expense.amount,
            date: formattedDate,
            categoryId: expense.categoryId
          });
        }
      },
      error: (err) => {
        console.error('An unexpected error occurred during data loading:', err);
      },
      complete: () => {
        // No longer managing isLoading visibility based on this complete
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = null;

    if (this.expenseForm.valid) {
      const formValue = this.expenseForm.value;
      const formattedDateForBackend = new Date(formValue.date).toISOString();

      const expensePayload = {
        description: formValue.description,
        amount: formValue.amount,
        date: formattedDateForBackend,
        categoryId: formValue.categoryId
      };

      if (this.isEditMode && this.expenseId) {
        this.expenseService.updateExpense(this.expenseId, expensePayload).subscribe({
          next: () => {
            this.router.navigate(['/expenses']);
          },
          error: (err) => {
            this.errorMessage = 'Failed to update expense. Please try again.';
          }
        });
      } else {
        this.expenseService.createExpense(expensePayload).subscribe({
          next: () => {
            this.router.navigate(['/expenses']);
          },
          error: (err) => {
            this.errorMessage = 'Failed to add expense. Please try again.';
          }
        });
      }
    } else {
      this.errorMessage = 'Please fill all required fields correctly.';
      this.expenseForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/expenses']);
  }
}