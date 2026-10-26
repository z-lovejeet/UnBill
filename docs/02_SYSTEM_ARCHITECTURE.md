# System architecture

```text
Browser /scan → bounded JSON API → Gemini structured extraction
                             ↓ Zod validation and reconciliation
                     deterministic review engine
                             ↓
                  AuditReport + selected-item package
                             ↓
       exact-ID results / letter / phone guide / device history
             ↙                    ↘
 optional Groq coach       optional redacted Redis share + revoke
```

Next.js API routes run on Node.js. There is no Edge-only service, separate pipeline page, SQL patient database, authenticated account service or client-only AI processing. AI requests leave the browser through the application server.

Domain ownership: `validation.ts` defines input/report boundaries; `rules-engine.ts` owns findings, per-item non-overlapping amounts and regenerated packages; `reports.ts` handles report normalization/redaction. The store persists history/share-owner controls through `vault-storage.ts`; `use-report.ts` resolves exact local/sample/share IDs after hydration.

Security controls are in `api-utils.ts` and `next.config.ts`: body limits, origin checks, distributed rate limits, daily AI budget, safe errors, no-store responses and browser headers. Public AI calls fail closed without configured Redis protection. Deployment/proxy configuration must preserve the network identity assumption.

Local encryption is AES-256-GCM with a random IV and nonextractable device key in IndexedDB. Same-origin scripts can access opened data. Sharing is explicit remote storage for up to 30 days, with direct identifiers removed and a separate private revocation token. Neither feature establishes regulatory compliance.
