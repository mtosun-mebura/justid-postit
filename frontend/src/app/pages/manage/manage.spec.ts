import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { of } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { Manage } from './manage';
import { PostItApi } from '../../services/post-it-api';
import { UserContext } from '../../services/user-context';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { convertToParamMap } from '@angular/router';
import type { PostItDto } from '../../models/post-it.model';

type ManageTestView = Manage & { form: FormGroup };

describe('Manage', () => {
  let api: {
    getPostIt: ReturnType<typeof vi.fn>;
    updatePostIt: ReturnType<typeof vi.fn>;
  };
  let userContext: { triggerRefresh: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };

  const basePost = (): PostItDto => ({
    id: 1,
    userId: 1,
    title: 'Titel',
    description: '',
    tags: '',
    createdAt: '2026-01-01T00:00:00Z',
    deadlineDate: null,
    completed: false,
    archived: false,
    positionX: 10,
    positionY: 20,
    zIndex: 0,
    colorHex: '#BBDEFB',
  });

  beforeEach(() => {
    api = {
      getPostIt: vi.fn().mockReturnValue(of(basePost())),
      updatePostIt: vi.fn().mockReturnValue(of(basePost())),
    };
    userContext = { triggerRefresh: vi.fn() };
    router = { navigate: vi.fn().mockResolvedValue(true) };

    TestBed.configureTestingModule({
      imports: [Manage],
      providers: [
        provideNoopAnimations(),
        { provide: PostItApi, useValue: api },
        { provide: UserContext, useValue: userContext },
        { provide: Router, useValue: router },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ todoId: '1' }),
              queryParamMap: convertToParamMap({ returnTo: 'board' }),
            },
          },
        },
      ],
    });
  });

  it('na detectChanges is cancelRoute /board bij returnTo=board', () => {
    const fixture = TestBed.createComponent(Manage);
    fixture.detectChanges();
    const cmp = fixture.componentInstance as unknown as { cancelRoute: () => string[] };
    expect(cmp.cancelRoute()).toEqual(['/board']);
  });

  it('save roept updatePostIt met genormaliseerde kleur aan', () => {
    const fixture = TestBed.createComponent(Manage);
    fixture.detectChanges();
    const cmp = fixture.componentInstance as ManageTestView;
    cmp.form.patchValue({
      title: 'Titel',
      colorHex: '#ffccbc',
    });
    cmp.save();
    expect(api.updatePostIt).toHaveBeenCalled();
    const body = api.updatePostIt.mock.calls[0][1] as { colorHex: string };
    expect(body.colorHex).toBe('#FFCCBC');
  });
});
