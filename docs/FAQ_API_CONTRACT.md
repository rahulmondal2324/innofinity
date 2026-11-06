# FAQ API handover — proposed contract for Java

This is the proposed contract implemented by the Angular HTTP adapter. It needs agreement with the Java developer; no endpoint has been tested against a real server. Current development uses an in-memory preview and sends no requests. Refresh resets preview data. The four sample categories match the supplied PHP screenshots; sample answers are illustrative.

## Screens and fields

- `/faq/add`: category dropdown, question, rich-text answer, Active/Inactive visibility.
- `/faq/list`: full ordered FAQ collection, question search, category/status filters, expandable answers, drag handle, accessible up/down sorting, explicit Save order and Discard.
- `/faq/categories`: category add form and searchable category list on the same screen.
- Slider is removed from navigation. FAQ Setting redirects to FAQ List. FAQ has List, Add New and Categories.
- Creation and listing are implemented. Editing, deletion, category reordering, media uploads and the public customer FAQ are outside this increment.

## Conventions

Base URL: `/api`. JSON uses camelCase. IDs are opaque strings (serialize Java numeric IDs as strings if necessary). Status is exactly `ACTIVE` or `INACTIVE`. Every success below returns the same canonical workspace snapshot, under `data`. FAQ array order is the display order; do not sort it by question or ID. New FAQs append to the end. The collection revision is a nonnegative integer and increments on every committed FAQ/category creation or reorder.

The first implementation loads the entire FAQ workspace, with no pagination. It must contain all records, including inactive ones, because sorting saves the complete sequence. A future paginated implementation will need a separate full ordering resource; do not silently return one page here.

| Method | Endpoint | Purpose | Success |
| --- | --- | --- | --- |
| GET | `/api/admin/faq-workspace` | Categories + complete ordered FAQs + revision | 200 |
| POST | `/api/admin/faq-categories` | Create category | 201 |
| POST | `/api/admin/faqs` | Create FAQ | 201 |
| PUT | `/api/admin/faqs/order` | Atomically replace display order | 200 |

## Add category payload

```json
{
  "name": "Delivery & returns",
  "status": "ACTIVE"
}
```

`name`: required, trim surrounding whitespace, 1–100 characters. Reject duplicate names case-insensitively after trimming (including inactive categories). `status`: required enum. The server assigns `id`. Active categories become available in the FAQ dropdown immediately. Inactive categories remain in the administration list but cannot be selected for a new FAQ.

## Add FAQ payload

```json
{
  "categoryId": "cat-selling",
  "question": "How do I sell my device?",
  "answerHtml": "<p>Select your device and tell us about its condition.</p><ul><li>Choose your model.</li><li>Review your quote.</li></ul>",
  "status": "ACTIVE"
}
```

- `categoryId`: required existing ACTIVE category ID. Validate the foreign key on Java.
- `question`: required, trim, 1–500 characters; whitespace-only values invalid.
- `answerHtml`: required, up to 30,000 characters; must contain meaningful text after HTML removal. The basic editor supports paragraphs/line breaks, bold, italic and lists. Pasting uses plain text. Java must sanitize HTML with an explicit tag/attribute allowlist, e.g. `p`, `br`, `div`, `strong`, `b`, `em`, `i`, `ul`, `ol`, `li`; no event attributes, scripts, embeds or styles. Return canonical sanitized HTML. Angular also sanitizes before form submission and at display; it does not bypass sanitization.
- `status`: required enum. Backend/public APIs must exclude inactive FAQs and FAQs in inactive categories from customer visibility.
- Do not accept `id`, author, role, timestamps or sort position as client authority. Java generates IDs and appends the record transactionally.

## Success envelope (all four endpoints)

```json
{
  "data": {
    "revision": 12,
    "categories": [
      {
        "id": "cat-selling",
        "name": "Selling Related Queries",
        "status": "ACTIVE"
      }
    ],
    "faqs": [
      {
        "id": "faq-101",
        "categoryId": "cat-selling",
        "question": "How do I sell my device?",
        "answerHtml": "<p>Select your device and tell us about its condition.</p>",
        "status": "ACTIVE"
      },
      {
        "id": "faq-102",
        "categoryId": "cat-selling",
        "question": "How should I package my device?",
        "answerHtml": "<p>Packaging instructions will be provided with your order.</p>",
        "status": "INACTIVE"
      }
    ]
  }
}
```

