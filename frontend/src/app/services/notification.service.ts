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
  duration?: number;
  onConfirm?: () => void;
  onCancel?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<NotificationData | null>(null);
  public notification$ = this.notificationSubject.asObservable();

  success(title: string, message: string, duration: number = 3000) {
    this.show({ type: 'success', title, message, icon: '✅', duration });
  }

  error(title: string, message: string, details?: string) {
    this.show({ type: 'error', title, message, details, icon: '❌', duration: 0 });
  }

  warning(title: string, message: string, duration: number = 4000) {
    this.show({ type: 'warning', title, message, icon: '⚠️', duration });
  }

  info(title: string, message: string, duration: number = 3000) {
    this.show({ type: 'info', title, message, icon: 'ℹ️', duration });
  }

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

  confirmDelete(itemName: string, onConfirm: () => void, onCancel?: () => void) {
    this.confirm('Öğeyi Sil', 'Bu öğeyi silmek istediğinizden emin misiniz?', onConfirm, onCancel, itemName, '🗑️ Sil', '❌ İptal');
  }

  confirmLogout(onConfirm: () => void, onCancel?: () => void) {
    this.confirm('Çıkış Yap', 'Oturumu kapatmak istediğinizden emin misiniz?', onConfirm, onCancel, undefined, '🚪 Çıkış Yap', '❌ İptal');
  }

  private show(data: NotificationData) {
    this.notificationSubject.next(data);
    if (data.duration && data.duration > 0) {
      setTimeout(() => this.close(), data.duration);
    }
  }

  close() {
    this.notificationSubject.next(null);
  }

  handleConfirm() {
    const current = this.notificationSubject.value;
    current?.onConfirm?.();
    this.close();
  }

  handleCancel() {
    const current = this.notificationSubject.value;
    current?.onCancel?.();
    this.close();
  }
}
