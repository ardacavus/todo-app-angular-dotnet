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
  @Output() backToLanding = new EventEmitter<void>();

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
          this.handleLoginError(error);
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

  onBackToLanding(): void {
    this.backToLanding.emit();
  }

  private handleLoginError(error: any): void {
    if (error.status === 400) {
      const message = error.error?.message || '';
      
      if (message.includes('kayıtlı değil') || 
          message.includes('hesap oluşturun')) {
        this.errorMessage = '📧 Bu email adresi kayıtlı değil! Önce hesap oluşturun.';
      } else if (message.includes('Şifre hatalı') ||
                 message.includes('şifrenizi kontrol')) {
        this.errorMessage = '🔒 Şifre hatalı! Lütfen şifrenizi kontrol edin.';
      } else if (message.includes('Email veya şifre hatalı')) {
        this.errorMessage = '🔒 Email veya şifre hatalı! Lütfen bilgilerinizi kontrol edin.';
      } else {
        this.errorMessage = message || 'Giriş işlemi başarısız!';
      }
    } else if (error.status === 0) {
      this.errorMessage = '🌐 Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.';
    } else if (error.status === 429) {
      this.errorMessage = '⏰ Çok fazla deneme! Lütfen bir dakika bekleyin.';
    } else {
      this.errorMessage = '❌ Giriş işlemi sırasında bir hata oluştu!';
    }
  }
}