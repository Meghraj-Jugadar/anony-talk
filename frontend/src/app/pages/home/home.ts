import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService, Post } from '../../services/post';
import { SessionService } from '../../services/session';
import { PostCard } from '../../components/post-card/post-card';

const TAGS = ['relationship', 'career', 'mental health', 'family', 'finance', 'friendship', 'other'];

@Component({
  selector: 'app-home',
  imports: [NgFor, NgIf, FormsModule, PostCard, TitleCasePipe],
  templateUrl: './home.html',
})
export class Home implements OnInit {
  posts: Post[] = [];
  loading = false;
  sort = 'new';
  activeTag: string | null = null;
  page = 1;
  sorts = ['new', 'top', 'controversial'];
  tags = TAGS;
  private votes: Record<string, 'up' | 'down'> = {};

  constructor(
    private postService: PostService,
    private session: SessionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.loadPosts(true); }

  loadPosts(reset = false) {
    if (reset) { this.page = 1; this.posts = []; }
    this.loading = true;
    this.postService.getPosts(this.activeTag ?? undefined, this.sort, this.page).subscribe({
      next: (data) => {
        this.posts = [...this.posts, ...data];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load posts', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadMore() { this.page++; this.loadPosts(); }
  setSort(s: string) { this.sort = s; this.loadPosts(true); }
  setTag(t: string | null) { this.activeTag = t; this.loadPosts(true); }
  getVoted(id: string) { return this.votes[id] ?? null; }

  onVote(post: Post, event: { type: 'up' | 'down'; revert: boolean }) {
    const sid = this.session.getSessionId();
    this.postService.vote(post.id, event.type, sid).subscribe({
      next: (res) => {
        this.votes[post.id] = res.voted ?? null;
        post.upvotes = res.upvotes;
        post.downvotes = res.downvotes;
        this.cdr.detectChanges();
      },
    });
  }

  onReport(postId: string) {
    const reason = prompt('Reason for reporting?');
    if (!reason) return;
    this.postService.report(postId, reason, this.session.getSessionId()).subscribe({
      next: () => alert('Report submitted. Thank you!'),
      error: (e) => alert(e.error?.error || 'Already reported'),
    });
  }
}
