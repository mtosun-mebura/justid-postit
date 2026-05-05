import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, beforeEach, afterEach, it, expect } from 'vitest';
import { PostItApi } from './post-it-api';

describe('PostItApi', () => {
  let api: PostItApi;
  let httpMock: HttpTestingController;
  const base = 'http://localhost:8080';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PostItApi, provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(PostItApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getUsers roept GET /api/v1/users aan', () => {
    api.getUsers().subscribe((users) => {
      expect(users).toEqual([]);
    });
    const req = httpMock.expectOne(`${base}/api/v1/users`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getPostIts zet userId als queryparam', () => {
    api.getPostIts(42).subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === `${base}/api/v1/post-its` && r.params.get('userId') === '42',
    );
    req.flush([]);
  });

  it('createPostIt POST naar /api/v1/post-its met body', () => {
    const body = {
      userId: 1,
      title: 'T',
      colorHex: '#FFF59D',
    };
    api.createPostIt(body).subscribe();
    const req = httpMock.expectOne(`${base}/api/v1/post-its`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({});
  });

  it('updatePostIt PUT met id in pad', () => {
    api
      .updatePostIt(7, {
        title: 'x',
        description: '',
        tags: '',
        deadlineDate: null,
        completed: false,
        archived: false,
        positionX: 1,
        positionY: 2,
        zIndex: 0,
        colorHex: '#C8E6C9',
      })
      .subscribe();
    const req = httpMock.expectOne(`${base}/api/v1/post-its/7`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('patchPosition PATCH naar /position', () => {
    api.patchPosition(3, { x: 10, y: 20, zIndex: 1 }).subscribe();
    const req = httpMock.expectOne(`${base}/api/v1/post-its/3/position`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ x: 10, y: 20, zIndex: 1 });
    req.flush({});
  });

  it('patchComplete PATCH naar /complete', () => {
    api.patchComplete(5, true).subscribe();
    const req = httpMock.expectOne(`${base}/api/v1/post-its/5/complete`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ completed: true });
    req.flush({});
  });
});
