import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NotificationBell } from '../notification-bell/notification-bell';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, NotificationBell],
  templateUrl: './navbar.html',
})
export class Navbar {}
