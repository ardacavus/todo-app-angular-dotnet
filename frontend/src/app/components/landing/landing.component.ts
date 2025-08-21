import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  @Output() showLogin = new EventEmitter<void>();
  @Output() showRegister = new EventEmitter<void>();

  onLoginClick(): void {
    this.showLogin.emit();
  }

  onRegisterClick(): void {
    this.showRegister.emit();
  }
}