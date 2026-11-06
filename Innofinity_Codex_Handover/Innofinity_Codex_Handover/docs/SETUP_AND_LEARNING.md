# Innofinity Worldwide - Admin login foundation

Built against your installed Angular 22.2.4 / CLI 22.2.5 project. Bootstrap 5.3.8, Bootstrap Icons 1.13.2, RxJS 7.8.2, TypeScript 6.0.3 and Vitest 5.1.0 are retained. No new npm dependencies are required.

## Apply the source update

1. Stop `ng serve` with Ctrl+C.
2. Extract the downloaded ZIP. The `innofinity-admin-login` folder contains `src`, `public`, `tsconfig.json`, this guide and `JAVA_AUTH_CONTRACT.md`.
3. Back up the current `src` folder and `tsconfig.json`. This package replaces the Angular starter screen and its starter test. Merge carefully if you have added your own work since the starter was inspected.
4. Copy the package's `src` folder into `C:\Users\Admin\Documents\GitHub\innofinity\innofinity-admin`, replacing matching starter files. Merge `public` and replace `tsconfig.json`. Do not replace or delete your existing `public` folder.
5. Save your original supplied logo as `public/branding/innofinitylogo.png`. This is an original-asset copy step: the downloadable source package uses that path but does not contain the original image bytes. Until it is added, the reusable brand component displays an `iw` fallback. Do not enlarge the small original excessively; the component displays it at 58px.
6. Run these commands in your actual admin project folder:

```powershell
cd C:\Users\Admin\Documents\GitHub\innofinity\innofinity-admin
npx ng test --watch=false
npx ng build --configuration=production
npx ng serve --port=4200
```

Open http://localhost:4200/auth/login. Direct navigation to `/dashboard` redirects to login when there is no session. No package reinstall is needed if your existing node_modules is present.

## What works before the backend exists

- Responsive split-screen login, original-logo path plus fallback, inline validation, show/hide password and Caps Lock notice.
- Accessible input labels, keyboard focus, reduced-motion support, browser password-manager autocomplete and submission loading state.
- Global reusable toast stack: success, information and errors; dismissible, capped at four, duplicate messages suppressed.
- Real HTTP integration code, strict response parsing, API-origin-scoped bearer headers and guarded lazy routes.
- API connection defaults to `enabled: false`. A valid-looking form produces an explanatory toast, sends no password and grants no access. There is no hard-coded password, fake production session or Instructor-as-Admin override.
- Forgot-password and Get-help controls explain that recovery is not connected. No recovery email is sent.
- The dashboard is a protected integration destination, not a completed business dashboard.

## File map

| Path under src/app                  | Responsibility                                                                    |
| ----------------------------------- | --------------------------------------------------------------------------------- |
| app.config.ts                       | Registers router, HttpClient, functional interceptors and browser error listeners |
| app.routes.ts                       | Lazy login and admin-shell routes, guards, titles and default redirects           |
| core/config/api.config.ts           | Injectable public API configuration and safe URL-scope matching                   |
| core/auth/auth.models.ts            | Login DTOs, minimal AdminUser model and runtime response validation               |
| core/auth/auth-api.service.ts       | HTTP POST only; no UI, routing or session decisions                               |
| core/auth/auth.service.ts           | Login orchestration, session expiry and local sign-out                            |
| core/auth/session.store.ts          | Memory-only token and readonly signal state                                       |
| core/auth/auth.guards.ts            | Functional route access decisions using UrlTree redirects                         |
| core/http/auth.interceptor.ts       | Adds bearer headers only to the configured API                                    |
| core/http/api-error.interceptor.ts  | Central HTTP failure notifications and protected-request 401 handling             |
| core/http/api-error.ts              | Safe status-to-message mapping without leaking raw server responses               |
| core/notifications/toast.service.ts | Application-wide notification state and dismissal timers                          |
| shared/ui/toast-container           | Renders notifications once at the application root                                |
| shared/ui/brand                     | Original logo and brand lockup reused on desktop, mobile and shell                |
| shared/ui/auth-brand-panel          | Desktop branded login panel                                                       |
| shared/ui/workspace-illustration    | Decorative dashboard illustration; no fake business metrics                       |
| features/auth/pages/login           | Form interactions and template, separated TS / HTML / CSS                         |
| layout/admin-shell                  | Protected application header and nested router outlet                             |
| features/dashboard                  | Minimal protected landing page after a real successful login                      |

