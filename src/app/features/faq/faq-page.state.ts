import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Observable } from 'rxjs';
import { ToastService } from '../../core/notifications/toast.service';
import { FAQ_REPOSITORY } from './faq.repository';
import { previewEnabled } from '../../core/auth/preview.guard';
import { FaqWorkspace } from './faq.models';
@Injectable()
export class FaqPageState {
  private readonly destroyRef = inject(DestroyRef);
  readonly preview = previewEnabled();
  readonly repository = inject(FAQ_REPOSITORY);
  readonly toast = inject(ToastService);
  readonly data = signal<FaqWorkspace>({ revision: 0, categories: [], faqs: [] });
  readonly busy = signal(false);
  readonly loaded = signal(false);
  readonly failed = signal(false);
  load() {
    this.run(this.repository.load(), undefined, () => this.loaded.set(true));
  }
  run(request: Observable<FaqWorkspace>, message?: string, done?: () => void) {
    if (this.busy()) return;
    this.busy.set(true);
    this.failed.set(false);
    request
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.busy.set(false)),
      )
      .subscribe({
        next: (data) => {
          this.data.set(data);
          if (message) this.toast.show('success', 'FAQ workspace', message);
          done?.();
        },
        error: (error: unknown) => {
          this.failed.set(true);
          if (!(error instanceof HttpErrorResponse))
            this.toast.show(
              'error',
              'Unable to complete request',
              error instanceof Error ? error.message : 'Please try again.',
            );
        },
      });
  }
}
