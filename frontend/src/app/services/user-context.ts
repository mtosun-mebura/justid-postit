import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import type { UserDto } from '../models/post-it.model';

/**
 * Gedeelde state voor "welke gebruiker bouwt aan het bord".
 * Opdracht vraagt om services voor state; hier kiezen we één plek zodat header en pagina's
 * dezelfde userId delen zonder losse query-params op elke route.
 */
@Injectable({
  providedIn: 'root',
})
export class UserContext {
  private readonly http = inject(HttpClient);

  readonly users = signal<UserDto[]>([]);
  readonly selectedUserId = signal<number | null>(null);

  readonly selectedUser = computed(() => {
    const id = this.selectedUserId();
    if (id == null) {
      return null;
    }
    return this.users().find((u) => u.id === id) ?? null;
  });

  readonly refreshTick = signal(0);

  triggerRefresh(): void {
    this.refreshTick.update((n) => n + 1);
  }

  initialize(): void {
    this.http
      .get<UserDto[]>(`${environment.apiBaseUrl}/api/v1/users`)
      .pipe(
        tap((list) => this.users.set(list)),
        map((list) => {
          const preferred = list.find((u) => u.username === 'po-demo');
          return preferred?.id ?? list[0]?.id ?? null;
        }),
        catchError(() => of(null)),
      )
      .subscribe((id) => {
        if (id != null) {
          this.selectedUserId.set(id);
        }
      });
  }

  setSelectedUserId(id: number): void {
    this.selectedUserId.set(id);
    this.triggerRefresh();
  }
}
