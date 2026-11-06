import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FaqPageState } from './faq-page.state';
import { FaqStatus } from './faq.models';
@Component({
  selector: 'iw-admin-faq-categories',
  imports: [ReactiveFormsModule],
  providers: [FaqPageState],
  templateUrl: './faq-categories.html',
  styleUrl: './faq.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqCategories {
  readonly state = inject(FaqPageState);
  readonly search = signal('');
  readonly form = inject(FormBuilder).nonNullable.group({
    name: [
      '',
      [
        Validators.required,
        Validators.maxLength(100),
        (c) => (c.value.trim() ? null : { blank: true }),
      ],
    ],
    status: ['ACTIVE' as FaqStatus, Validators.required],
  });
  readonly filtered = computed(() =>
    this.state
      .data()
      .categories.filter((c) => c.name.toLowerCase().includes(this.search().toLowerCase().trim())),
  );
  constructor() {
    this.state.load();
  }
  hasPendingChanges() {
    return this.form.dirty;
  }
  count(id: string) {
    return this.state.data().faqs.filter((f) => f.categoryId === id).length;
  }
  submit() {
    if (this.state.busy() || !this.state.loaded()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const draft = this.form.getRawValue();
    draft.name = draft.name.trim();
    if (
      this.state.data().categories.some((c) => c.name.toLowerCase() === draft.name.toLowerCase())
    ) {
      this.form.controls.name.setErrors({ duplicate: true });
      return;
    }
    console.log(this.form.getRawValue());
    this.state.run(
      this.state.repository.addCategory(draft),
      draft.status === 'ACTIVE'
        ? 'Category added. It is now available in the FAQ form.'
        : 'Inactive category added. It stays hidden from the FAQ form.',
      () => this.form.reset({ name: '', status: 'ACTIVE' }),
    );
  }
}
