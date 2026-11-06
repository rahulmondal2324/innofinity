# Immediate next task for Codex

Goal: apply the prepared modular admin login implementation directly in the real innofinity-admin project, integrate the original logo and explain the work to the user.

1. Read this handover and applicable repository instructions. Inspect git status, package versions and existing src/public files. Preserve unrelated user changes; do not reset the repository or overwrite newer custom work blindly.
2. Compare the source ZIP to the actual application. Integrate its src changes and strict tsconfig settings, adapting to existing work. Preserve package.json, package-lock.json, angular.json and installed dependencies unless a concrete issue requires a change.
3. Use the supplied original logo at public/branding/innofinitylogo.png. If not present or attached, implement everything else and request the exact missing asset.
4. Keep the API connection disabled until Java provides the real endpoint/request/envelope/roles. No hard-coded credentials or auth bypass. Do not use the pasted INSTRUCTOR token as an admin session.
5. Review the page at desktop and mobile widths. Verify no horizontal overflow, readable colour contrast, keyboard focus, labels, form validation, visibility toggle, loading state and toast placement.
6. Run `npx ng test --watch=false` and `npx ng build --configuration=production` from the real project. Investigate failures rather than deleting meaningful tests or weakening type checks.
7. Start with `npx ng serve --port=4200` if the user needs a local preview. Do not kill unrelated processes if the port is occupied; choose another port or explain the conflict.
8. Explain changed files and the execution flow. Use docs/SETUP_AND_LEARNING.md for interview discussion, but adapt explanations to the actual final code.

Completion criteria:

- Login UI integrated into the actual project with its original logo.
- Features, services, guards, interceptors, session state and notifications remain modular.
- Anonymous dashboard access redirects to login; disabled API grants no session.
- Role and token handling keep the previously documented boundaries.
- Production build and meaningful tests pass; visual verification is completed or a concrete blocker is reported.
- The user understands what is complete and what depends on Java. Do not describe authentication as production-ready yet.

Next milestone after this task: agree the Java auth contract and integrate real login, session lifecycle and recovery. Full business dashboard/sidebar and management modules follow; they are not already complete merely because their scope is documented.
