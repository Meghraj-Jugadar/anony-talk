import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly SESSION_KEY = 'anony_talk_session';

  getSessionId(): string {
    let id = localStorage.getItem(this.SESSION_KEY);
    if (!id) {
      id = uuidv4();
      localStorage.setItem(this.SESSION_KEY, id);
    }
    return id;
  }
}
