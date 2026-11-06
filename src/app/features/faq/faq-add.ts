import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FaqPageState } from './faq-page.state';
import { AnswerEditor } from './answer-editor';
import { answerText, FaqStatus } from './faq.models';
@Component({
  selector: 'iw-admin-faq-add',
  imports: [ReactiveFormsModule, RouterLink, AnswerEditor],
  providers: [FaqPageState],
  templateUrl: './faq-add.html',
  styleUrl: './faq.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqAdd {
  readonly state = inject(FaqPageState);
  private readonly router = inject(Router);
  readonly form = inject(FormBuilder).nonNullable.group({
    categoryId: ['', Validators.required],
    question: [
      '',
      [
        Validators.required,
        Validators.maxLength(500),
        (c) => (c.value.trim() ? null : { blank: true }),
      ],
    ],
    answerHtml: [
      '',
      [
        Validators.required,
        Validators.maxLength(30000),
        (c) => (answerText(c.value) ? null : { blank: true }),
      ],
    ],
    status: ['ACTIVE' as FaqStatus, Validators.required],
  });
  readonly categories = computed(() =>
    this.state.data().categories.filter((c) => c.status === 'ACTIVE'),
  );
  constructor() {
    this.state.load();
  }
  hasPendingChanges() {
    return this.form.dirty;
  }
  submit() {
    if (this.state.busy() || !this.state.loaded()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      document
        .getElementById(
          this.form.controls.categoryId.invalid
            ? 'category'
            : this.form.controls.question.invalid
              ? 'question'
              : 'faq-answer',
        )
        ?.focus();
      return;
    }
    const draft = this.form.getRawValue();
    draft.question = draft.question.trim();
    this.state.run(this.state.repository.addFaq(draft), 'FAQ added to the workspace.', () => {
      this.form.markAsPristine();
      void this.router.navigateByUrl('/faq/list');
    });
  }
}
