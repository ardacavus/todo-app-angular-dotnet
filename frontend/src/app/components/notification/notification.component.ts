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
  private notificationService = inject(NotificationService);
  
  notification: NotificationData | null = null;
  private subscription?: Subscription;

  ngOnInit(): void {
    this.subscription = this.notificationService.notification$.subscribe(
      notification => this.notification = notification
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  isConfirmType(): boolean {
    return this.notification?.type === 'confirm';
  }

  handleConfirm(): void {
    this.notificationService.handleConfirm();
  }

  handleCancel(): void {
    this.notificationService.handleCancel();
  }

  close(): void {
    this.notificationService.close();
  }

  handleBackdropClick(): void {
    if (this.notification && !['confirm', 'error'].includes(this.notification.type)) {
      this.close();
    }
  }
}
