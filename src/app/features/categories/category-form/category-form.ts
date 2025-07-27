import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../../../shared/services/category.service';
import { Category } from '../../../shared/models/category-request'; 
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-form.html',
  styleUrls: ['./category-form.scss']
})
export class CategoryFormComponent implements OnInit {
  categoryForm!: FormGroup;
  categoryId: number | null = null;
  isEditing = false;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required]
    });
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.categoryId = +id;
        this.isEditing = true;
        this.loadCategory(this.categoryId);
      }
    });
  }

  loadCategory(id: number): void {
    this.isLoading = true;
    this.categoryService.getCategoryById(id).subscribe({
      next: (category) => {
        this.categoryForm.patchValue({
          name: category.name
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load category for editing.';
        this.isLoading = false;
        console.error('Error loading category:', err);
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = null;
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched(); 
      return;
    }

    this.isLoading = true;
    const categoryData: Partial<Category> = {
      name: this.categoryForm.value.name
    };

    let operation: Observable<Category | void>;

    if (this.isEditing && this.categoryId !== null) {
            operation = this.categoryService.updateCategory(this.categoryId, { id: this.categoryId, ...categoryData } as Category);
    } else {
      operation = this.categoryService.createCategory(categoryData);
    }

    operation.subscribe({
      next: () => {
        this.isLoading = false;
        alert(`Category ${this.isEditing ? 'updated' : 'created'} successfully!`);
        this.router.navigate(['/categories']);
      },
      error: (err) => {
        this.errorMessage = `Failed to ${this.isEditing ? 'update' : 'create'} category.`;
        this.isLoading = false;
        console.error('Category form error:', err);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/categories']);
  }
}