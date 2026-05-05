import { DatePipe } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PostItApi } from '../../services/post-it-api';
import { UserContext } from '../../services/user-context';
import type { PostItDto } from '../../models/post-it.model';

@Component({
  selector: 'app-overview',
  imports: [
    DatePipe,
    RouterLink,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {
  private readonly api = inject(PostItApi);
  private readonly userContext = inject(UserContext);
  private readonly snack = inject(MatSnackBar);

  protected readonly rows = signal<PostItDto[]>([]);

  protected displayedColumns: string[] = [
    'title',
    'tags',
    'createdAt',
    'deadlineDate',
    'completed',
    'archived',
    'actions',
  ];

  constructor() {
    effect((onCleanup) => {
      const id = this.userContext.selectedUserId();
      this.userContext.refreshTick();
      if (id == null) {
        this.rows.set([]);
        return;
      }
      const sub = this.api.getPostIts(id).subscribe({
        next: (list) => this.rows.set(list),
        error: () => {
          this.rows.set([]);
          this.snack.open('Lijst laden mislukt', 'OK', { duration: 4000 });
        },
      });
      onCleanup(() => sub.unsubscribe());
    });
  }

  sortData(sort: Sort): void {
    const data = this.rows().slice();
    if (!sort.active || sort.direction === '') {
      this.rows.set(data);
      return;
    }
    const dir = sort.direction === 'asc' ? 1 : -1;
    data.sort((a, b) => {
      const av = this.valueForSort(a, sort.active);
      const bv = this.valueForSort(b, sort.active);
      if (av < bv) {
        return -1 * dir;
      }
      if (av > bv) {
        return 1 * dir;
      }
      return 0;
    });
    this.rows.set(data);
  }

  private valueForSort(p: PostItDto, col: string): string | number {
    switch (col) {
      case 'title':
        return p.title.toLowerCase();
      case 'tags':
        return (p.tags || '').toLowerCase();
      case 'createdAt':
        return p.createdAt;
      case 'deadlineDate':
        return p.deadlineDate || '';
      case 'completed':
        return p.completed ? 1 : 0;
      case 'archived':
        return p.archived ? 1 : 0;
      default:
        return '';
    }
  }
}
