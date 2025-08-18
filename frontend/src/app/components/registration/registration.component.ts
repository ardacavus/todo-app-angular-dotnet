import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, RegisterRequest } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent {
  @Output() switchToLogin = new EventEmitter<void>();

  user: RegisterRequest & { confirmPassword: string } = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  onSubmit(): void {
    if (!this.validateInputs() || this.isLoading) return;

    this.isLoading = true;

    const registerData: RegisterRequest = {
      firstName: this.user.firstName.trim(),
      lastName: this.user.lastName.trim(),
      email: this.user.email.trim().toLowerCase(),
      password: this.user.password
    };

    this.authService.register(registerData).subscribe({
      next: () => {
        this.isLoading = false;
        this.notificationService.success(
          '🎉 Kayıt Başarılı!',
          `Hoş geldiniz ${this.user.firstName}! Şimdi giriş yapabilirsiniz.`,
          3000
        );
        this.resetForm();
        setTimeout(() => this.switchToLogin.emit(), 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.handleError(error);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onLoginClick(): void {
    this.switchToLogin.emit();
  }

  private resetForm(): void {
    this.user = { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' };
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private validateInputs(): boolean {
    if (!this.user.firstName.trim()) {
      this.notificationService.warning('❌ Eksik Bilgi', 'Lütfen adınızı girin.');
      return false;
    }
    if (!this.user.lastName.trim()) {
      this.notificationService.warning('❌ Eksik Bilgi', 'Lütfen soyadınızı girin.');
      return false;
    }
    if (!this.user.email.trim()) {
      this.notificationService.warning('❌ Eksik Bilgi', 'Lütfen email adresinizi girin.');
      return false;
    }
    if (!this.isValidEmail(this.user.email)) {
      this.notificationService.warning('❌ Geçersiz Email', 'Lütfen geçerli bir email adresi girin.');
      return false;
    }
    if (!this.user.password.trim()) {
      this.notificationService.warning('❌ Eksik Bilgi', 'Lütfen bir şifre girin.');
      return false;
    }
    if (this.user.password.length < 8) {
      this.notificationService.warning('❌ Zayıf Şifre', 'Şifre en az 8 karakter olmalıdır.');
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(this.user.password)) {
      this.notificationService.warning('❌ Zayıf Şifre', 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.');
      return false;
    }
    if (this.user.password !== this.user.confirmPassword) {
      this.notificationService.warning('❌ Şifre Uyumsuzluğu', 'Girdiğiniz şifreler eşleşmiyor. Lütfen kontrol edin.');
      return false;
    }
    return true;
  }

  private handleError(error: any): void {
    let errorTitle = 'Kayıt Hatası';
    let errorMessage = 'Kayıt işlemi sırasında bir hata oluştu.';
    let errorDetails = '';

    if (error.status === 400) {
      if (error.error?.message?.includes('zaten kullanımda') || 
          error.error?.message?.includes('kayıt olunmuş') ||
          error.error?.message?.includes('kullanımda')) {
        errorTitle = '📧 Email Zaten Kayıtlı';
        errorMessage = 'Bu email adresi ile daha önce hesap oluşturulmuş. Giriş yapmayı deneyin.';
      } else {
        errorMessage = error.error?.message || 'Girdiğiniz bilgilerde bir sorun var.';
      }
    } else if (error.status === 409) {
      errorTitle = '📧 Email Zaten Kayıtlı';
      errorMessage = 'Bu email adresi zaten kullanımda. Farklı bir email deneyin.';
    } else if (error.status === 0) {
      errorTitle = '🌐 Bağlantı Hatası';
      errorMessage = 'Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.';
    } else {
      errorDetails = error.error?.message || error.message;
    }

    this.notificationService.error(errorTitle, errorMessage, errorDetails);
  }
}