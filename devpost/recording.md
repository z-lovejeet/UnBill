# Recording preparation — UnBill

Prepared during delegated release hardening. This is a technical shot list with AI-assisted talking points, not a claim that the contributor recorded or wrote original narration. Follow the current Skill Pack's final-authorship requirement.

## Setup
1. Use the production build at the documented test origin or the verified public deployment. Close unrelated tabs and any secret-bearing editor/terminal windows.
2. Use the supplied synthetic PDF/PNG/text fixtures. Never show `.env.local`, private account settings, raw API logs or real patient records.
3. Confirm `npm run check`, dependency audit and the live suite are green for the release revision. Keep a synthetic one-click path available if a provider is temporarily unavailable; label sample mode accurately.
4. Record at a readable desktop size; keep the main demonstration under three minutes. Verify microphone/system settings yourself before the final take.

## Suggested screen sequence (about 2 minutes 40 seconds)
| Time | Screen action | Factual point to communicate in your own words |
|---|---|---|
| 0:00–0:20 | Home | Audience: people who need understandable questions about an itemized statement. No unsourced error-rate or savings statistics. |
| 0:20–0:50 | Intake, consent, upload synthetic PDF or paste text | Gemini reads the statement; unknown facts remain unknown; actual extraction can take several seconds. Do not describe the sample path as live OCR. |
| 0:50–1:20 | Report and expanded repeated-charge row | Show gross charges, reported patient balance and selected review amount as separate figures. Findings require verification. |
| 1:20–1:45 | Deselect first ER finding, open letter | The sample starts at $2,717.50 selected; removing $1,130 produces $1,587.50. The letter, schedule and closing use the same total. |
| 1:45–2:05 | Phone guide and optional coach | Four deterministic phone prompts; optional streaming Groq coaching. No guaranteed latency or automatic legal protection. |
| 2:05–2:25 | Share disclosure, create link, vault revocation | Redacted link; procedures/amounts remain visible; independent revocation and 30-day expiration. |
| 2:25–2:40 | Vault or home | Encrypted device history and honest scope. State why this review preparation is useful. |

If the recording is too long, prioritize intake → review → selection → matching letter, then show coach/sharing briefly. The video should visibly show the functioning core rather than slides alone.

## Accuracy checklist
- [ ] Contributor's final original narration reviewed against current authorship requirements.
- [ ] Actual source figures visible; no invented official pricing, savings, diagnosis or legal enforcement claims.
- [ ] Only synthetic/de-identified input shown.
- [ ] Letter selection is consistent and readable.
- [ ] Audio and screen text are clear; no credentials or unrelated windows shown.
- [ ] Video publicly visible on YouTube/Vimeo; verified while signed out.
- [ ] Video URL recorded in `shipping-status.md` and the actual submission form.

Public narration, reflection and upload/submission status remain contributor-controlled until actually completed.

## Actual feedback
On 26 October 2026 the contributor reviewed the letter PDF and said it “looks clean simple and good.” The export layout therefore has direct contributor feedback. This does not claim the final video was recorded or submitted.
