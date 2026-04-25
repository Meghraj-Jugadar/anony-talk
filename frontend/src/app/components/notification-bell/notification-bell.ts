import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationService, Notification } from '../../services/notification';

@Component({
  selector: 'app-notification-bell',
  imports: [NgFor, NgIf, DatePipe, RouterLink],
  templateUrl: './notification-bell.html',
})
export class NotificationBell implements OnInit {
  notifications: Notification[] = [];
  unreadCount = 0;
  open = false;

  constructor(
    private notifService: NotificationService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.notifService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
      this.cdr.detectChanges();
    });
    this.loadNotifications();
  }

  loadNotifications() {
    this.notifService.getNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
        this.unreadCount = data.filter(n => !n.is_read).length;
        this.notifService.setUnreadCount(this.unreadCount);
        this.cdr.detectChanges();
      },
    });
  }

  toggle() {
    this.open = !this.open;
    if (this.open && this.unreadCount > 0) {
      this.notifService.markAllRead().subscribe(() => {
        this.notifications = this.notifications.map(n => ({ ...n, is_read: true }));
        this.notifService.setUnreadCount(0);
        this.cdr.detectChanges();
      });
    }
  }
}
