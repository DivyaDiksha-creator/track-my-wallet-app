import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../api-endpoints';
import { Category } from '../models/category-request';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private http: HttpClient) { }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(ApiEndpoints.Categories.Base);
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(ApiEndpoints.Categories.ById(id));
  }

  createCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(ApiEndpoints.Categories.Base, category);
  }

  updateCategory(id: number, category: Category): Observable<Category> {
    return this.http.put<Category>(ApiEndpoints.Categories.ById(id), category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(ApiEndpoints.Categories.ById(id));
  }
}