import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Dashboard } from './dashboard';
import { ADMIN_NAV } from '../../layout/admin-shell/admin-nav';
import { Brand } from '../../shared/ui/brand/brand';

describe('Dashboard usability', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ imports: [Dashboard, Brand], providers: [provideRouter([])] }),
  );
  it('combines order search and type filters, then clears an empty result', () => {
    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const search = root.querySelector('input[type="search"]') as HTMLInputElement;
    search.value = 'alex';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(root.querySelectorAll('tbody tr')).toHaveLength(1);
    expect(root.querySelector('tbody')?.textContent).toContain('IW-1048');
    fixture.componentInstance.filter.set('Buy');
    fixture.detectChanges();
    expect(root.querySelector('tbody')?.textContent).toContain('No orders match');
    (root.querySelector('.empty-orders button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(root.querySelectorAll('tbody tr')).toHaveLength(4);
  });
  it('removes shop navigation and shop quick actions', () => {
    expect(JSON.stringify(ADMIN_NAV)).not.toContain('/shop/');
    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('a[href^="/shop/"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('a[href="/apple-laptops/add"]')).toBeTruthy();
  });
  it('uses the new supplied logo in compact dashboard branding', () => {
    const fixture = TestBed.createComponent(Brand);
    fixture.componentRef.setInput('compact', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toBe(
      '/branding/innofinity-short-logo.jpg',
    );
  });
});
