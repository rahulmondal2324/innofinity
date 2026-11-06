# Innofinity Worldwide - project context

## Business brief and responsibility

The client is in the United Kingdom and operates an existing business website built with CodeIgniter 3. The user described the site as live since around 2020. Existing site reference: https://www.innofinityworldwide.co.uk/ . This handover does not claim to have audited its current live implementation.

The client wants migration to Angular, a Java backend and PostgreSQL. A separate Java developer handles the backend. The user's contribution is the complete Angular frontend: admin panel now, public website/customer area later. Preserve business functionality; plan existing data, uploads, URLs, redirects and SEO during migration.

The user strongly prioritizes security, modularity and a professional UI. They also want implementation explanations suitable for Angular interview preparation. Absolute 'non-hackable' guarantees were explicitly ruled out; frontend controls cannot replace backend enforcement.

## Authoritative project locations

Parent: `C:\Users\Admin\Documents\GitHub\innofinity`

| Folder | Purpose / current decision |
| --- | --- |
| innofinity-admin | Separate Angular admin application; active target |
| innofinity-frontend | Earlier empty Angular workspace retained for the public/user application later |

The initial suggestion was a multi-application workspace. The user explicitly changed the plan to two separate sibling projects. Do not revert this decision. Admin source paths are `innofinity-admin/src/...`, not `projects/innofinity-admin/src/...`.

The previous ChatGPT session could read the actual admin project but could write only to its separate temporary workspace. It therefore generated a staged source update and delivered a ZIP. It did NOT apply those files to the user's GitHub project. Inspect the real project to determine whether the user has since copied any of them manually.

## Confirmed environment from project output and inspected package files

| Tool | Version at handover |
| --- | --- |
| Angular framework | 22.2.4 |
| Angular CLI / build | 22.2.5 |
| Node.js | 24.20.0 |
| npm | 11.19.0 |
| TypeScript | 6.0.3 |
| RxJS | 7.8.2 |
| Vitest | 5.1.0 |
| Bootstrap | 5.3.8 |
| Bootstrap Icons | 1.13.2 |

OS: Windows x64; terminal: PowerShell. Versions above describe observed installed state, not a permanent claim about the latest releases. The user agreed to continue with npm 11.19.0; no npm upgrade is needed for this task.

The admin was generated using Angular CLI 22 with routing, standalone components, CSS, SSR disabled, npm and prefix `iw-admin`. Bootstrap and icons were installed. Current observed scripts: start/ng serve, build/ng build, test/ng test. No new dependencies were added for the login package.

## Admin scope derived from the supplied CI3 sidebar

Only menu existence is verified. Field-level behaviour, settings, pricing and order transitions need review of existing screens/source.

| Section | Existing submenus / scope |
| --- | --- |
| Dashboard | Business overview; exact metrics unconfirmed |
| Slider | List, Add New, Setting |
| Page | Page List, Add Page |
| FAQ | List, Add New, Setting |
| Testimonial | List, Add New, Setting |
| Network | List, Add New, Setting; confirm device/pricing relationships |
| Sell Management / Device | List, Add New, Setting |
| Sell Management / Attribute | List, Add New, Setting; legacy route uses storage; broader attributes unconfirmed |
| Sell Management / Model | List, Add New, Setting; confirm valuation/condition rules |
| Apple Laptops | Separate list and Add New; confirm links to sell/shop journeys |
| Shop Management / Device | List, Add New, Setting |
| Shop Management / Model | List, Add New, Setting |
| Shop Management / Product | List, Add New, Setting; confirm variants, images, pricing and stock |
| Popular Selling Models | List, Add New, Setting |
| Order List | Sell Order and Buy Order |
| User List | Registered customers |
| Enquiry | Contact submissions |
| Settings | Global settings; exact fields unconfirmed |
| Admin account controls | Change Password and Logout; login required separately |

Gallery, Newsletter and the standalone Shop Order link were commented out in the supplied sidebar. They are not automatically in scope. Buy Order remains in scope under Order List. The spelling 'Propular' in the old menu should be corrected in the new UI.

Shared backend needs: authenticated/authorized admin APIs, server validation, pagination/search/sort, uploads, consistent error contracts, preserved data relationships, backend-controlled pricing and order transitions, historical order preservation and migration planning. The PDF in this handover provides a concise scope brief.

## Latest requested implementation

The user supplied the Innofinity logo and asked for a modern professional login maintaining proper project structure, separate services, routing, guards, interceptors and components. All API failures should appear through modern toast notifications; normal form validation should remain clear and inline. They requested explanations and Angular interview learning throughout.

Visual direction in the prepared package: navy and turquoise derived from the logo, branded desktop panel, decorative workspace illustration, light sign-in panel, compact mobile presentation, reusable brand component. Component CSS remains separate. No external font request is needed; it uses a system font stack. A final visual QA pass is still outstanding.

