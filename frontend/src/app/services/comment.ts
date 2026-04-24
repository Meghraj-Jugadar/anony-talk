import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Comment {
  id: string;
  post_id: string;
  anonymous_name: string;
  content: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class CommentService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getComments(postId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.api}/posts/${postId}/comments`);
  }

  createComment(postId: string, content: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.api}/posts/${postId}/comments`, { content });
  }

  vote(commentId: string, vote_type: 'up' | 'down', session_id: string): Observable<any> {
    return this.http.post(`${this.api}/comments/${commentId}/vote`, { vote_type, session_id });
  }

  report(target_id: string, reason: string, session_id: string): Observable<any> {
    return this.http.post(`${this.api}/reports`, {
      target_id, target_type: 'comment', reason, session_id,
    });
  }
}
