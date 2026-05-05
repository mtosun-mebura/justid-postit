import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { Header } from './header';
import { UserContext } from '../../services/user-context';
import { PostItApi } from '../../services/post-it-api';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('Header', () => {
  let header: Header;
  let setSelectedUserId: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setSelectedUserId = vi.fn();
    const userStub = {
      users: signal<{ id: number; username: string; displayName: string; createdAt: string }[]>([]),
      selectedUserId: signal<number | null>(null),
      refreshTick: signal(0),
      triggerRefresh: vi.fn(),
      setSelectedUserId,
    };

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        Header,
      ],
      providers: [
        provideNoopAnimations(),
        { provide: UserContext, useValue: userStub },
        { provide: PostItApi, useValue: { getOpenCount: vi.fn().mockReturnValue(of({ openCount: 0 })) } },
      ],
    });

    TestBed.overrideProvider(UserContext, { useValue: userStub });

    TestBed.overrideComponent(Header, {
      set: {
        template: '',
        imports: [],
      },
    });

    const fixture = TestBed.createComponent(Header);
    header = fixture.componentInstance;
  });

  it('onUserChange roept UserContext.setSelectedUserId aan', () => {
    header.onUserChange(42);
    expect(setSelectedUserId).toHaveBeenCalledWith(42);
  });
});
