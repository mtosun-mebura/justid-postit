import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PostItApi } from '../../services/post-it-api';
import { UserContext } from '../../services/user-context';
import { readPostItColorHexFromDto, type PostItDto } from '../../models/post-it.model';
import {
  DEFAULT_POST_IT_COLOR,
  POST_IT_COLOR_OPTIONS,
  normalizePostItColorHex,
  samePostItColorHex,
} from '../../constants/post-it-colors';
import { MatSelectModule, type MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-manage',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatSelectModule,
  ],
  templateUrl: './manage.html',
  styleUrl: './manage.scss',
})
export class Manage implements OnInit {
  protected readonly colorOptions = POST_IT_COLOR_OPTIONS;
  protected readonly compareColorHex = samePostItColorHex;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(PostItApi);
  private readonly userContext = inject(UserContext);
  private readonly snack = inject(MatSnackBar);

  protected readonly model = signal<PostItDto | null>(null);

  protected readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    description: [''],
    tags: [''],
    deadline: [null as Date | null],
    completed: [false],
    archived: [false],
    colorHex: [DEFAULT_POST_IT_COLOR],
  });

  private todoId: number | null = null;

  /** Waar naartoe na opslaan / annuleren / verwijderen (via ?returnTo=board|overview). */
  private returnAfterClose: 'board' | 'overview' = 'overview';

  ngOnInit(): void {
    const rt = this.route.snapshot.queryParamMap.get('returnTo');
    this.returnAfterClose = rt === 'board' ? 'board' : 'overview';

    const idParam = this.route.snapshot.paramMap.get('todoId');
    const id = idParam ? Number(idParam) : NaN;
    if (Number.isNaN(id)) {
      void this.router.navigate(['/overview']);
      return;
    }
    this.todoId = id;
    this.api.getPostIt(id).subscribe({
      next: (p) => this.patchForm(p),
      error: () => {
        this.snack.open('Post-it niet gevonden', 'OK', { duration: 4000 });
        void this.router.navigate(['/overview']);
      },
    });
  }

  private patchForm(p: PostItDto): void {
    this.model.set(p);
    let deadline: Date | null = null;
    if (p.deadlineDate) {
      const [y, m, d] = p.deadlineDate.split('-').map(Number);
      deadline = new Date(y, m - 1, d);
    }
    this.form.patchValue({
      title: p.title,
      description: p.description,
      tags: p.tags,
      deadline,
      completed: p.completed,
      archived: p.archived,
      colorHex: normalizePostItColorHex(readPostItColorHexFromDto(p)),
    });
  }

  /** Zorgt dat mat-select en FormControl altijd dezelfde waarde hebben. */
  onColorHexChange(event: MatSelectChange<string>): void {
    this.form.patchValue({ colorHex: event.value }, { emitEvent: true });
  }

  save(): void {
    const id = this.todoId;
    const m = this.model();
    if (id == null || m == null || this.form.invalid) {
      return;
    }
    const v = this.form.getRawValue();
    const rawColor =
      this.form.get('colorHex')?.value ?? v.colorHex;
    const deadlineDate = v.deadline
      ? `${v.deadline.getFullYear()}-${String(v.deadline.getMonth() + 1).padStart(2, '0')}-${String(v.deadline.getDate()).padStart(2, '0')}`
      : null;

    this.api
      .updatePostIt(id, {
        title: v.title!.trim(),
        description: v.description?.trim() ?? '',
        tags: v.tags?.trim() ?? '',
        deadlineDate,
        completed: !!v.completed,
        archived: !!v.archived,
        positionX: m.positionX,
        positionY: m.positionY,
        zIndex: m.zIndex,
        colorHex: normalizePostItColorHex(
          rawColor as string | null | undefined,
        ),
      })
      .subscribe({
        next: (updated) => {
          this.model.set(updated);
          this.userContext.triggerRefresh();
          this.snack.open('Opgeslagen', 'OK', { duration: 2500 });
          this.navigateAfterLeave();
        },
        error: () => this.snack.open('Opslaan mislukt', 'OK', { duration: 4000 }),
      });
  }

  /** Route voor Annuleren: zelfde bestemming als na opslaan. */
  protected cancelRoute(): string[] {
    return this.returnAfterClose === 'board' ? ['/board'] : ['/overview'];
  }

  private navigateAfterLeave(): void {
    void this.router.navigate(
      this.returnAfterClose === 'board' ? ['/board'] : ['/overview'],
    );
  }

  delete(): void {
    const id = this.todoId;
    const m = this.model();
    if (id == null || m == null) {
      return;
    }
    if (!confirm(`“${m.title}” definitief verwijderen?`)) {
      return;
    }
    this.api.deletePostIt(id).subscribe({
      next: () => {
        this.userContext.triggerRefresh();
        this.navigateAfterLeave();
      },
      error: () => this.snack.open('Verwijderen mislukt', 'OK', { duration: 4000 }),
    });
  }

  toggleArchived(next: boolean): void {
    const id = this.todoId;
    if (id == null) {
      return;
    }
    this.api.patchArchive(id, next).subscribe({
      next: (updated) => {
        this.model.set(updated);
        this.form.patchValue({ archived: updated.archived });
        this.userContext.triggerRefresh();
        this.snack.open(next ? 'Gearchiveerd' : 'Terug uit archief', 'OK', { duration: 2500 });
      },
      error: () => this.snack.open('Actie mislukt', 'OK', { duration: 3000 }),
    });
  }
}
