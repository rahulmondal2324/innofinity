import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom, throwError } from 'rxjs';
import { vi } from 'vitest';
import { routes } from '../../app.routes';
import { API_CONFIG } from '../../core/config/api.config';
import { FaqAdd } from './faq-add';
import { FaqCategories } from './faq-categories';
import { FaqList } from './faq-list';
import { HttpFaqRepository, PreviewFaqRepository } from './faq.repository';
import { parseWorkspace } from './faq.models';
import { ADMIN_NAV } from '../../layout/admin-shell/admin-nav';
import { AnswerEditor } from './answer-editor';

describe('FAQ preview workflows', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ providers: [provideRouter(routes), provideHttpClient()] }),
  );
  it('creates a category and uses it in the FAQ dropdown, then adds a rich answer', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/faq/categories');
    const category = harness.fixture.debugElement.query(By.directive(FaqCategories))
      .componentInstance as FaqCategories;
    category.form.setValue({ name: 'Delivery & returns', status: 'ACTIVE' });
    category.submit();
    expect(category.state.data().categories.some((c) => c.name === 'Delivery & returns')).toBe(
      true,
    );
    await harness.navigateByUrl('/faq/add');
    const add = harness.fixture.debugElement.query(By.directive(FaqAdd))
      .componentInstance as FaqAdd;
    const id = add.categories().find((c) => c.name === 'Delivery & returns')!.id;
    add.form.setValue({
      categoryId: id,
      question: '  Where is my device?  ',
      answerHtml: '<p>Check <strong>tracking</strong>.</p>',
      status: 'INACTIVE',
    });
    add.submit();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/faq/list');
    const state = await firstValueFrom(TestBed.inject(PreviewFaqRepository).load());
    expect(state.faqs.at(-1)).toMatchObject({
      categoryId: id,
      question: 'Where is my device?',
      answerHtml: '<p>Check <strong>tracking</strong>.</p>',
      status: 'INACTIVE',
    });
  });
  it('excludes inactive categories from new FAQ creation', async () => {
    const repo = TestBed.inject(PreviewFaqRepository);
    const data = await firstValueFrom(
      repo.addCategory({ name: 'Archived help', status: 'INACTIVE' }),
    );
    const id = data.categories.find((c) => c.name === 'Archived help')!.id;
    const add = TestBed.createComponent(FaqAdd).componentInstance;
    expect(add.categories().some((c) => c.id === id)).toBe(false);
    await expect(
      firstValueFrom(
        repo.addFaq({ categoryId: id, question: 'Q?', answerHtml: '<p>A</p>', status: 'ACTIVE' }),
      ),
    ).rejects.toThrow('active category');
  });
  it('retains unsaved order when the repository fails', () => {
    const page = TestBed.createComponent(FaqList).componentInstance;
    page.move('faq-1', 1);
    vi.spyOn(page.state.repository, 'reorder').mockReturnValue(
      throwError(() => new Error('Please reload.')),
    );
    page.save();
    expect(page.dirty()).toBe(true);
    expect(page.rows()[1].id).toBe('faq-1');
    expect(page.state.busy()).toBe(false);
    expect(page.state.failed()).toBe(true);
  });
  it('rejects blank questions and visually empty answers', () => {
    const fixture = TestBed.createComponent(FaqAdd);
    const page = fixture.componentInstance;
    page.form.setValue({
      categoryId: 'cat-selling',
      question: '   ',
      answerHtml: '<p><br></p>',
      status: 'ACTIVE',
    });
    page.submit();
    expect(page.form.invalid).toBe(true);
    expect(page.form.controls.answerHtml.touched).toBe(true);
  });
  it('rejects duplicate category names after trimming and ignoring case', () => {
    const fixture = TestBed.createComponent(FaqCategories);
    const page = fixture.componentInstance;
    page.form.setValue({ name: '  account related queries  ', status: 'ACTIVE' });
    page.submit();
    expect(page.form.controls.name.hasError('duplicate')).toBe(true);
    expect(page.state.data().categories).toHaveLength(4);
  });
  it('supports keyboard sorting, blocks sorting with filters and saves the complete order', async () => {
    const fixture = TestBed.createComponent(FaqList);
    const page = fixture.componentInstance;
    page.move('faq-1', 1);
    expect(page.rows()[1].id).toBe('faq-1');
    expect(page.dirty()).toBe(true);
    page.search.set('device');
    page.move('faq-1', 1);
    expect(page.rows()[1].id).toBe('faq-1');
    page.clear();
    page.save();
    expect(page.dirty()).toBe(false);
    const saved = await firstValueFrom(TestBed.inject(PreviewFaqRepository).load());
    expect(saved.faqs.map((f) => f.id)).toEqual(['faq-2', 'faq-1', 'faq-3']);
  });
  it('supports drag sorting and discarding an unsaved order', () => {
    const page = TestBed.createComponent(FaqList).componentInstance;
    page.drag(
      { dataTransfer: { setData: () => {}, effectAllowed: '' } } as unknown as DragEvent,
      'faq-1',
    );
    page.drop({ preventDefault: () => {} } as DragEvent, 'faq-3');
    expect(page.rows().at(-1)?.id).toBe('faq-1');
    expect(page.dragged()).toBeNull();
    page.discard();
    expect(page.rows()[0].id).toBe('faq-1');
    expect(page.dirty()).toBe(false);
  });
  it('removes Slider and FAQ Setting and exposes Categories', () => {
    const nav = ADMIN_NAV.flatMap((s) => s.items);
    expect(nav.some((i) => i.label === 'Slider')).toBe(false);
    expect(nav.find((i) => i.label === 'FAQ')?.children?.map((c) => c.path)).toEqual([
      '/faq/list',
      '/faq/add',
      '/faq/categories',
    ]);
  });
  it('rejects stale revisions and malformed reorder lists without mutating state', async () => {
    const repo = TestBed.inject(PreviewFaqRepository);
    await expect(
      firstValueFrom(
        repo.reorder({ expectedRevision: 0, orderedIds: ['faq-1', 'faq-2', 'faq-3'] }),
      ),
    ).rejects.toThrow('changed');
    await expect(
      firstValueFrom(
        repo.reorder({ expectedRevision: 1, orderedIds: ['faq-1', 'faq-1', 'faq-3'] }),
      ),
    ).rejects.toThrow('exactly once');
    expect((await firstValueFrom(repo.load())).revision).toBe(1);
  });
  it('sanitizes unsafe rich answer markup before passing it to the form', () => {
    const fixture = TestBed.createComponent(AnswerEditor);
    fixture.detectChanges();
    let value = '';
    fixture.componentInstance.registerOnChange((v) => (value = v));
    const editor = document.createElement('div');
    editor.innerHTML = '<p onclick="alert(1)">Answer<script>alert(1)</script></p>';
    fixture.componentInstance.update(editor);
    expect(value).not.toContain('<script');
    expect(value).not.toContain('onclick');
    expect(value).toContain('Answer');
  });
});
describe('FAQ HTTP contract', () => {
  it('posts the agreed draft shape through HttpClient and validates the response', async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const repo = TestBed.inject(HttpFaqRepository);
    const http = TestBed.inject(HttpTestingController);
    const draft = {
      categoryId: 'cat-1',
      question: 'Question?',
      answerHtml: '<p>Answer.</p>',
      status: 'ACTIVE' as const,
    };
    const result = firstValueFrom(repo.addFaq(draft));
    const request = http.expectOne('/api/admin/faqs');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(draft);
    request.flush({
      data: {
        revision: 2,
        categories: [{ id: 'cat-1', name: 'Account', status: 'ACTIVE' }],
        faqs: [{ ...draft, id: 'faq-1' }],
      },
    });
    expect((await result).faqs[0].id).toBe('faq-1');
    http.verify();
  });
  it('rejects malformed or orphaned records from Java', () => {
    expect(() =>
      parseWorkspace({
        data: {
          revision: 1,
          categories: [],
          faqs: [
            { id: 'x', categoryId: 'unknown', question: 'Q', answerHtml: 'A', status: 'ACTIVE' },
          ],
        },
      }),
    ).toThrow('invalid data');
  });
});
