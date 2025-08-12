import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service'; // ✅ AuthService kullan

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  @Output() backToLogin = new EventEmitter<void>(); // ✅ Parent'a geri dönüş

  resetForm: FormGroup;
  token: string = '';
  email: string = '';
  loading = false;
  message = '';
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService // ✅ AuthService inject et
  ) {
    this.resetForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // ✅ URL'den parametreleri al
    const urlParams = new URLSearchParams(window.location.search);
    this.token = urlParams.get('token') || '';
    this.email = urlParams.get('email') || '';
    
    if (!this.token || !this.email) {
      this.error = 'Geçersiz sıfırlama linki';
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    return password?.value === confirmPassword?.value ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.resetForm.invalid || !this.token || !this.email) {
      return;
    }

    this.loading = true;
    const { password } = this.resetForm.value;

    // ✅ AuthService kullan
    this.authService.resetPassword(this.email, this.token, password).subscribe({
      next: (response: any) => {
        this.message = response.message || 'Şifreniz başarıyla güncellendi!';
        setTimeout(() => {
          this.goBackToLogin();
        }, 2000);
      },
      error: (error) => {
        this.error = error.error?.message || 'Şifre sıfırlama başarısız';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  goBackToLogin(): void {
    this.backToLogin.emit(); // ✅ Parent component'e bildirim
  }
}