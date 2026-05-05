import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type { PostItDto, UserDto } from '../models/post-it.model';

export interface CreatePostItBody {
  userId: number;
  title: string;
  description?: string;
  tags?: string;
  deadlineDate?: string | null;
  positionX?: number;
  positionY?: number;
  zIndex?: number;
  colorHex?: string;
}

export interface UpdatePostItBody {
  title: string;
  description: string;
  tags: string;
  deadlineDate: string | null;
  completed: boolean;
  archived: boolean;
  positionX: number;
  positionY: number;
  zIndex: number;
  colorHex: string;
}

@Injectable({
  providedIn: 'root',
})
export class PostItApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  getUsers(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(`${this.base}/api/v1/users`);
  }

  getPostIts(userId: number): Observable<PostItDto[]> {
    const params = new HttpParams().set('userId', String(userId));
    return this.http.get<PostItDto[]>(`${this.base}/api/v1/post-its`, { params });
  }

  getPostIt(id: number): Observable<PostItDto> {
    return this.http.get<PostItDto>(`${this.base}/api/v1/post-its/${id}`);
  }

  createPostIt(body: CreatePostItBody): Observable<PostItDto> {
    return this.http.post<PostItDto>(`${this.base}/api/v1/post-its`, body);
  }

  updatePostIt(id: number, body: UpdatePostItBody): Observable<PostItDto> {
    return this.http.put<PostItDto>(`${this.base}/api/v1/post-its/${id}`, body);
  }

  patchPosition(
    id: number,
    body: { x: number; y: number; zIndex?: number | null },
  ): Observable<PostItDto> {
    return this.http.patch<PostItDto>(`${this.base}/api/v1/post-its/${id}/position`, {
      x: body.x,
      y: body.y,
      zIndex: body.zIndex ?? undefined,
    });
  }

  patchArchive(id: number, archived: boolean): Observable<PostItDto> {
    return this.http.patch<PostItDto>(`${this.base}/api/v1/post-its/${id}/archive`, { archived });
  }

  patchComplete(id: number, completed: boolean): Observable<PostItDto> {
    return this.http.patch<PostItDto>(`${this.base}/api/v1/post-its/${id}/complete`, { completed });
  }

  deletePostIt(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/v1/post-its/${id}`);
  }

  getOpenCount(userId: number): Observable<{ openCount: number }> {
    const params = new HttpParams().set('userId', String(userId));
    return this.http.get<{ openCount: number }>(`${this.base}/api/v1/stats/open-count`, { params });
  }
}
