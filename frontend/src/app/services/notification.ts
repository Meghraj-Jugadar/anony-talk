import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SessionService } from './session';
import { SocketService } from './socket';
import { ToastService } from './toast';

export interface Notification {
  id: string;
  type: string;
  message: string;
  post_id: string;
  is_read: boolean;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private api = `${environment.apiUrl}/notifications`;
  unreadCount$ = new BehaviorSubject<number>(0);

  constructor(
    private http: HttpClient,
    private session: SessionService,
    private socket: SocketService,
    private toast: ToastService,
  ) {
    this.socket.subscribeNotifications(this.session.getSessionId());
    this.socket.onNotification((notif) => {
      this.unreadCount$.next(this.unreadCount$.value + 1);
      this.toast.info(notif.message);
    });
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.api}?session_id=${this.session.getSessionId()}`);
  }

  markAllRead(): Observable<any> {
    return this.http.post(`${this.api}/read`, { session_id: this.session.getSessionId() });
  }

  setUnreadCount(count: number) {
    this.unreadCount$.next(count);
  }
}
