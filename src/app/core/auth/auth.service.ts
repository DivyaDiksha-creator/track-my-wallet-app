import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { LoginRequest } from '../../shared/models/login-request';
import { LoginResponse } from '../../shared/models/login-response';
import { RegisterRequest } from '../../shared/models/register-request';
import { User } from '../../shared/models/user';
import { ApiEndpoints } from '../../shared/api-endpoints';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
   private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null && !!localStorage.getItem('jwt_token');
  }

  public getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  login(request: LoginRequest): Observable<LoginResponse> {
  return this.http.post<LoginResponse>(ApiEndpoints.Auth.Login, request).pipe( 
    tap(response => {
      localStorage.setItem('jwt_token', response.token);
      localStorage.setItem('currentUser', JSON.stringify({ userId: response.userId, email: response.email }));
      this.currentUserSubject.next({username:response.username, userId: response.userId, email: response.email });
    })
  );
}
 register(request: RegisterRequest): Observable<User> { 
        return this.http.post<User>(ApiEndpoints.Auth.Register, request);
    }

  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}