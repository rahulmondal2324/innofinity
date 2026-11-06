# Dashboard preview and Angular learning notes

Run `npm start`, then open http://localhost:4200/dashboard. The root URL redirects to the dashboard too.

The workspace guard permits anonymous access only when Angular is in development mode and API_CONFIG.enabled is false. It creates no session and no token. Production builds continue to use adminGuard. The login screen remains at /auth/login.

The sidebar is defined as typed data in src/app/layout/admin-shell/admin-nav.ts. It preserves the active legacy menu hierarchy, including Attribute (the legacy storage route), Apple Laptops and Buy/Sell orders. Commented-out Gallery, Newsletter and standalone Shop Order are excluded. Native details/summary controls provide keyboard-operable nested menus. Mobile navigation uses an overlay and closes after choosing a link.

The dashboard uses local illustrative data, identified on the page. Period buttons update the metrics and chart; order tabs filter sample orders. Sidebar destinations lead to clear module placeholders: these are navigation scaffolding, not implemented management forms or connected order screens. No write actions or API calls are simulated.

Interview talking points:

- Standalone components declare their own template dependencies. Route-level loadComponent keeps page code lazy.
- Signals hold the selected period, order filter and mobile navigation state. computed derives visible orders and metrics without maintaining a second mutable copy.
- OnPush keeps rendering predictable. Template signal reads notify Angular when relevant state changes.
- Typed navigation data separates the menu structure from rendering. The recursive template renders arbitrary submenu depth.
- The guard returns a redirect UrlTree rather than triggering a separate navigation. Development preview and real authentication remain separate decisions.
- CSS Grid handles dashboard layout; media queries collapse cards and navigation for narrower screens. Overflow stays inside the orders table.

Verification: 27 unit/integration tests passed, including direct dashboard preview, no session creation, nested destination navigation and login enforcement when API configuration is enabled. Production build passes; current warning budgets are exceeded by approximately 3.35 kB for the initial bundle and 3.01 kB for dashboard styles. Browser visual verification is still pending because the available Windows browser automation previously stopped on URL-policy detection.


## Dashboard design revision

The dashboard now uses the supplied innofinity-short-logo.jpg through the shared Brand component's compact input. Login branding keeps its original image. The welcome section is a separate OnPush component with its own TS/HTML/CSS. A navy welcome panel, branded device illustration, warm next-action card, clearer navigation states and revised cards establish the new visual direction.

Shop Management and all shop quick links have been removed. Buy Order remains under Order List. The order search combines with the type filter and offers a clear-filters action for empty results. Escape dismisses mobile navigation. Dashboard data remains illustrative; anonymous preview remains limited to development with the API disabled.
