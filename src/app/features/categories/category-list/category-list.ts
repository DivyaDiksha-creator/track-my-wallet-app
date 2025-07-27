import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoryService } from '../../../shared/services/category.service';
import { Category } from '../../../shared/models/category-request'; 

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category-list.html',
  styleUrls: ['./category-list.scss']
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(private categoryService: CategoryService) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load categories. Please try again.';
        this.isLoading = false;
        console.error('Error loading categories:', err);
      }
    });
  }

  onDeleteCategory(id: number): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.loadCategories(); 
          alert('Category deleted successfully!');
        },
        error: (err) => {
          this.errorMessage = 'Failed to delete category. It might be in use.';
          console.error('Error deleting category:', err);
        }
      });
    }
  }
}