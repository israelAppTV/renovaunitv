# Production safety check

Use this checklist before releasing features.

## Checklist

1. **Data exposure**
   - No sensitive data (codes, tokens, PII) in client components or API responses.
   - Only necessary fields selected from DB; no over-fetching.

2. **Authentication & authorization**
   - Routes and data respect RLS and auth state.
   - Admin-only data not exposed to normal users.

3. **Input validation**
   - searchParams and user input validated/sanitized (e.g. page number, categoryId).
   - Pagination limits enforced to avoid abuse.

4. **Errors**
   - No stack traces or internal errors exposed to the user.
   - Generic user-facing messages; log details server-side only.

5. **Performance**
   - No N+1 queries; batch when possible.
   - Pagination and limits applied.

6. **Stock / codes**
   - Catalog does not expose digital codes or reserve logic in client.
