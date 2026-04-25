import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService, Post } from '../../services/post';
import { SessionService } from '../../services/session';
import { SocketService } from '../../services/socket';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  time: Date;
}

@Component({
  selector: 'app-chat-room',
  imports: [NgFor, NgIf, DatePipe, FormsModule, RouterLink],
  templateUrl: './chat-room.html',
})
export class ChatRoom implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesEnd') messagesEnd!: ElementRef;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  post: Post | null = null;
  messages: ChatMessage[] = [];
  newMessage = '';
  loading = true;
  aiTyping = false;
  private shouldScroll = false;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private session: SessionService,
    private socket: SocketService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const postId = this.route.snapshot.paramMap.get('id')!;
    this.postService.getPost(postId).subscribe({
      next: (p) => {
        this.post = p;
        this.loading = false;
        this.socket.joinRoom(postId, this.session.getSessionId());

        this.socket.getHistory(postId, this.session.getSessionId()).subscribe({
          next: (history) => {
            if (history.length > 0) {
              this.messages = history.map(m => ({
                role: m.role === 'assistant' ? 'ai' as const : 'user' as const,
                content: m.content,
                time: new Date(m.created_at),
              }));
            } else {
              this.messages.push({
                role: 'ai',
                content: `Hi! I'm your AI companion 🤖\n\nI've read your post about "${p.title}". I'm here to listen, support, and chat with you. What's on your mind?`,
                time: new Date(),
              });
            }
            this.shouldScroll = true;
            this.cdr.detectChanges();
          },
        });

        this.socket.onAIResponse(({ message }) => {
          this.aiTyping = false;
          this.messages.push({ role: 'ai', content: message, time: new Date() });
          this.shouldScroll = true;
          this.cdr.detectChanges();
        });

        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); },
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  sendMessage() {
    if (!this.newMessage.trim() || this.aiTyping) return;
    const msg = this.newMessage.trim();
    this.messages.push({ role: 'user', content: msg, time: new Date() });
    this.newMessage = '';
    this.aiTyping = true;
    this.shouldScroll = true;
    this.cdr.detectChanges();

    this.socket.sendMessage(
      this.post!.id,
      { title: this.post!.title, content: this.post!.content },
      msg,
      this.session.getSessionId()
    );
  }

  onEnter(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  autoResize(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px';
  }

  scrollToBottom() {
    try {
      this.messagesEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
    } catch {}
  }

  ngOnDestroy() {
    this.socket.offAIResponse();
  }
}
