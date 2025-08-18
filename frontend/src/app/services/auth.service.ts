import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:12187/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkStoredAuth();
  }

  register(request: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, request);
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request).pipe(
      switchMap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('tokenExpiry', response.expiresAt);
        
        return this.getProfile().pipe(
          tap(user => {
            localStorage.setItem('user', JSON.stringify(user));
            this.currentUserSubject.next(user);
          }),
          switchMap(() => of(response)),
          catchError(error => {
            console.error('Profile fetch failed after login:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('tokenExpiry');
            throw error;
          })
        );
      })
    );
  }

  getProfile(): Observable<User> {
    const headers = this.getHeaders();
    return this.http.get<User>(`${this.apiUrl}/profile`, { headers });
  }

  private getHeaders() {
    const token = this.getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(email: string, token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { email, token, newPassword });
  }

  logout(): void {
    // Backend'e logout isteği gönder (isteğe bağlı)
    this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      catchError(() => of(null)) // Hata olursa da logout yap
    ).subscribe();
    
    // Local data'yı temizle
    this.clearAuthData();
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    const expiry = localStorage.getItem('tokenExpiry');
    
    if (!token || !expiry) {
      return false;
    }

    const expiryDate = new Date(expiry);
    const now = new Date();
    
    if (now >= expiryDate) {
      this.clearAuthData();
      return false;
    }

    return !this.isTokenExpired(token);
  }

  refreshUserProfile(): Observable<User> {
    return this.getProfile().pipe(
      tap(user => {
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private checkStoredAuth(): void {
    const token = this.getToken();
    const userStr = localStorage.getItem('user');
    const expiry = localStorage.getItem('tokenExpiry');
    
    if (token && userStr && expiry && !this.isTokenExpired(token)) {
      const expiryDate = new Date(expiry);
      const now = new Date();
      
      if (now < expiryDate) {
        try {
          const user = JSON.parse(userStr);
          this.currentUserSubject.next(user);
          
          this.refreshUserProfile().subscribe({
            error: (error) => {
              console.error('Failed to refresh user profile:', error);
              this.clearAuthData();
            }
          });
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
          this.clearAuthData();
        }
      } else {
        this.clearAuthData();
      }
    } else {
      this.clearAuthData();
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  getTokenExpiryTime(): Date | null {
    const expiry = localStorage.getItem('tokenExpiry');
    return expiry ? new Date(expiry) : null;
  }

  isTokenExpiringSoon(minutesThreshold: number = 5): boolean {
    const expiryTime = this.getTokenExpiryTime();
    if (!expiryTime) return false;
    
    const now = new Date();
    const timeDiff = expiryTime.getTime() - now.getTime();
    const minutesLeft = timeDiff / (1000 * 60);
    
    return minutesLeft <= minutesThreshold;
  }
}