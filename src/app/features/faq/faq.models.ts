export type FaqStatus = 'ACTIVE' | 'INACTIVE';
export interface FaqCategory {
  id: string;
  name: string;
  status: FaqStatus;
}
export interface Faq {
  id: string;
  categoryId: string;
  question: string;
  answerHtml: string;
  status: FaqStatus;
}
export interface FaqDraft {
  categoryId: string;
  question: string;
  answerHtml: string;
  status: FaqStatus;
}
export interface CategoryDraft {
  name: string;
  status: FaqStatus;
}
export interface FaqWorkspace {
  revision: number;
  categories: FaqCategory[];
  faqs: Faq[];
}
export interface ReorderRequest {
  expectedRevision: number;
  orderedIds: string[];
}
export const answerText = (html: string): string =>
  new DOMParser().parseFromString(html, 'text/html').body.textContent?.trim() || '';
export function parseWorkspace(value: unknown): FaqWorkspace {
  const d = (value as { data?: FaqWorkspace })?.data;
  const status = (v: unknown) => v === 'ACTIVE' || v === 'INACTIVE';
  if (
    !d ||
    !Number.isSafeInteger(d.revision) ||
    d.revision < 0 ||
    !Array.isArray(d.categories) ||
    !Array.isArray(d.faqs) ||
    d.categories.some(
      (c) => !c || typeof c.id !== 'string' || typeof c.name !== 'string' || !status(c.status),
    ) ||
    d.faqs.some(
      (f) =>
        !f ||
        typeof f.id !== 'string' ||
        typeof f.categoryId !== 'string' ||
        typeof f.question !== 'string' ||
        typeof f.answerHtml !== 'string' ||
        !status(f.status),
    ) ||
    new Set(d.categories.map((c) => c.id)).size !== d.categories.length ||
    new Set(d.faqs.map((f) => f.id)).size !== d.faqs.length ||
    d.faqs.some((f) => !d.categories.some((c) => c.id === f.categoryId))
  ) {
    throw new Error('The FAQ service returned invalid data. Please contact support.');
  }
  return d;
}
