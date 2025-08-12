import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.component.html',  // Doğru path
  styleUrls: ['./forgot-password.component.scss']   // Doğru path
})
export class ForgotPasswordComponent {
  @Output() backToLogin = new EventEmitter<void>();

  email = '';
  isLoading = false;
  message = '';
  isSuccess = false;

  constructor(private authService: AuthService) {}

  onSubmit() {
    if (!this.email.trim() || this.isLoading) return;
    
    this.isLoading = true;
    this.message = '';
    
    this.authService.forgotPassword(this.email).subscribe({
      next: (response) => {
        this.message = response.message;
        this.isSuccess = true;
        this.isLoading = false;
      },
      error: (error) => {
        this.message = error.error?.message || 'Bir hata oluştu!';
        this.isSuccess = false;
        this.isLoading = false;
      }
    });
  }

  onBackToLogin() {
    this.backToLogin.emit();
  }
}