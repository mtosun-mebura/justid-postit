import { TestBed } from '@angular/core/testing';
import { signal, computed } from '@angular/core';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { of } from 'rxjs';
import { Board } from './board';
import { PostItApi } from '../../services/post-it-api';
import { UserContext } from '../../services/user-context';
import type { PostItDto, UserDto } from '../../models/post-it.model';
import { DEFAULT_POST_IT_COLOR } from '../../constants/post-it-colors';
import { MatSnackBar } from '@angular/material/snack-bar';

/** Minimale stub met de signal-API die het bord gebruikt. */
class UserContextStub {
  readonly users = signal<UserDto[]>([]);
  readonly selectedUserId = signal<number | null>(null);
  readonly refreshTick = signal(0);
  readonly selectedUser = computed<UserDto | null>(() => null);

  triggerRefresh(): void {
    this.refreshTick.update((n) => n + 1);
  }

  initialize(): void {}

  setSelectedUserId(id: number): void {
    this.selectedUserId.set(id);
  }
}

describe('Board', () => {
  let api: {
    getPostIts: ReturnType<typeof vi.fn>;
    patchPosition: ReturnType<typeof vi.fn>;
    patchArchive: ReturnType<typeof vi.fn>;
    patchComplete: ReturnType<typeof vi.fn>;
    deletePostIt: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    api = {
      getPostIts: vi.fn().mockReturnValue(of([])),
      patchPosition: vi.fn(),
      patchArchive: vi.fn(),
      patchComplete: vi.fn(),
      deletePostIt: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [Board],
      providers: [
        { provide: PostItApi, useValue: api },
        { provide: UserContext, useValue: new UserContextStub() as unknown as UserContext },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    });
  });

  it('maxZ is 0 bij geen items', () => {
    const fixture = TestBed.createComponent(Board);
    const board = fixture.componentInstance;
    expect(board.maxZ()).toBe(0);
  });

  it('maxZ neemt hoogste zIndex', () => {
    const fixture = TestBed.createComponent(Board);
    const board = fixture.componentInstance;
    board['items'].set([
      samplePost({ id: 1, zIndex: 2 }),
      samplePost({ id: 2, zIndex: 5 }),
    ]);
    expect(board.maxZ()).toBe(5);
  });

  it('cardColor gebruikt colorHex of valt terug op default', () => {
    const fixture = TestBed.createComponent(Board);
    const board = fixture.componentInstance as unknown as {
      cardColor: (p: PostItDto) => string;
    };
    expect(board.cardColor(samplePost({ id: 1, colorHex: '#BBDEFB' }))).toBe('#BBDEFB');
    expect(board.cardColor(samplePost({ id: 2, colorHex: undefined }))).toBe(DEFAULT_POST_IT_COLOR);
    expect(board.cardColor(samplePost({ id: 3, colorHex: '  ' }))).toBe(DEFAULT_POST_IT_COLOR);
  });
});

function samplePost(overrides: Partial<PostItDto> & Pick<PostItDto, 'id'>): PostItDto {
  const { id, ...rest } = overrides;
  return {
    userId: 1,
    title: 't',
    description: '',
    tags: '',
    createdAt: '',
    deadlineDate: null,
    completed: false,
    archived: false,
    positionX: 0,
    positionY: 0,
    zIndex: 0,
    ...rest,
    id,
  };
}
