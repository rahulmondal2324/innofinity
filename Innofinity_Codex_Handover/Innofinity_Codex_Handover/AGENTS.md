# Innofinity Worldwide continuation guidance

These instructions describe the user's established requirements for this project. Respect current user instructions and any applicable repository instructions. This file resides in a handover folder; it does not automatically replace repository-root instructions.

- Focus on the Angular admin application now. The public/customer application is a separate sibling project for later work.
- Inspect the actual repository before editing. The source ZIP was prepared from a starter snapshot and may be stale relative to later local changes.
- Use Angular 22-compatible standalone components, functional routing/guards/interceptors, typed forms, Signals where useful, RxJS for HTTP, and OnPush where appropriate.
- Keep component TypeScript, HTML and CSS separated. Preserve the established `.css` convention and feature-first structure.
- Keep API transport, authentication orchestration, session state, notifications, UI and layout concerns separate.
- Use Bootstrap 5 and Bootstrap Icons already installed. The prepared implementation includes a small icon-selector stylesheet and the licensed icon font.
- Use the supplied original logo, not a generated replacement. Preserve proportions. Reuse a brand component.
- Provide a professional, modern responsive admin login with inline field validation, keyboard access, password visibility, loading state and reusable modern toasts.
- Centralize API error notifications. Avoid duplicate toasts and raw server-error disclosure. Do not convert failures into apparent successes.
- The backend does not exist yet. Endpoint names and admin role names in the ZIP are provisional. Keep the API disabled until the contract is agreed.
- Never embed the real tokens pasted in the earlier conversation. Do not grant admin access to INSTRUCTOR accounts or treat the sample as an Innofinity production contract.
- Angular guards and decoded claims are not a security boundary. Java must verify tokens and authorize requests.
- Do not put tokens/passwords/private credentials in localStorage, sessionStorage, source or client configuration. The initial implementation uses memory-only access tokens and requires login after refresh.
- MFA, refresh, session restoration and server logout are incomplete until Java supplies the contract. Explain these limits accurately.
- Do not claim the project is non-hackable, production-secure or fully integrated based only on Angular tests.
- Use modern features when they help; do not force effects, experimental APIs or unnecessary dependencies merely to demonstrate novelty.
- Explain changed files, execution flow and relevant interview questions in plain language. The user wants to learn while building.
- Run the production build and meaningful tests. Verify desktop/mobile appearance when browser tooling permits, and report concrete blockers honestly.
- Do not modify/deploy the existing live CI3 website or publish anything without a task authorizing that action.
