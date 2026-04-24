import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { PostService } from '../../services/post';

const TAGS = ['relationship', 'career', 'mental health', 'family', 'finance', 'friendship', 'other'];

@Component({
  selector: 'app-create-post',
  imports: [FormsModule, NgFor, NgIf],
  templateUrl: './create-post.html',
})
export class CreatePost {
  title = '';
  content = '';
  selectedTags: string[] = [];
  tags = TAGS;
  submitting = false;
  error = '';

  constructor(private postService: PostService, private router: Router) {}

  toggleTag(tag: string) {
    const idx = this.selectedTags.indexOf(tag);
    idx === -1 ? this.selectedTags.push(tag) : this.selectedTags.splice(idx, 1);
  }

  submit() {
    if (!this.title.trim() || !this.content.trim()) return;
    this.submitting = true;
    this.error = '';
    this.postService.createPost({ title: this.title, content: this.content, tags: this.selectedTags }).subscribe({
      next: (post) => this.router.navigate(['/post', post.id]),
      error: (e) => { this.error = e.error?.error || 'Failed to post. Try again.'; this.submitting = false; },
    });
  }
}
