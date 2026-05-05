import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { UserContext } from '../../services/user-context';
import { PostItApi } from '../../services/post-it-api';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  protected readonly userContext = inject(UserContext);
  private readonly api = inject(PostItApi);

  protected readonly openCount = signal(0);

  protected readonly users = this.userContext.users;

  constructor() {
    effect((onCleanup) => {
      const id = this.userContext.selectedUserId();
      this.userContext.refreshTick();
      if (id == null) {
        this.openCount.set(0);
        return;
      }
      const sub = this.api.getOpenCount(id).subscribe({
        next: (r) => this.openCount.set(r.openCount),
        error: () => this.openCount.set(0),
      });
      onCleanup(() => sub.unsubscribe());
    });
  }

  onUserChange(id: number): void {
    this.userContext.setSelectedUserId(id);
  }
}
