import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, RegisterRequest } from '../../services/auth.service';

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
  errorMessage = '';

  constructor(private authService: AuthService) {}

  onSubmit() {
    if (this.user.password !== this.user.confirmPassword) {
      this.errorMessage = 'Şifreler eşleşmiyor!';
      return;
    }
    
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    
    const registerData: RegisterRequest = {
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      email: this.user.email,
      password: this.user.password
    };
    
    this.authService.register(registerData).subscribe({
      next: (response) => {
        console.log('Kayıt başarılı:', response);
        alert('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
        this.switchToLogin.emit();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Kayıt hatası:', error);
        this.errorMessage = 'Kayıt işlemi başarısız!';
        this.isLoading = false;
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
}