import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface NotificationData {
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  title: string;
  message: string;
  details?: string;
  icon?: string;
  confirmText?: string;
  cancelText?: string;
  duration?: number; // Auto close after X seconds (0 = manual close)
  onConfirm?: () => void;
  onCancel?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<NotificationData | null>(null);
  public notification$ = this.notificationSubject.asObservable();

  // Success notifications
  success(title: string, message: string, duration: number = 3000) {
    this.show({
      type: 'success',
      title,
      message,
      icon: '✅',
      duration
    });
  }

  // Error notifications
  error(title: string, message: string, details?: string) {
    this.show({
      type: 'error',
      title,
      message,
      details,
      icon: '❌',
      duration: 0 // Manual close for errors
    });
  }

  // Warning notifications
  warning(title: string, message: string, duration: number = 4000) {
    this.show({
      type: 'warning',
      title,
      message,
      icon: '⚠️',
      duration
    });
  }

  // Info notifications
  info(title: string, message: string, duration: number = 3000) {
    this.show({
      type: 'info',
      title,
      message,
      icon: 'ℹ️',
      duration
    });
  }

  // Confirmation dialogs
  confirm(
    title: string, 
    message: string, 
    onConfirm: () => void, 
    onCancel?: () => void,
    details?: string,
    confirmText: string = '✅ Tamam',
    cancelText: string = '❌ İptal'
  ) {
    this.show({
      type: 'confirm',
      title,
      message,
      details,
      icon: '❓',
      confirmText,
      cancelText,
      onConfirm,
      onCancel,
      duration: 0
    });
  }

  // Delete confirmation (special case)
  confirmDelete(itemName: string, onConfirm: () => void, onCancel?: () => void) {
    this.confirm(
      'Öğeyi Sil',
      'Bu öğeyi silmek istediğinizden emin misiniz?',
      onConfirm,
      onCancel,
      itemName,
      '🗑️ Sil',
      '❌ İptal'
    );
  }

  // Logout confirmation
  confirmLogout(onConfirm: () => void, onCancel?: () => void) {
    this.confirm(
      'Çıkış Yap',
      'Oturumu kapatmak istediğinizden emin misiniz?',
      onConfirm,
      onCancel,
      undefined,
      '🚪 Çıkış Yap',
      '❌ İptal'
    );
  }

  // Show generic notification
  private show(data: NotificationData) {
    this.notificationSubject.next(data);

    // Auto close if duration is set
    if (data.duration && data.duration > 0) {
      setTimeout(() => {
        this.close();
      }, data.duration);
    }
  }

  // Close notification
  close() {
    this.notificationSubject.next(null);
  }

  // Handle confirm action
  handleConfirm() {
    const current = this.notificationSubject.value;
    if (current?.onConfirm) {
      current.onConfirm();
    }
    this.close();
  }

  // Handle cancel action
  handleCancel() {
    const current = this.notificationSubject.value;
    if (current?.onCancel) {
      current.onCancel();
    }
    this.close();
  }
}