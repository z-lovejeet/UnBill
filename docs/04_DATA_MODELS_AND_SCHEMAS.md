# Data models and schemas

The source of truth is `src/types/audit.ts` and executable Zod boundaries in `src/lib/validation.ts`.

- `RawLineItem`: unique ID, reported/unknown code, description, known/blank service date, positive integer quantity, nonnegative line total, optional printed modifiers/provider ID.
- `AuditedLineItem`: raw facts plus catalog translation/category, illustrative reference values, rule notes, selection and severity for review prioritization.
- `FinancialSummary`: reconciled gross, reported insurance adjustments, nullable reported patient responsibility, selected gross-charge review amount and heuristic priority score. Review amount is not an owed balance or guaranteed patient savings.
- `AuditReport`: schema version 2, exact ID, timestamp, source, facility/patient metadata, items/findings, warnings and regenerated package.
- `DisputePackage`: plain-text review letter, conditional linked consumer resources and four phone prompts; no automatic enforcement claim.
- Device persistence: at most 30 reports and share-owner controls in AES-GCM ciphertext; key stored as a nonextractable CryptoKey in IndexedDB. Legacy recovery archive is encrypted.
- Shared record: redacted report with share ID, revocation-token SHA-256 and expiration; private token is returned only to the creator and stored in their encrypted vault. GET never returns the revocation hash/token.

All public input is untrusted. Report JSON is schema-validated; share POST recomputes findings before redaction. Money arithmetic aggregates integer cents where practical and caps overlapping per-line claims. Each item's selected amount and printed schedule must reconcile to the package total.

Catalog provenance and limitations: `data/benchmark_metadata.json`. Resource eligibility/source links: `data/legal_statutes.json`. Synthetic fixtures are reproducible through `npm run samples`; document fixtures are generated from the same JSON by `scripts/generate-demo-pdfs.py`.
