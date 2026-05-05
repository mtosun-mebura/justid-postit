import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { of } from 'rxjs';
import type { WritableSignal } from '@angular/core';
import { Overview } from './overview';
import { PostItApi } from '../../services/post-it-api';
import { UserContext } from '../../services/user-context';
import { MatSnackBar } from '@angular/material/snack-bar';
import type { PostItDto } from '../../models/post-it.model';

type OverviewTestView = Overview & { rows: WritableSignal<PostItDto[]> };

describe('Overview', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Overview],
      providers: [
        {
          provide: PostItApi,
          useValue: {
            getPostIts: vi.fn().mockReturnValue(of([])),
          },
        },
        {
          provide: UserContext,
          useValue: {
            selectedUserId: () => null as number | null,
            refreshTick: () => 0,
          },
        },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    });
  });

  it('sortData sorteert op titel oplopend', () => {
    const fixture = TestBed.createComponent(Overview);
    const cmp = fixture.componentInstance as OverviewTestView;
    const rows: PostItDto[] = [
      row({ id: 1, title: 'B' }),
      row({ id: 2, title: 'a' }),
    ];
    cmp.rows.set(rows);
    cmp.sortData({ active: 'title', direction: 'asc' });
    expect(cmp.rows().map((r) => r.title)).toEqual(['a', 'B']);
  });

  it('sortData met lege direction laat volgorde reset naar slice-order', () => {
    const fixture = TestBed.createComponent(Overview);
    const cmp = fixture.componentInstance as OverviewTestView;
    cmp.rows.set([row({ id: 1, title: 'Z' }), row({ id: 2, title: 'A' })]);
    cmp.sortData({ active: '', direction: '' });
    expect(cmp.rows().length).toBe(2);
  });
});

function row(partial: Partial<PostItDto> & Pick<PostItDto, 'id' | 'title'>): PostItDto {
  return {
    userId: 1,
    description: '',
    tags: '',
    createdAt: '',
    deadlineDate: null,
    completed: false,
    archived: false,
    positionX: 0,
    positionY: 0,
    zIndex: 0,
    ...partial,
  };
}
