import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionService, Identity } from '../../services/session';

@Component({
  selector: 'app-identity-modal',
  imports: [NgIf, FormsModule],
  templateUrl: './identity-modal.html',
})
export class IdentityModal implements OnInit {
  identity: Identity | null = null;
  showModal = false;
  showRecovery = false;
  recoveryInput = '';
  recoveryError = '';
  recovering = false;
  copied = false;

  constructor(private session: SessionService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.identity = {
      session_id: this.session.getSessionId(),
      recovery_code: this.session.getRecoveryCode(),
      isNew: false,
    };
    this.session.identity$.subscribe(identity => {
      if (identity) {
        this.identity = identity;
        if (identity.isNew) this.showModal = true;
        this.cdr.detectChanges();
      }
    });
  }

  copyCode() {
    navigator.clipboard.writeText(this.identity?.recovery_code || '');
    this.copied = true;
    setTimeout(() => { this.copied = false; this.cdr.detectChanges(); }, 2000);
  }

  openRecovery() {
    this.showModal = true;
    this.showRecovery = true;
  }

  recover() {
    if (!this.recoveryInput.trim()) return;
    this.recovering = true;
    this.recoveryError = '';
    this.session.recover(this.recoveryInput).subscribe({
      next: (identity) => {
        this.identity = identity;
        this.showModal = false;
        this.showRecovery = false;
        this.recovering = false;
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.recoveryError = e.error?.error || 'Invalid recovery code';
        this.recovering = false;
        this.cdr.detectChanges();
      },
    });
  }

  close() {
    this.showModal = false;
    this.showRecovery = false;
  }
}