Global styles live in `src/styles.css`. Only used Bootstrap Icons selectors are included in `src/styles/bootstrap-icons.css`; the licensed icon font lives in `public/fonts`. Add a selector to the subset when using a new Bootstrap icon. The whole icon font remains available, so the font file itself is not subsetted.

## Request execution flow

1. Router opens `/auth/login`; guestGuard sends an already signed-in admin to `/dashboard`.
2. Reactive Form owns email/password values and validity. Invalid submission marks controls touched and focuses the first invalid field.
3. Login sets the `submitting` signal and calls AuthService. The email is trimmed; the password is never trimmed.
4. If the API is disabled, AuthService emits a safe configuration error. Otherwise AuthApiService posts credentials with a 15-second timeout and SKIP_AUTH context.
5. Interceptors wrap the request. AuthInterceptor omits the bearer token for login. ApiErrorInterceptor catches HTTP failures, shows a safe toast, then rethrows so the caller still sees failure.
6. A successful HTTP response passes through `parseLoginResponse`. TypeScript types alone cannot validate server JSON.
7. SessionStore checks the allowed role, MFA flag and expiry before storing a minimal user object and access token in memory. It drops the refresh token and unrelated personal fields from the sample response.
8. The expiry callback is scheduled; Login clears the password, shows success and navigates to the guarded dashboard.
9. `finalize` resets loading on success, error or cancellation. `takeUntilDestroyed` cancels subscriptions when the component is destroyed.
10. Future API calls receive the bearer token only for the configured origin and path. A protected API 401 clears the local session and redirects to sign-in.

## Security decisions and present limits

- Java must verify JWT signatures, issuer, audience, expiry and roles on every protected API. Decoding a JWT in Angular is only for expiry UX; it does not prove identity or authorization.
- Guards help navigation. Browser code can be changed by its user; a guard cannot protect backend data.
- Tokens and passwords are never written to localStorage or sessionStorage. A browser refresh intentionally loses the current session. In-memory storage reduces persistence but does not make XSS harmless.
- The sample response's INSTRUCTOR role is rejected. ADMIN and SUPER_ADMIN are provisional configured role names; confirm the real backend enum before enabling sign-in.
- MFA-enabled accounts are blocked until the real challenge contract is implemented. A boolean does not define the verification workflow.
- Refresh, durable session restoration and server-side logout/revocation are deliberately not fabricated. Logout currently clears only this tab's memory; other tabs and server-issued tokens are not revoked. Do not treat it as completed production session termination.
- Ask the Java team for an HttpOnly, Secure, appropriately SameSite refresh cookie with rotation/revocation and CSRF protection appropriate to the deployment. That requires a separate agreed browser/backend contract.
- Raw backend messages are not shown because they can expose internal details. Validation errors remain inline; HTTP failures appear as toasts. A 200-response business-error envelope still needs a final backend contract before other modules are integrated.
- HTTPS, CSP, HSTS, cache controls, API rate limiting, MFA, audit logging, secure uploads and backend authorization must be configured before production. `noindex` is indexing guidance, not access control.
- Existing JWTs pasted into the chat are not embedded or reused. Use a fresh test session from the correct application during integration.

## Angular features and interview practice

### Why standalone components?

Each component declares its template dependencies directly in `imports`. This avoids feature NgModules and makes lazy loading and dependency boundaries easier to read. Do not say NgModules are insecure; this is an architecture choice.

### What is dependency injection?

Angular supplies dependencies through its injector. `inject(AuthService)` retrieves the service, while the API_CONFIG InjectionToken supplies typed configuration and can be replaced in tests. A TypeScript interface alone does not exist at runtime and cannot be used as an injection token.

