import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule, type MatSelectChange } from '@angular/material/select';
import { PostItApi } from '../../services/post-it-api';
import { UserContext } from '../../services/user-context';
import {
  DEFAULT_POST_IT_COLOR,
  POST_IT_COLOR_OPTIONS,
  normalizePostItColorHex,
  samePostItColorHex,
} from '../../constants/post-it-colors';

@Component({
  selector: 'app-create',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatSelectModule,
  ],
  templateUrl: './create.html',
  styleUrl: './create.scss',
})
export class Create {
  protected readonly colorOptions = POST_IT_COLOR_OPTIONS;
  protected readonly compareColorHex = samePostItColorHex;

  private readonly fb = inject(FormBuilder);
  private readonly api = inject(PostItApi);
  private readonly router = inject(Router);
  private readonly userContext = inject(UserContext);
  private readonly snack = inject(MatSnackBar);

  protected readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    description: [''],
    tags: [''],
    deadline: [null as Date | null],
    colorHex: [DEFAULT_POST_IT_COLOR],
  });

  onColorHexChange(event: MatSelectChange<string>): void {
    this.form.patchValue({ colorHex: event.value }, { emitEvent: true });
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    const uid = this.userContext.selectedUserId();
    if (uid == null) {
      this.snack.open('Geen gebruiker geselecteerd', 'OK', { duration: 3000 });
      return;
    }
    const v = this.form.getRawValue();
    const rawColor = this.form.get('colorHex')?.value ?? v.colorHex;
    const deadlineDate = v.deadline
      ? `${v.deadline.getFullYear()}-${String(v.deadline.getMonth() + 1).padStart(2, '0')}-${String(v.deadline.getDate()).padStart(2, '0')}`
      : undefined;

    this.api
      .createPostIt({
        userId: uid,
        title: v.title!.trim(),
        description: v.description?.trim() ?? '',
        tags: v.tags?.trim() ?? '',
        deadlineDate: deadlineDate ?? null,
        positionX: 80 + Math.random() * 40,
        positionY: 80 + Math.random() * 40,
        zIndex: 0,
        colorHex: normalizePostItColorHex(rawColor as string | null | undefined),
      })
      .subscribe({
        next: () => {
          this.userContext.triggerRefresh();
          this.snack.open('Post-it toegevoegd', 'OK', { duration: 2500 });
          void this.router.navigate(['/board']);
        },
        error: () => this.snack.open('Opslaan mislukt', 'OK', { duration: 4000 }),
      });
  }
}