The response must include the whole current collection, not only the created record. Categories must be unique by ID; FAQs must be unique by ID and reference existing categories. The adapter performs runtime shape/relationship checks. Database schema may keep timestamps/audit fields internally without including them in this DTO.

## Save drag-and-drop order payload

```json
{
  "expectedRevision": 12,
  "orderedIds": ["faq-102", "faq-101"]
}
```

This is the complete global sequence across categories and statuses. `orderedIds` must contain each existing FAQ ID exactly once, with no duplicates or unknown IDs. First ID appears first. Sorting controls are disabled while search/category/status filters are active to avoid saving a partial sequence. Move buttons support touch and keyboard; screen readers receive position announcements. Order remains local until Save order.

Java should lock/check the collection revision and apply the entire order in one database transaction, then increment the revision and return the canonical workspace. If revision 12 is stale because another administrator created/reordered content, return HTTP 409 and leave the stored order unchanged. The frontend retains the unsaved sequence on failure and offers reload/discard. The user must reload before retrying a stale order. A suitable PostgreSQL representation is an integer `sortOrder` column assigned from array position, plus a collection revision row; indexes/locking strategy are Java implementation details.

## Error contract

Proposed JSON (frontend currently displays safe status-based toasts, not raw server messages):

```json
{
  "error": {
    "code": "FAQ_ORDER_CONFLICT",
    "message": "The FAQ collection changed.",
    "fieldErrors": {},
    "requestId": "server-generated-reference"
  }
}
```

Use 400/422 for malformed/invalid fields or non-active category, 404 for missing resources, 409 for duplicate category or stale/incomplete ordering conflict, 401 for unauthenticated and 403 for insufficient permission. Do not return 200 with an error envelope. No error is converted to apparent success. Field-level server error mapping is a future enhancement; current UI shows client validation inline and HTTP failures centrally through the existing toast interceptor.

## Connecting later, including authentication

`src/app/features/faq/faq.repository.ts` defines the repository interface, in-memory development adapter and real HttpClient adapter. `FAQ_REPOSITORY` selects HTTP when the shared `API_CONFIG.enabled` is true. Keep it false until Java/auth integration is ready. HTTP uses the existing API URL helper and global interceptors; do not add bearer logic to page components.

Current auth boundaries remain intact: development preview opens these child routes with no session; production requires the existing admin guard. Setting API enabled also turns off anonymous preview. The FAQ feature does not invent credentials or persist tokens. Add agreed Java authentication/session handling centrally, and enforce admin authorization on every FAQ endpoint on Java. Client guards cannot replace server authorization. Agree roles, token/cookie strategy, CORS and any CSRF requirements with the auth contract before connecting. This feature does not claim production authentication or complete security.

Preview data lives only in a root-scoped service for the current tab runtime; no localStorage is used. Unsaved form/reorder navigation prompts before leaving. Refresh still resets preview data as stated in the page banners.

## Angular interview explanation

- Each page is standalone and lazy-loaded, with separate TypeScript, HTML and CSS.
- Typed Reactive Forms own validation. A custom ControlValueAccessor integrates the rich answer editor with form value, touched and disabled state.
- Signals hold filters, loading and ordered rows. computed derives visible rows without changing canonical order.
- The repository interface separates data transport from UI; switching the injected adapter does not rewrite page templates.
- FaqPageState coordinates requests, successful canonical snapshots, loading state and safe notifications. takeUntilDestroyed cancels page subscriptions on navigation; finalize clears loading.
- Existing HTTP interceptors handle bearer scoping and errors once. The HTTP adapter validates unknown JSON at runtime because TypeScript interfaces alone do not validate network data.
- Native drag events perform pointer sorting; buttons provide keyboard/touch alternatives. A revision prevents silent overwrite of another administrator's order.
