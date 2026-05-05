import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { of } from 'rxjs';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Create } from './create';
import { PostItApi, type CreatePostItBody } from '../../services/post-it-api';
import { UserContext } from '../../services/user-context';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

/**
 * Zelfde formuliervelden als create.html, zonder routerLink (Router/ActivatedRoute
 * in unit tests met Vitest geeft anders NG0201 / root undefined).
 */
const createTestTemplate = `
<mat-card>
  <mat-card-content>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <mat-form-field appearance="outline">
        <input matInput formControlName="title" />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <textarea matInput formControlName="description" rows="2"></textarea>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <input matInput formControlName="tags" />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <input matInput formControlName="colorHex" />
      </mat-form-field>
      <button mat-flat-button type="submit">Opslaan</button>
    </form>
  </mat-card-content>
</mat-card>
`;

/** Minimale test-double; echte UserContext gebruikt signalen — hier volstaat een callable. */
class UserContextStub {
  selectedUserIdValue: number | null = 1;
  readonly triggerRefresh = vi.fn();
  readonly selectedUserId = () => this.selectedUserIdValue;
}

/** Testtoegang tot protected `form` zonder productie-API te wijzigen. */
type CreateTestView = Create & { form: FormGroup };

describe('Create', () => {
  let component: CreateTestView;
  let api: { createPostIt: ReturnType<typeof vi.fn> };
  let userContext: UserContextStub;
  let router: { navigate: ReturnType<typeof vi.fn> };
  let snack: { open: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    api = {
      createPostIt: vi.fn().mockReturnValue(of({})),
    };
    userContext = new UserContextStub();
    router = { navigate: vi.fn().mockResolvedValue(true) };
    snack = { open: vi.fn() };

    TestBed.configureTestingModule({
      imports: [Create],
      providers: [
        provideNoopAnimations(),
        { provide: PostItApi, useValue: api },
        { provide: UserContext, useValue: userContext },
        { provide: Router, useValue: router },
        { provide: MatSnackBar, useValue: snack },
      ],
    });
    TestBed.overrideProvider(UserContext, { useValue: userContext });

    TestBed.overrideComponent(Create, {
      set: {
        imports: [
          ReactiveFormsModule,
          MatCardModule,
          MatFormFieldModule,
          MatInputModule,
          MatButtonModule,
          MatDatepickerModule,
          MatNativeDateModule,
          MatSnackBarModule,
        ],
        template: createTestTemplate,
        styles: [],
      },
    });

    const fixture = TestBed.createComponent(Create);
    component = fixture.componentInstance as CreateTestView;
  });

  it('submit doet niets als formulier ongeldig is', () => {
    component.submit();
    expect(api.createPostIt).not.toHaveBeenCalled();
  });

  it('submit stuurt genormaliseerde kleur naar API', () => {
    component.form.patchValue({
      title: 'Taak',
      description: '',
      tags: '',
      deadline: null,
      colorHex: '#c8e6c9',
    });
    component.submit();
    expect(api.createPostIt).toHaveBeenCalled();
    const arg = api.createPostIt.mock.calls[0][0] as CreatePostItBody;
    expect(arg.colorHex).toBe('#C8E6C9');
    expect(arg.userId).toBe(1);
  });
});
