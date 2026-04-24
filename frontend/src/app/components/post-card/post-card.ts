import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, DatePipe } from '@angular/common';
import { Post } from '../../services/post';
import { TagBadge } from '../tag-badge/tag-badge';
import { VoteButtons } from '../vote-buttons/vote-buttons';

const SENTIMENT_MAP: Record<string, string> = {
  happy: '😊', sad: '😢', angry: '😠', neutral: '😐',
};

@Component({
  selector: 'app-post-card',
  imports: [RouterLink, NgFor, DatePipe, TagBadge, VoteButtons],
  templateUrl: './post-card.html',
})
export class PostCard {
  @Input() post!: Post;
  @Input() voted: 'up' | 'down' | null = null;
  @Output() vote = new EventEmitter<{ type: 'up' | 'down'; revert: boolean }>();
  @Output() report = new EventEmitter<void>();

  get sentimentEmoji() {
    return SENTIMENT_MAP[this.post?.sentiment] ?? '😐';
  }

  onVote(event: { type: 'up' | 'down'; revert: boolean }) { this.vote.emit(event); }
  onReport(e: Event) { e.preventDefault(); e.stopPropagation(); this.report.emit(); }
}
