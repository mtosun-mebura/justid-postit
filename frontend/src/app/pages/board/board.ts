import { CdkDragEnd, CdkDragStart, DragDropModule } from '@angular/cdk/drag-drop';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PostItApi } from '../../services/post-it-api';
import { UserContext } from '../../services/user-context';
import { readPostItColorHexFromDto, type PostItDto } from '../../models/post-it.model';
import { DEFAULT_POST_IT_COLOR } from '../../constants/post-it-colors';

@Component({
  selector: 'app-board',
  imports: [
    DragDropModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
    RouterLink,
  ],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {
  private readonly api = inject(PostItApi);
  private readonly userContext = inject(UserContext);
  private readonly snack = inject(MatSnackBar);

  /** Alleen actieve post-its op het bord; archief blijft elders zichtbaar. */
  protected readonly items = signal<PostItDto[]>([]);

  protected readonly visibleItems = computed(() =>
    this.items().filter((p) => !p.archived),
  );

  constructor() {
    effect((onCleanup) => {
      const id = this.userContext.selectedUserId();
      this.userContext.refreshTick();
      if (id == null) {
        this.items.set([]);
        return;
      }
      const sub = this.api.getPostIts(id).subscribe({
        next: (list) => this.items.set(list),
        error: () => {
          this.items.set([]);
          this.snack.open('Kon post-its niet laden. Draait de API?', 'OK', { duration: 4000 });
        },
      });
      onCleanup(() => sub.unsubscribe());
    });
  }

  maxZ(): number {
    const vs = this.visibleItems();
    if (vs.length === 0) {
      return 0;
    }
    return Math.max(...vs.map((p) => p.zIndex));
  }

  onDragStarted(_event: CdkDragStart, item: PostItDto): void {
    const nextZ = this.maxZ() + 1;
    if (nextZ === item.zIndex) {
      return;
    }
    this.api
      .patchPosition(item.id, {
        x: item.positionX,
        y: item.positionY,
        zIndex: nextZ,
      })
      .subscribe({
        next: (updated) => this.patchLocal(updated),
        error: () => {},
      });
  }

  onDragEnded(event: CdkDragEnd, item: PostItDto): void {
    const delta = event.source.getFreeDragPosition();
    const current = this.items().find((i) => i.id === item.id) ?? item;
    const nx = current.positionX + delta.x;
    const ny = current.positionY + delta.y;
    event.source.reset();
    this.api
      .patchPosition(item.id, {
        x: nx,
        y: ny,
        zIndex: current.zIndex,
      })
      .subscribe({
        next: (updated) => this.patchLocal(updated),
        error: () =>
          this.snack.open('Opslaan van positie mislukt', 'OK', { duration: 3000 }),
      });
  }

  archive(item: PostItDto): void {
    this.api.patchArchive(item.id, true).subscribe({
      next: (updated) => {
        this.patchLocal(updated);
        this.userContext.triggerRefresh();
        this.snack.open('Naar archief verplaatst', 'OK', { duration: 2500 });
      },
      error: () => this.snack.open('Archiveren mislukt', 'OK', { duration: 3000 }),
    });
  }

  complete(item: PostItDto): void {
    if (item.completed) {
      return;
    }
    this.api.patchComplete(item.id, true).subscribe({
      next: (updated) => {
        this.patchLocal(updated);
        this.userContext.triggerRefresh();
      },
      error: () => this.snack.open('Markeren als voltooid mislukt', 'OK', { duration: 3000 }),
    });
  }

  remove(item: PostItDto): void {
    if (!confirm(`Post-it “${item.title}” verwijderen?`)) {
      return;
    }
    this.api.deletePostIt(item.id).subscribe({
      next: () => {
        this.items.update((list) => list.filter((p) => p.id !== item.id));
        this.userContext.triggerRefresh();
      },
      error: () => this.snack.open('Verwijderen mislukt', 'OK', { duration: 3000 }),
    });
  }

  private patchLocal(updated: PostItDto): void {
    this.items.update((list) => list.map((p) => (p.id === updated.id ? updated : p)));
  }

  protected cardColor(p: PostItDto): string {
    const c = readPostItColorHexFromDto(p)?.trim();
    return c || DEFAULT_POST_IT_COLOR;
  }
}
