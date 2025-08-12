import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { NotificationService, NotificationData } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-30px) scale(0.95)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-20px) scale(0.95)' }))
      ])
    ])
  ]
})
export class NotificationComponent implements OnInit, OnDestroy {
  // ✅ inject() kullan constructor yerine
  private notificationService = inject(NotificationService);
  
  notification: NotificationData | null = null;
  private subscription?: Subscription;

  ngOnInit() {
    this.subscription = this.notificationService.notification$.subscribe(
      notification => {
        this.notification = notification;
      }
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  isConfirmType(): boolean {
    return this.notification?.type === 'confirm';
  }

  handleConfirm() {
    this.notificationService.handleConfirm();
  }

  handleCancel() {
    this.notificationService.handleCancel();
  }

  close() {
    this.notificationService.close();
  }

  handleBackdropClick() {
    if (this.notification?.type !== 'confirm' && this.notification?.type !== 'error') {
      this.close();
    }
  }
}