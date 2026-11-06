import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { RouterTestingHarness } from '@angular/router/testing';
import { API_CONFIG } from '../config/api.config';
import { routes } from '../../app.routes';
import { SessionStore } from './session.store';

describe('Development dashboard preview', () => {
  it('opens the dashboard without creating an authenticated session', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes), provideHttpClient()] });
    const harness = await RouterTestingHarness.create('/dashboard');
    expect(harness.routeNativeElement?.textContent).toContain('Recent orders');
    expect(TestBed.inject(SessionStore).accessToken()).toBeNull();
    expect(TestBed.inject(SessionStore).authenticated()).toBe(false);
  });
  it('requires login when the API is enabled', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        {
          provide: API_CONFIG,
          useValue: {
            baseUrl: '/api',
            loginPath: '/admin/auth/login',
            enabled: true,
            adminRoles: ['ADMIN'],
          },
        },
      ],
    });
    await RouterTestingHarness.create('/dashboard');
    expect(TestBed.inject(Router).url).toBe('/auth/login');
  });
  it('opens nested sidebar destinations with an honest module placeholder', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes), provideHttpClient()] });
    const harness = await RouterTestingHarness.create('/sell/storage/setting');
    expect(harness.routeNativeElement?.textContent).toContain('Setting');
    expect(harness.routeNativeElement?.textContent).toContain('API are confirmed');
  });
});
