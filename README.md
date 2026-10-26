# UnBill

UnBill helps people review an itemized medical statement and prepare clear questions for the billing team. It extracts supported documents with Gemini, runs deterministic checks, keeps selected amounts consistent across a report and letter, and offers a streaming Groq billing coach.

Built for [Build With AI: Basics](https://learn-ai-basics.devpost.com/). This release is intended for synthetic or de-identified demonstrations. It is not a clinical coding authority, legal service, or regulated health-record system.

## Try it locally

Requires Node.js 22 LTS and npm.

```bash
git clone https://github.com/z-lovejeet/UnBill.git
cd UnBill
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Both synthetic examples work without AI keys or Redis. The examples run the same deterministic engine as extracted statements; they do not call document AI.

For document extraction, set `GEMINI_API_KEY`. Defaults are `gemini-3.8-flash`, with `gemini-3.5-flash-lite` fallback. For the coach, set `GROQ_API_KEY`; the configured primary is `openai/gpt-oss-120b`, with `openai/gpt-oss-20b` fallback. Provider availability and latency vary. No fixed latency guarantee is made.

The primary has a shared cap of **18 provider attempts per Pacific-time day**. After that, requests go directly to Flash-Lite. A confirmed daily-quota response also disables primary attempts for the rest of that quota day. The cap includes failed attempts and survives deployment/key rotation through Redis; other applications using the Google project consume quota independently.

## Features and limits

- PNG/JPEG/WebP/PDF intake, maximum **2.5 MB**, or pasted itemized text up to 50,000 characters; maximum 200 items.
- Explicit consent before transmitting documents or coach questions. Use synthetic/de-identified input.
- Runtime validation of extracted/direct input; unknown codes and dates remain unknown. Incomplete statements, unsupported credits and unreconciled totals require manual review.
- Possible duplicates and overlapping panels, quantity/documentation review, and illustrative price comparisons. Legitimate repeats, providers and modifiers can change interpretation.
- One selected amount per item, regenerated letter, four phone prompts, conditional consumer-resource links, copy and print/PDF export.
- AES-256-GCM browser persistence, nonextractable IndexedDB device key, up to 30 reports. This is not password protection or protection from scripts running on the same origin.
- Redacted share links, 256-bit random identifiers, 30-day expiration, and private revocation controls in the creator's vault. Procedures and amounts remain visible to link holders.
- Bounded provider requests, streaming cancellation, body limits, per-network request limits and a configurable daily AI budget.

The **19-code illustrative catalog is not an official CMS fee schedule**, market percentile dataset, insurer allowance or legal price cap. The 1.5× comparison is a demonstration heuristic. Findings are review candidates; estimated gross reductions are not guaranteed patient savings. An audit or letter does not activate a collection or credit-reporting stay. See [methodology](docs/03_MULTI_AGENT_AI_PIPELINE.md), [data provenance](data/benchmark_metadata.json) and [privacy/deployment instructions](docs/07_MANUAL_STEPS_AND_CONFIG.md).

## Verify

```bash
npm run check             # lint, types, 23 offline regression tests, production build
npm audit --audit-level=moderate
```

Live provider checks use only synthetic fixtures and consume provider quota. Start the application with configured keys and Redis, then in another terminal:

```bash
npm run test:live
```

The suite checks text/image/PDF extraction, document rejection, streaming chat, redacted sharing, invalid revocation and successful revocation. It deletes its own share record. Set `UNBILL_SMOKE_URL` to an explicit localhost port or HTTPS deployment to test that origin. Results are written to `docs/audits/2026-10-26/release-live-verification.json`; historical audit files describe earlier versions and are not current test results.

For local production smoke testing:

```bash
npm run build
ALLOW_LOCAL_RATE_LIMIT=true APP_URL=http://127.0.0.1:3107 npm start -- --hostname 127.0.0.1 --port 3107
UNBILL_SMOKE_URL=http://127.0.0.1:3107 npm run test:live
```

Keep `ALLOW_LOCAL_RATE_LIMIT=false` on public hosting. Public AI endpoints require working Redis protection; synthetic examples remain independent of providers.

## Deployment

The app targets Node.js Next.js hosting; `vercel.json` supplies a Vercel configuration. Set the server keys, Redis URL/token, daily request budget, and the actual `APP_URL` HTTPS origin. Vercel forwarding is detected automatically; custom reverse proxies must sanitize forwarded headers before enabling `TRUST_PROXY`. Do not expose secrets through client variables or source control.

Run the offline checks before publishing and the live suite against the final deployment after configuring its environment. Check a share link in a separate browser and its revocation. `/api/health` reports configuration presence, not provider health. Full steps and rollback guidance are in [the deployment guide](docs/07_MANUAL_STEPS_AND_CONFIG.md).

A public demonstration is different from accepting real patient records. Provider agreements/settings, organizational data practices and an appropriate clinical/legal review must be established before sensitive-data use. No HIPAA certification or blanket zero-retention claim is made.

## Skill Pack and submission

The [Skill Pack document index](devpost/README.md) connects the scope, PRD, technical specification, build checklist, app map and shipping materials. Use the [project overview](devpost/submission.md) for feature and architecture facts and the [recording guide](devpost/recording.md) for the demonstration sequence. The contributor confirmed successful Vercel deployment of code revision `1069dfb` and is handling recording and Devpost submission.

Remaining external steps are tracked in [shipping status](devpost/shipping-status.md): public video URL, actual form fields/age confirmation, exit survey and Devpost submission confirmation. Current submission deadline: **27 October 2026, 2:30 am IST**; verify on the [official rules page](https://learn-ai-basics.devpost.com/rules).

## License

Project code: [MIT](LICENSE). Included Skill Pack material retains its MIT notice. See [third-party notices](THIRD_PARTY_NOTICES.md).

Public license URL for the submission form: https://github.com/z-lovejeet/UnBill/blob/main/LICENSE . GitHub recognizes the repository license as MIT. No login is needed to try the app; two synthetic examples provide the complete review flow.
