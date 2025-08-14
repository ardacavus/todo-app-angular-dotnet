import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoListComponent } from '../todo-list/todo-list.component';
import { RegistrationComponent } from '../registration/registration.component';
import { LoginComponent } from '../login/login.component';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';
import { NotificationComponent } from '../notification/notification.component';
import { AuthService, User } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    TodoListComponent,
    RegistrationComponent,
    LoginComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    NotificationComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'ToDo App';
  currentView: 'login' | 'register' | 'forgot-password' | 'reset-password' | 'todo' = 'login';
  isLoggedIn = false;
  currentUser: User | null = null;
  showUserDropdown = false;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('token') && urlParams.has('email')) {
      this.showResetPassword();
      return;
    }

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
      this.currentView = this.isLoggedIn ? 'todo' : 'login';
    });
  }

  showLogin() {
    this.currentView = 'login';
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  showRegister() {
    this.currentView = 'register';
  }

  showForgotPassword() {
    this.currentView = 'forgot-password';
  }

  showResetPassword() {
    this.currentView = 'reset-password';
  }

  showTodo() {
    this.currentView = 'todo';
  }

  logout() {
    this.notificationService.confirmLogout(
      () => this.executeLogout(),
      () => this.closeDropdown()
    );
  }

  private executeLogout() {
    this.authService.logout();
    this.showUserDropdown = false;
    this.notificationService.success(
      'Çıkış Yapıldı',
      'Başarıyla çıkış yaptınız. Tekrar görüşmek üzere!'
    );
  }

  toggleUserDropdown() {
    this.showUserDropdown = !this.showUserDropdown;
  }

  closeDropdown() {
    this.showUserDropdown = false;
  }

  getUserInitial(): string {
    return this.currentUser?.firstName?.charAt(0).toUpperCase() || 'U';
  }
}
