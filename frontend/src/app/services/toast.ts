import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info' | 'ai' | 'error';
  icon?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  toasts$ = new BehaviorSubject<Toast[]>([]);

  show(message: string, type: Toast['type'] = 'info', icon?: string, duration = 4000) {
    const id = ++this.counter;
    const toast: Toast = { id, message, type, icon };
    this.toasts$.next([...this.toasts$.value, toast]);
    setTimeout(() => this.dismiss(id), duration);
  }

  dismiss(id: number) {
    this.toasts$.next(this.toasts$.value.filter(t => t.id !== id));
  }

  success(message: string) { this.show(message, 'success', '✅'); }
  info(message: string) { this.show(message, 'info', '💬'); }
  ai(message: string) { this.show(message, 'ai', '🤖', 6000); }
  error(message: string) { this.show(message, 'error', '❌'); }
}
