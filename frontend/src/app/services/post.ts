import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Post {
  id: string;
  anonymous_name: string;
  title: string;
  content: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  sentiment: string;
  ai_reply: string | null;
  comment_count: number;
  created_at: string;
  expires_at: string;
}

@Injectable({ providedIn: 'root' })
export class PostService {
  private api = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient) {}

  getPosts(tag?: string, sort = 'new', page = 1): Observable<Post[]> {
    let params = new HttpParams().set('sort', sort).set('page', page).set('limit', 10);
    if (tag) params = params.set('tag', tag);
    return this.http.get<Post[]>(this.api, { params });
  }

  getPost(id: string): Observable<Post> {
    return this.http.get<Post>(`${this.api}/${id}`);
  }

  createPost(data: { title: string; content: string; tags: string[]; session_id?: string }): Observable<Post> {
    return this.http.post<Post>(this.api, data);
  }

  vote(postId: string, vote_type: 'up' | 'down', session_id: string): Observable<any> {
    return this.http.post(`${this.api}/${postId}/vote`, { vote_type, session_id });
  }

  report(target_id: string, reason: string, session_id: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/reports`, {
      target_id, target_type: 'post', reason, session_id,
    });
  }
}
