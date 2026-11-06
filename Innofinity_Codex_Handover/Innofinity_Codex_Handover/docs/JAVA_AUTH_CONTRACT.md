# Java developer handover - login integration

## Confirm before enabling the Angular connection

Current endpoint values are placeholders: API base `/api`, POST `/admin/auth/login`. No endpoint was supplied, so do not assume these are existing Java routes.

Proposed request:

```json
{ "email": "admin@example.test", "password": "entered-password" }
```

Confirm whether Java expects `email`, `username`, or another identifier. Angular currently expects this successful envelope based on the user's supplied `data` example:

```json
{
  "data": {
    "jwtToken": "fresh-signed-access-token",
    "id": 1,
    "email": "admin@example.test",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN",
    "twoFactorEnabled": false
  }
}
```

Other fields may exist but are not retained. Refresh tokens returned in JSON are deliberately ignored by this initial Angular implementation.

## Decisions required

| Topic               | Required agreement                                                                              |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| Endpoint            | Exact base URL, path, request names and success envelope                                        |
| Admin roles         | Exact backend enum; currently provisional ADMIN / SUPER_ADMIN; INSTRUCTOR rejected              |
| Errors              | HTTP statuses and safe public error codes; avoid HTTP 200 for failed login                      |
| Validation          | Field-level validation error shape for later module forms                                       |
| Tokens              | Signed JWT, issuer/audience, short access lifetime and backend verification                     |
| Refresh             | HttpOnly Secure refresh cookie, rotation, revocation, endpoint and lifetime                     |
| Session restoration | Refresh/bootstrap endpoint or authenticated session endpoint                                    |
| MFA                 | Challenge response, verification endpoint, expiry and recovery flow; boolean alone insufficient |
| Logout              | Server revocation endpoint and cookie clearing; Angular currently signs out locally only        |
| Deployment          | HTTPS, reverse proxy or CORS allowlist, credential/cookie policy and CSRF protection            |
| Abuse controls      | Login rate limits, generic credential failures and security audit events                        |
| Password recovery   | Forgot/reset endpoints and token lifecycle before enabling recovery UI                          |

## Connecting the first API

1. Edit `src/app/core/config/api.config.ts`: set baseUrl, loginPath and confirmed adminRoles.
2. Adjust LoginRequest/AuthApiService if the request field names differ.
3. Use a same-origin `/api` reverse proxy in production when possible. For local development, configure an Angular proxy or the Java CORS allowlist for the exact frontend origin. Do not disable browser security or use wildcard credentialed CORS.
4. Set `enabled: true` only after the endpoint and response are confirmed.
5. Test with a fresh ADMIN account. Do not paste the earlier INSTRUCTOR tokens into the source.
6. Finish MFA, refresh, session restoration and server logout before calling authentication production-ready.