### Why signals and computed?

`signal` owns synchronous reactive state such as loading and visibility. `computed` derives displayName/authenticated from session state without manually synchronizing duplicate values. `asReadonly` prevents consumers from calling set/update on the exposed signal. This is an API boundary, not a security boundary.

### Why RxJS as well as signals?

HttpClient returns Observables for asynchronous work. RxJS operators compose request processing, cancellation and cleanup. Signals represent the UI's current state. Neither is a replacement for every use of the other.

### What does OnPush do here?

It limits unnecessary view checking and works with signals read in templates. Signal updates notify Angular when these views need refreshing, including in zoneless applications. It does not mean the view can never update.

### Why not use effect for login?

Login is an explicit user action and belongs in a method/Observable pipeline. `computed` handles derived state. An effect is unnecessary here; using every new Angular API would add complexity without improving the task.

### Why Reactive Forms rather than the newest forms API?

Reactive Forms provides explicit typed controls, familiar validators and straightforward tests. Using a stable, suitable API is better than changing patterns merely to use a newer feature. Login password validators should not accidentally reject existing passwords by applying new-account password-creation rules.

### Why @if and @for with track?

These are Angular's built-in template control flow. `@if` handles validation/loading; `@for (...; track item.id)` maintains stable identity for toast elements instead of recreating all items unnecessarily.

### Why functional interceptors?

They express middleware as functions with explicit registration order. Outbound requests traverse registration order; responses/errors unwind the chain. Here the outer error interceptor catches downstream errors and rethrows them. Swallowing errors with `of(...)` could accidentally make a failed request look successful.

### Why clone HttpRequest?

Requests are immutable. `request.clone` creates a changed request without mutating the original object. Tokens are scoped by parsed URL origin/path rather than an unsafe string `includes` check.

### Why return UrlTree from a guard?

It declares a redirect as the navigation result. Imperatively calling navigate while returning false can start competing navigations. CanMatch is useful at a lazy route boundary; it also has route-matching semantics different from CanActivate.

### Why validate response JSON if the interface exists?

Types disappear at runtime. A Java API could return null, an HTML error body or unexpected field types. Runtime narrowing prevents assuming the DTO contract was honoured.

### What do finalize and takeUntilDestroyed do?

`finalize` performs loading cleanup after completion, error or unsubscribe. `takeUntilDestroyed` binds subscription lifetime to the component. A common interview mistake is saying finalize runs only on successful responses.

### Authentication versus authorization?

Authentication establishes identity; authorization decides permitted actions. Receiving a valid token does not automatically make someone an admin. Java must enforce this difference independently of the Angular guard.

## Manual verification

1. Open `/dashboard` in a fresh tab: redirected to `/auth/login`.
2. Submit empty fields: inline errors and focus on email; no API call.
3. Enter a malformed email: email validation message.
4. Toggle password visibility and navigate controls with Tab.
5. Submit valid-looking details while enabled=false: one explanatory toast, no request and no dashboard access.
6. Test 390px mobile width: logo/form remain visible and there is no horizontal overflow.
7. Confirm localStorage/sessionStorage contain no tokens.
8. Once the backend is ready, test real ADMIN success, INSTRUCTOR rejection, expired tokens, 401, 403, 429 and server failures. Inspect the Network tab to verify header scoping without sharing captured tokens.

The automated suite uses synthetic test-only JWT payloads and HttpTestingController; they are not credentials accepted by the application. Run `npx ng test --watch=false` after applying the package.

## Validation performed for this delivery

The production build passed under the original 500kB initial-bundle and 4kB component-style warning budgets after trimming unused icon selectors and splitting the branded visual into components. Automated tests cover the response contract, admin-role rejection, MFA boundary, expiry, route redirects, bearer-header scoping, safe HTTP notifications and login form interactions. A real-browser visual pass could not be completed because this environment denied local browser network access. Review desktop and mobile appearance locally after copying the logo. Live Java integration has not been tested because no endpoint exists yet.
