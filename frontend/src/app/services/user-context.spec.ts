import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, beforeEach, afterEach, it, expect } from 'vitest';
import { UserContext } from './user-context';

describe('UserContext', () => {
  let ctx: UserContext;
  let httpMock: HttpTestingController;
  const base = 'http://localhost:8080';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserContext, provideHttpClient(), provideHttpClientTesting()],
    });
    ctx = TestBed.inject(UserContext);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('initialize kiest po-demo als die bestaat', () => {
    ctx.initialize();
    const req = httpMock.expectOne(`${base}/api/v1/users`);
    req.flush([
      { id: 2, username: 'other', displayName: 'O', createdAt: '' },
      { id: 1, username: 'po-demo', displayName: 'PO', createdAt: '' },
    ]);
    expect(ctx.selectedUserId()).toBe(1);
    expect(ctx.users().length).toBe(2);
  });

  it('initialize laat selectie leeg bij HTTP-fout', () => {
    ctx.initialize();
    const req = httpMock.expectOne(`${base}/api/v1/users`);
    req.flush('fail', { status: 500, statusText: 'Error' });
    expect(ctx.selectedUserId()).toBeNull();
  });

  it('triggerRefresh verhoogt refreshTick', () => {
    expect(ctx.refreshTick()).toBe(0);
    ctx.triggerRefresh();
    expect(ctx.refreshTick()).toBe(1);
  });

  it('setSelectedUserId zet id en triggert refresh', () => {
    ctx.setSelectedUserId(99);
    expect(ctx.selectedUserId()).toBe(99);
    expect(ctx.refreshTick()).toBe(1);
  });

  it('selectedUser resolved naar gebruiker in lijst', () => {
    ctx.users.set([{ id: 5, username: 'u', displayName: 'D', createdAt: '' }]);
    ctx.selectedUserId.set(5);
    expect(ctx.selectedUser()?.username).toBe('u');
  });
});
