import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoListComponent } from '../todo-list/todo-list.component';
import { RegistrationComponent } from '../registration/registration.component';
import { LoginComponent } from '../login/login.component';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';
import { NotificationComponent } from '../notification/notification.component';
import { LandingComponent } from '../landing/landing.component';
import { LoadingComponent } from '../loading/loading.component';
import { AuthService, User } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { LoadingService } from '../../services/loading.service';

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
    NotificationComponent,
    LandingComponent,
    LoadingComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'ToDo App';
  currentView: 'landing' | 'login' | 'register' | 'forgot-password' | 'reset-password' | 'todo' = 'landing';
  isLoggedIn = false;
  currentUser: User | null = null;
  showUserDropdown = false;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('token') && urlParams.has('email')) {
      this.showResetPassword();
      return;
    }

    // AuthService'ten user durumunu dinle
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
      
      // User durumuna göre view'ı güncelle
      if (user) {
        // Kullanıcı giriş yapmış, todo sayfasına git
        this.currentView = 'todo';
      } else {
        // Kullanıcı çıkış yapmış veya hiç giriş yapmamış, landing'e git
        if (this.currentView === 'todo') {
          // Sadece todo sayfasındayken landing'e git
          this.currentView = 'landing';
        }
      }
    });
  }

  showLogin() {
    this.loadingService.showForDuration(600).then(() => {
      this.currentView = 'login';
      window.history.replaceState({}, document.title, window.location.pathname);
    });
  }

  showLanding() {
    this.loadingService.showForDuration(500).then(() => {
      this.currentView = 'landing';
    });
  }

  showRegister() {
    this.loadingService.showForDuration(600).then(() => {
      this.currentView = 'register';
    });
  }

  showForgotPassword() {
    this.loadingService.showForDuration(500).then(() => {
      this.currentView = 'forgot-password';
    });
  }

  showResetPassword() {
    this.currentView = 'reset-password';
  }

  showTodo() {
    this.loadingService.showForDuration(700).then(() => {
      this.currentView = 'todo';
    });
  }

  logout() {
    this.notificationService.confirmLogout(
      () => this.executeLogout(),
      () => this.closeDropdown()
    );
  }

  private executeLogout() {
    // Loading ekranı göster
    this.loadingService.showForDuration(800).then(() => {
      // Auth service'ten logout çağır
      this.authService.logout();
      
      // Dropdown'u kapat
      this.showUserDropdown = false;
      
      // Başarı mesajı göster
      this.notificationService.success(
        'Çıkış Yapıldı',
        'Başarıyla çıkış yaptınız. Tekrar görüşmek üzere!'
      );
    });
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