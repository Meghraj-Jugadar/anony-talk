import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { Navbar } from './components/navbar/navbar';
import { Loader } from './components/loader/loader';
import { IdentityModal } from './components/identity-modal/identity-modal';
import { ToastComponent } from './components/toast/toast';
import { SessionService } from './services/session';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Loader, IdentityModal, ToastComponent, NgIf],
  templateUrl: './app.html',
})
export class App implements OnInit {
  ready = false;

  constructor(private session: SessionService) {}

  ngOnInit() {
    this.session.init().subscribe({
      next: () => { this.ready = true; },
      error: () => {
        if (!this.session.getSessionId()) {
          const id = crypto.randomUUID();
          localStorage.setItem('anony_session_id', id);
        }
        this.ready = true;
      },
    });
  }
}
