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

  onSubmit() {
    // Validation checks
    if (!this.user.firstName.trim()) {
      this.notificationService.warning(
        'Eksik Bilgi',
        'Lütfen adınızı girin.'
      );
      return;
    }

    if (!this.user.lastName.trim()) {
      this.notificationService.warning(
        'Eksik Bilgi',
        'Lütfen soyadınızı girin.'
      );
      return;
    }

    if (!this.user.email.trim()) {
      this.notificationService.warning(
        'Eksik Bilgi',
        'Lütfen email adresinizi girin.'
      );
      return;
    }

    if (!this.isValidEmail(this.user.email)) {
      this.notificationService.warning(
        'Geçersiz Email',
        'Lütfen geçerli bir email adresi girin.'
      );
      return;
    }

    if (!this.user.password.trim()) {
      this.notificationService.warning(
        'Eksik Bilgi',
        'Lütfen bir şifre girin.'
      );
      return;
    }

    if (this.user.password.length < 6) {
      this.notificationService.warning(
        'Zayıf Şifre',
        'Şifre en az 6 karakter olmalıdır.'
      );
      return;
    }

    if (this.user.password !== this.user.confirmPassword) {
      this.notificationService.warning(
        'Şifre Uyumsuzluğu',
        'Girdiğiniz şifreler eşleşmiyor. Lütfen kontrol edin.'
      );
      return;
    }
    
    if (this.isLoading) return;
    
    this.isLoading = true;
    
    const registerData: RegisterRequest = {
      firstName: this.user.firstName.trim(),
      lastName: this.user.lastName.trim(),
      email: this.user.email.trim().toLowerCase(),
      password: this.user.password
    };
    
    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        // Success notification
        this.notificationService.success(
          'Kayıt Başarılı!',
          `Hoş geldiniz ${this.user.firstName}! Şimdi giriş yapabilirsiniz.`,
          3000 // 3 saniye göster
        );
        
        // Reset form
        this.resetForm();
        
        // Switch to login after a short delay
        setTimeout(() => {
          this.switchToLogin.emit();
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        
        // Determine error type and show appropriate notification
        let errorTitle = 'Kayıt Hatası';
        let errorMessage = 'Kayıt işlemi sırasında bir hata oluştu.';
        let errorDetails = '';
        
        if (error.status === 400) {
          // Bad request - likely validation error or duplicate email
          if (error.error?.message?.includes('email')) {
            errorTitle = 'Email Zaten Kullanımda';
            errorMessage = 'Bu email adresi ile daha önce kayıt olunmuş. Giriş yapmayı deneyin.';
          } else {
            errorMessage = error.error?.message || 'Girdiğiniz bilgilerde bir sorun var.';
          }
        } else if (error.status === 409) {
          // Conflict - duplicate user
          errorTitle = 'Kullanıcı Zaten Mevcut';
          errorMessage = 'Bu email adresi zaten kullanımda.';
        } else if (error.status === 0) {
          // Network error
          errorTitle = 'Bağlantı Hatası';
          errorMessage = 'Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.';
        } else {
          // Other errors
          errorDetails = error.error?.message || error.message;
        }
        
        this.notificationService.error(
          errorTitle,
          errorMessage,
          errorDetails
        );
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onLoginClick() {
    this.switchToLogin.emit();
  }

  private resetForm() {
    this.user = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}