## Supplied Java response example

The developer supplied an example of the object expected under a top-level `data` key. It included:

`jwtToken`, `refreshToken`, `id`, `email`, `firstName`, `lastName`, `mobileNumber`, `role`, `gender`, `dateOfBirth`, `postCode`, `address`, `message`, `lastSignInTime`, `twoFactorEnabled`, `transmission`.

The example role was INSTRUCTOR. This is an illustrative payload, not evidence that an instructor should enter the admin panel. Real token strings and personal sample values are intentionally omitted from this handover. Never reuse them.

No actual login URL, request field contract, refresh endpoint, logout/revocation endpoint, error envelope or MFA challenge flow has been supplied. The prepared package assumes a success envelope `{ data: ... }`, provisional role allowlist ADMIN / SUPER_ADMIN and placeholder endpoint `/api/admin/auth/login`. All must be confirmed with Java.

## Prepared source architecture

Source ZIP: `deliverables/Innofinity_Admin_Login_Source.zip` (root folder inside: innofinity-admin-login).

| Area | Files / responsibility |
| --- | --- |
| core/config | Injectable API config, enabled=false default, URL-boundary matching |
| core/auth | DTOs/runtime parser, AuthApiService, AuthService, SessionStore, functional guards |
| core/http | Bearer-header interceptor, API-error interceptor, safe status messages |
| core/notifications | ToastService with signal state, bounded queue and duplicate suppression |
| shared/ui | Brand, toast host, auth brand panel, workspace illustration |
| features/auth/pages/login | Typed Reactive Form, Signals for state, OnPush, separate TS/HTML/CSS |
| layout/admin-shell | Protected header and nested router outlet |
| features/dashboard | Minimal protected integration destination, not full dashboard |
| app.config / app.routes | HttpClient/interceptor registration, lazy routes and guards |

Modern features: standalone components, inject(), Signals, computed(), readonly signals, OnPush, @if/@for, functional guards/interceptors, lazy loadComponent(), finalize() and takeUntilDestroyed(). Reactive Forms was intentionally chosen; no unnecessary effect() or new forms API was forced into the task.

## Implemented security posture and limits

- API defaults disabled. Valid-looking input produces a configuration toast, sends no password and grants no session. No fake production login or hard-coded password.
- Access token stored in memory; no token/password persistence in localStorage/sessionStorage. Refresh loses the session by design for this first increment.
- Refresh token from JSON is ignored, not retained. Minimal user fields only are kept.
- Runtime response parser validates the data shape. Session establishment rejects non-admin roles, invalid/expired expiry and MFA-enabled accounts without a challenge flow.
- JWT decoding is for expiry UX only; it does not validate signature or grant backend authority.
- Bearer tokens are attached only to the configured API origin and path boundary; login skips bearer auth.
- Protected API 401 clears the local session and redirects. Error interceptor displays safe messages and rethrows failures. Raw server errors are not shown.
- Local sign-out clears memory only. Server token revocation, multi-tab termination, persistent restoration, real MFA and password recovery are not complete.
- Production still needs backend authorization/validation, HTTPS, appropriate CSP/HSTS/cache controls, rate limiting, audit logging, secure uploads and an agreed cookie/CSRF strategy.
- Angular noindex metadata is not access control.

## Existing assets and handover limitations

The original logo was uploaded in ChatGPT as `innofinitylogo.png` (128 x 126). The previous session could view the attachment but could not download its original bytes into the staged project. The source package references `/branding/innofinitylogo.png` and includes an iw fallback. Ask for/use the user's original local file; do not silently claim it is included.

The source archive includes source files, public icon font assets/licence, tsconfig.json and two guides. It excludes node_modules, package files and real tokens. Apply it as a source update, not as a complete fresh-install repository.

## Verification already performed

In the staged copy: production build passed without budget warnings, initial bundle approximately 492.61 kB against the existing 500 kB warning budget. Twenty-four Vitest checks passed across three test files, covering DTO parsing, roles, MFA boundary, expiry, guard redirects, token-header scoping, safe error toasts and form behaviour.

The source was formatted with the installed Prettier before the final ZIP was saved. A real-browser visual review did not complete: local browser network access was denied and alternate browser tooling was unavailable. Java API integration was not tested because there was no endpoint. Do not conflate build/unit-test success with completed browser or production validation.

## Earlier design context (secondary, not today's implementation scope)

Earlier public-site redesign discussions favoured a clean, modern/futuristic presentation, tasteful animation and real iPhone imagery in a scrolling journey section. A static demo/archive existed, and the preferred demonstration domain was innofinity-demo.jrhosting.in. None of that authorizes changing the live site, deploying a new site or implementing the public application in this admin-login task. Revisit those source files before relying on their current contents.
