import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Identity {
  session_id: string;
  recovery_code: string;
  isNew: boolean;
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly SESSION_KEY = 'anony_session_id';
  private readonly RECOVERY_KEY = 'anony_recovery_code';
  private api = `${environment.apiUrl}/identity`;

  identity$ = new BehaviorSubject<Identity | null>(null);

  constructor(private http: HttpClient) {}

  init() {
    return this.http.get<Identity>(this.api, { withCredentials: true }).pipe(
      tap((identity) => {
        localStorage.setItem(this.SESSION_KEY, identity.session_id);
        localStorage.setItem(this.RECOVERY_KEY, identity.recovery_code);
        this.identity$.next(identity);
      })
    );
  }

  getSessionId(): string {
    return localStorage.getItem(this.SESSION_KEY) || '';
  }

  getRecoveryCode(): string {
    return localStorage.getItem(this.RECOVERY_KEY) || '';
  }

  recover(recovery_code: string) {
    return this.http.post<Identity>(`${this.api}/recover`, { recovery_code }, { withCredentials: true }).pipe(
      tap((identity) => {
        localStorage.setItem(this.SESSION_KEY, identity.session_id);
        localStorage.setItem(this.RECOVERY_KEY, identity.recovery_code);
        this.identity$.next(identity);
      })
    );
  }
}
