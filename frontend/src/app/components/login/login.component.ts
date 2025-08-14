import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService, LoginRequest } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  @Output() switchToRegister = new EventEmitter<void>();
  @Output() switchToForgotPassword = new EventEmitter<void>();
  @Output() loginSuccess = new EventEmitter<void>();

  user: LoginRequest = { email: '', password: '' };
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.user)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => this.loginSuccess.emit(),
        error: (error) => {
          this.errorMessage = error.error?.message || 'Giriş işlemi başarısız!';
        }
      });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onRegisterClick(): void {
    this.switchToRegister.emit();
  }

  onForgotPasswordClick(): void {
    this.switchToForgotPassword.emit();
  }
}
