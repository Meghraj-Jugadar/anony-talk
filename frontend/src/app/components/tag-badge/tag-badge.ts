import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tag-badge',
  templateUrl: './tag-badge.html',
})
export class TagBadge {
  @Input() tag = '';
}
