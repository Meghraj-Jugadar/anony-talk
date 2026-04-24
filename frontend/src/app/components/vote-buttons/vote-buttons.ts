import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-vote-buttons',
  imports: [NgClass],
  templateUrl: './vote-buttons.html',
})
export class VoteButtons {
  @Input() upvotes = 0;
  @Input() downvotes = 0;
  @Input() voted: 'up' | 'down' | null = null;
  @Output() vote = new EventEmitter<{ type: 'up' | 'down'; revert: boolean }>();

  onVote(type: 'up' | 'down') {
    const revert = this.voted === type;
    this.vote.emit({ type, revert });
  }
}
