import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService, Post } from '../../services/post';
import { CommentService, Comment } from '../../services/comment';
import { SessionService } from '../../services/session';
import { TagBadge } from '../../components/tag-badge/tag-badge';
import { VoteButtons } from '../../components/vote-buttons/vote-buttons';
import { EmojiPicker } from '../../components/emoji-picker/emoji-picker';

const SENTIMENT_MAP: Record<string, string> = {
  happy: '😊', sad: '😢', angry: '😠', neutral: '😐',
};

@Component({
  selector: 'app-post-detail',
  imports: [NgFor, NgIf, DatePipe, FormsModule, RouterLink, TagBadge, VoteButtons, EmojiPicker],
  templateUrl: './post-detail.html',
})
export class PostDetail implements OnInit {
  post: Post | null = null;
  comments: Comment[] = [];
  loading = true;
  newComment = '';
  submitting = false;
  commentError = '';
  postVoted: 'up' | 'down' | null = null;
  private commentVotes: Record<string, 'up' | 'down'> = {};

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private commentService: CommentService,
    private session: SessionService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.postService.getPost(id).subscribe({
      next: (p) => {
        this.post = p;
        this.loading = false;
        this.cdr.detectChanges();
        this.loadComments();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); },
    });
  }

  loadComments() {
    this.commentService.getComments(this.post!.id).subscribe({
      next: (c) => { this.comments = c; this.cdr.detectChanges(); },
    });
  }

  get sentimentEmoji() {
    return SENTIMENT_MAP[this.post?.sentiment ?? 'neutral'] ?? '😐';
  }

  submitComment() {
    if (!this.newComment.trim()) return;
    this.submitting = true;
    this.commentError = '';
    this.commentService.createComment(this.post!.id, this.newComment).subscribe({
      next: (c) => {
        this.comments.push(c);
        this.newComment = '';
        this.submitting = false;
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.commentError = e.error?.error || 'Failed to post comment.';
        this.submitting = false;
        this.cdr.detectChanges();
      },
    });
  }

  onPostVote(event: { type: 'up' | 'down'; revert: boolean }) {
    const sid = this.session.getSessionId();
    this.postService.vote(this.post!.id, event.type, sid).subscribe({
      next: (res) => {
        this.postVoted = res.voted ?? null;
        this.post!.upvotes = res.upvotes;
        this.post!.downvotes = res.downvotes;
        this.cdr.detectChanges();
      },
    });
  }

  getCommentVoted(id: string) { return this.commentVotes[id] ?? null; }

  onCommentVote(comment: Comment, event: { type: 'up' | 'down'; revert: boolean }) {
    const sid = this.session.getSessionId();
    this.commentService.vote(comment.id, event.type, sid).subscribe({
      next: (res) => {
        this.commentVotes[comment.id] = res.voted ?? null;
        comment.upvotes = res.upvotes;
        comment.downvotes = res.downvotes;
        this.cdr.detectChanges();
      },
    });
  }

  reportPost() {
    const reason = prompt('Reason for reporting?');
    if (!reason) return;
    this.postService.report(this.post!.id, reason, this.session.getSessionId()).subscribe({
      next: () => alert('Report submitted!'),
      error: (e) => alert(e.error?.error || 'Already reported'),
    });
  }

  reportComment(id: string) {
    const reason = prompt('Reason for reporting?');
    if (!reason) return;
    this.commentService.report(id, reason, this.session.getSessionId()).subscribe({
      next: () => alert('Report submitted!'),
      error: (e) => alert(e.error?.error || 'Already reported'),
    });
  }

  autoResize(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 160) + 'px';
  }

  insertEmoji(emoji: string) {
    this.newComment += emoji;
  }
}
