# Extraction and review pipeline

The implementation uses AI at document reading and conversation boundaries, with deterministic validation, arithmetic and document preparation in between. It is a hybrid workflow, not four independently autonomous clinical/legal agents.

1. `gemini.ts`: REST structured extraction. Defaults: Gemini 3.8 Flash, then Gemini 3.5 Flash Lite. The primary attempt is bounded to 18 seconds; both models share one 90-second extraction deadline. The fallback uses the time remaining, including time saved when the primary fails quickly or is skipped. The route allows 120 seconds and the browser 125 seconds, leaving overhead for reading, quota guards and the response. Missing codes/dates are not inferred. Invalid, unrelated, incomplete or unsupported statements return an actionable error.
2. `validation.ts`: strict runtime types, finite nonnegative money, positive integer quantities, unique IDs, supported dates, item/count/size limits and gross reconciliation.
3. `rules-engine.ts`: possible same-day repeats, limited panel overlaps, quantity/documentation review and illustrative price differences. Repeat modifiers and provider details affect interpretation. The catalog is limited to 19 entries and is not official pricing.
4. The same domain module generates the letter and a read-aloud phone script from selected items. Each line contributes at most its maximum supported review amount, capped at its charge. No generative model replaces the letter.
5. `api/chat/route.ts`: consented Groq streaming with minimized bill context, bounded history/output, cancellation and transient-error fallback. The coach is instructed not to determine fraud, clinical necessity, legal stays, owed balances or guaranteed savings.

Tests: `tests/release.test.ts` verifies domain/API/privacy invariants without real provider calls. `scripts/smoke-live.ts` verifies synthetic text/image/PDF input, unrelated-input rejection, streaming and actual Redis share/revocation. Measured latency belongs in evidence, not a guaranteed product label.
