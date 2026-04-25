import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;

  constructor(private http: HttpClient) {
    this.socket = io(environment.apiUrl.replace('/api', ''), {
      transports: ['websocket'],
      autoConnect: true,
    });
  }

  getHistory(postId: string, sessionId: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/chat/${postId}?session_id=${sessionId}`);
  }

  joinRoom(postId: string, sessionId: string) {
    this.socket.emit('join_room', { postId, sessionId });
  }

  sendMessage(postId: string, postContext: any, message: string, sessionId: string) {
    this.socket.emit('chat_message', { postId, postContext, message, sessionId });
  }

  onAIResponse(cb: (data: { message: string }) => void) {
    this.socket.on('ai_response', cb);
  }

  subscribeNotifications(sessionId: string) {
    this.socket.emit('subscribe_notifications', { sessionId });
  }

  onNotification(cb: (data: any) => void) {
    this.socket.on('new_notification', cb);
  }

  offAIResponse() {
    this.socket.off('ai_response');
  }

  offNotification() {
    this.socket.off('new_notification');
  }
}
