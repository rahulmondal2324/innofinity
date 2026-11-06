import { inject, Injectable, InjectionToken, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { defer, map, Observable, of, throwError } from 'rxjs';
import { API_CONFIG, apiUrl } from '../../core/config/api.config';
import {
  CategoryDraft,
  FaqDraft,
  FaqWorkspace,
  parseWorkspace,
  ReorderRequest,
} from './faq.models';
export interface FaqRepository {
  load(): Observable<FaqWorkspace>;
  addFaq(draft: FaqDraft): Observable<FaqWorkspace>;
  addCategory(draft: CategoryDraft): Observable<FaqWorkspace>;
  reorder(request: ReorderRequest): Observable<FaqWorkspace>;
}
@Injectable({ providedIn: 'root' })
export class PreviewFaqRepository implements FaqRepository {
  private state: FaqWorkspace = {
    revision: 1,
    categories: [
      { id: 'cat-account', name: 'Account Related Queries', status: 'ACTIVE' },
      { id: 'cat-selling', name: 'Selling Related Queries', status: 'ACTIVE' },
      { id: 'cat-activation', name: 'Activation & Deactivation Related Queries', status: 'ACTIVE' },
      { id: 'cat-payment', name: 'Payment Related Queries', status: 'ACTIVE' },
    ],
    faqs: [
      {
        id: 'faq-1',
        categoryId: 'cat-selling',
        question: 'How do I sell my device?',
        answerHtml:
          '<p>Select your device model, tell us about its condition and follow the trade-in steps.</p>',
        status: 'ACTIVE',
      },
      {
        id: 'faq-2',
        categoryId: 'cat-account',
        question: 'How do I manage my account?',
        answerHtml: '<p>Sign in to your customer account to review your details.</p>',
        status: 'ACTIVE',
      },
      {
        id: 'faq-3',
        categoryId: 'cat-payment',
        question: 'When will I receive my payment?',
        answerHtml: '<p>Payment guidance will be confirmed by the Innofinity team.</p>',
        status: 'INACTIVE',
      },
    ],
  };
  private result(change?: () => void): Observable<FaqWorkspace> {
    return defer(() => {
      if (!isDevMode())
        return throwError(() => new Error('FAQ preview is available only in development.'));
      change?.();
      return of(structuredClone(this.state));
    });
  }
  load() {
    return this.result();
  }
  addFaq(draft: FaqDraft) {
    return this.result(() => {
      if (
        !draft.question.trim() ||
        !draft.answerHtml.trim() ||
        !this.state.categories.some((c) => c.id === draft.categoryId && c.status === 'ACTIVE')
      )
        throw new Error('Choose an active category and complete all fields.');
      this.state.faqs.push({ ...draft, question: draft.question.trim(), id: crypto.randomUUID() });
      this.state.revision++;
    });
  }
  addCategory(draft: CategoryDraft) {
    return this.result(() => {
      const name = draft.name.trim();
      if (!name || this.state.categories.some((c) => c.name.toLowerCase() === name.toLowerCase()))
        throw new Error('A category with this name already exists or the name is empty.');
      this.state.categories.push({ ...draft, name, id: crypto.randomUUID() });
      this.state.revision++;
    });
  }
  reorder(request: ReorderRequest) {
    return this.result(() => {
      if (request.expectedRevision !== this.state.revision)
        throw new Error('The FAQ list has changed. Reload before sorting again.');
      if (
        request.orderedIds.length !== this.state.faqs.length ||
        new Set(request.orderedIds).size !== request.orderedIds.length ||
        request.orderedIds.some((id) => !this.state.faqs.some((f) => f.id === id))
      )
        throw new Error('The order must contain every FAQ exactly once.');
      this.state.faqs = request.orderedIds.map((id) => this.state.faqs.find((f) => f.id === id)!);
      this.state.revision++;
    });
  }
}
@Injectable({ providedIn: 'root' })
export class HttpFaqRepository implements FaqRepository {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);
  load() {
    return this.http
      .get<unknown>(apiUrl(this.config, '/admin/faq-workspace'))
      .pipe(map(parseWorkspace));
  }
  addFaq(draft: FaqDraft) {
    return this.http
      .post<unknown>(apiUrl(this.config, '/admin/faqs'), draft)
      .pipe(map(parseWorkspace));
  }
  addCategory(draft: CategoryDraft) {
    return this.http
      .post<unknown>(apiUrl(this.config, '/admin/faq-categories'), draft)
      .pipe(map(parseWorkspace));
  }
  reorder(request: ReorderRequest) {
    return this.http
      .put<unknown>(apiUrl(this.config, '/admin/faqs/order'), request)
      .pipe(map(parseWorkspace));
  }
}
export const FAQ_REPOSITORY = new InjectionToken<FaqRepository>('FAQ_REPOSITORY', {
  providedIn: 'root',
  factory: () =>
    inject(API_CONFIG).enabled ? inject(HttpFaqRepository) : inject(PreviewFaqRepository),
});
