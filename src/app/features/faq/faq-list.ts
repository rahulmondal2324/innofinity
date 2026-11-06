import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaqPageState } from './faq-page.state';
import { Faq } from './faq.models';
@Component({
  selector: 'iw-admin-faq-list',
  imports: [RouterLink],
  providers: [FaqPageState],
  templateUrl: './faq-list.html',
  styleUrl: './faq.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqList {
  readonly state = inject(FaqPageState);
  readonly search = signal('');
  readonly category = signal('');
  readonly status = signal('');
  readonly rows = signal<Faq[]>([]);
  readonly dirty = signal(false);
  readonly dragged = signal<string | null>(null);
  readonly over = signal<string | null>(null);
  readonly announcement = signal('');
  readonly filtering = computed(() => !!(this.search().trim() || this.category() || this.status()));
  readonly filtered = computed(() =>
    this.rows().filter(
      (f) =>
        (!this.category() || f.categoryId === this.category()) &&
        (!this.status() || f.status === this.status()) &&
        f.question.toLowerCase().includes(this.search().trim().toLowerCase()),
    ),
  );
  constructor() {
    this.load();
  }
  hasPendingChanges() {
    return this.dirty();
  }
  categoryName(id: string) {
    return this.state.data().categories.find((c) => c.id === id)?.name || 'Unknown category';
  }
  load() {
    this.state.run(this.state.repository.load(), undefined, () => {
      this.state.loaded.set(true);
      this.rows.set([...this.state.data().faqs]);
      this.dirty.set(false);
    });
  }
  move(id: string, offset: number) {
    const from = this.rows().findIndex((f) => f.id === id);
    this.reorder(from, from + offset);
  }
  private reorder(from: number, to: number) {
    if (
      this.filtering() ||
      this.state.busy() ||
      from < 0 ||
      to < 0 ||
      to >= this.rows().length ||
      from === to
    )
      return;
    const next = [...this.rows()];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    this.rows.set(next);
    this.dirty.set(next.some((f, i) => f.id !== this.state.data().faqs[i]?.id));
    this.announcement.set(`${item.question} moved to position ${to + 1}. Save order to apply.`);
  }
  drag(event: DragEvent, id: string) {
    if (this.filtering() || this.state.busy()) {
      event.preventDefault();
      return;
    }
    this.dragged.set(id);
    event.dataTransfer?.setData('text/plain', id);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }
  drop(event: DragEvent, id: string) {
    event.preventDefault();
    const from = this.rows().findIndex((f) => f.id === this.dragged());
    const to = this.rows().findIndex((f) => f.id === id);
    this.reorder(from, to);
    this.endDrag();
  }
  endDrag() {
    this.dragged.set(null);
    this.over.set(null);
  }
  discard() {
    this.rows.set([...this.state.data().faqs]);
    this.dirty.set(false);
    this.announcement.set('Unsaved order discarded.');
  }
  save() {
    if (!this.dirty() || this.state.busy()) return;
    this.state.run(
      this.state.repository.reorder({
        expectedRevision: this.state.data().revision,
        orderedIds: this.rows().map((f) => f.id),
      }),
      'Display order saved.',
      () => {
        this.rows.set([...this.state.data().faqs]);
        this.dirty.set(false);
      },
    );
  }
  clear() {
    this.search.set('');
    this.category.set('');
    this.status.set('');
  }
}
