import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NgFor, NgClass, AsyncPipe } from '@angular/common';
import { ToastService, Toast } from '../../services/toast';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-toast',
  imports: [NgFor, NgClass, AsyncPipe],
  templateUrl: './toast.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  toasts$: Observable<Toast[]>;

  constructor(private toastService: ToastService) {
    this.toasts$ = this.toastService.toasts$;
  }

  dismiss(id: number) { this.toastService.dismiss(id); }
  trackById(_: number, t: Toast) { return t.id; }
}
