import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  @Output() backToLogin = new EventEmitter<void>();

  email = '';
  isLoading = false;
  message = '';
  isSuccess = false;

  constructor(private authService: AuthService) {}

  onSubmit() {
    if (this.isLoading || !this.email.trim()) return;

    this.isLoading = true;
    this.message = '';

    this.authService.forgotPassword(this.email).subscribe({
      next: (response) => {
        this.handleResponse(response.message, true);
      },
      error: (error) => {
        this.handleResponse(error.error?.message || 'Bir hata oluştu!', false);
      }
    });
  }

  onBackToLogin() {
    this.backToLogin.emit();
  }

  private handleResponse(message: string, isSuccess: boolean) {
    this.message = message;
    this.isSuccess = isSuccess;
    this.isLoading = false;
  }
}
