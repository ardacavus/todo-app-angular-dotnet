import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoListComponent } from './components/todo-list/todo-list.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { LoginComponent } from './components/login/login.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { NotificationComponent } from './components/notification/notification.component';
import { AuthService, User } from './services/auth.service';
import { NotificationService } from './services/notification.service';

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
  currentView = 'login';
  isLoggedIn = false;
  currentUser: User | null = null;
  showUserDropdown = false;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    console.log('APP COMPONENT ÇALIŞTI');
    
    // URL'den reset-password parametrelerini kontrol et
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('token') && urlParams.has('email')) {
      this.showResetPassword();
      return; // AuthService check'ini atla
    }
    
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
      if (this.isLoggedIn) {
        this.currentView = 'todo';
      } else {
        this.currentView = 'login';
      }
    });
  }

  showLogin() {
    this.currentView = 'login';
    // URL'yi temizle
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
    // Custom confirmation modal instead of browser confirm
    this.notificationService.confirmLogout(
      () => this.executeLogout(),
      () => this.closeDropdown() // Optional: close dropdown on cancel
    );
  }

  private executeLogout() {
    this.authService.logout();
    this.showUserDropdown = false;
    
    // Success notification
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
    if (this.currentUser?.firstName) {
      return this.currentUser.firstName.charAt(0).toUpperCase();
    }
    return 'U';
  }
}