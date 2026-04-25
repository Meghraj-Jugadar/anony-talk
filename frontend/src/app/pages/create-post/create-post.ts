import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { PostService } from '../../services/post';
import { SessionService } from '../../services/session';
import { ToastService } from '../../services/toast';
import { EmojiPicker } from '../../components/emoji-picker/emoji-picker';

const TAGS = ['relationship', 'career', 'mental health', 'family', 'finance', 'friendship', 'other'];

@Component({
  selector: 'app-create-post',
  imports: [FormsModule, NgFor, NgIf, EmojiPicker],
  templateUrl: './create-post.html',
})
export class CreatePost {
  @ViewChild('contentRef') contentRef!: ElementRef<HTMLTextAreaElement>;

  title = '';
  content = '';
  selectedTags: string[] = [];
  tags = TAGS;
  submitting = false;
  error = '';

  constructor(
    private postService: PostService,
    private router: Router,
    private session: SessionService,
    private toast: ToastService,
  ) {}

  toggleTag(tag: string) {
    const idx = this.selectedTags.indexOf(tag);
    idx === -1 ? this.selectedTags.push(tag) : this.selectedTags.splice(idx, 1);
  }

  insertEmoji(field: 'title' | 'content', emoji: string) {
    if (field === 'title') {
      this.title += emoji;
    } else {
      const textarea = this.contentRef?.nativeElement;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        this.content = this.content.substring(0, start) + emoji + this.content.substring(end);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
          textarea.focus();
        });
      } else {
        this.content += emoji;
      }
    }
  }

  submit() {
    if (!this.title.trim() || !this.content.trim()) return;
    this.submitting = true;
    this.error = '';
    this.postService.createPost({
      title: this.title,
      content: this.content,
      tags: this.selectedTags,
      session_id: this.session.getSessionId(),
    }).subscribe({
      next: (post) => {
        this.toast.success('Post shared anonymously! 🎭');
        if (post.ai_reply) {
          setTimeout(() => {
            this.toast.ai(`🤖 AI replied: "${post.ai_reply!.substring(0, 80)}..."`);
          }, 1500);
        }
        this.router.navigate(['/post', post.id]);
      },
      error: (e) => {
        this.error = e.error?.error || 'Failed to post. Try again.';
        this.submitting = false;
      },
    });
  }
}
