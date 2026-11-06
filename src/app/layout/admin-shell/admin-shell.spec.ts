import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AdminShell } from './admin-shell';
describe('Sidebar compact control', () => {
  it('toggles the compact rail and expands when opening a group', () => {
    TestBed.configureTestingModule({
      imports: [AdminShell],
      providers: [provideRouter([]), provideHttpClient()],
    });
    const fixture = TestBed.createComponent(AdminShell);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const toggle = root.querySelector('.sidebar-toggle') as HTMLButtonElement;
    expect(toggle.getAttribute('aria-label')).toBe('Collapse sidebar');
    toggle.click();
    fixture.detectChanges();
    expect(root.classList.contains('is-compact')).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-label')).toBe('Expand sidebar');
    (root.querySelector('summary') as HTMLElement).click();
    fixture.detectChanges();
    expect(root.classList.contains('is-compact')).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
  });
});
