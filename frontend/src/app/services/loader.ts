import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private count = 0;
  loading$ = new BehaviorSubject<boolean>(false);

  show() {
    this.count++;
    this.loading$.next(true);
  }

  hide() {
    this.count = Math.max(0, this.count - 1);
    if (this.count === 0) this.loading$.next(false);
  }
}
