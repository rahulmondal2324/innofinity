import { CanDeactivateFn } from '@angular/router';
export const pendingFaqChanges: CanDeactivateFn<{ hasPendingChanges(): boolean }> = (page) =>
  !page.hasPendingChanges() ||
  window.confirm('You have unsaved changes. Leave this page and discard them?');
