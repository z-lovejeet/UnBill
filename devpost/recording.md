# Recording preparation — UnBill

Screen sequence and accuracy checks for the working UnBill demonstration. The contributor is handling recording and upload.

## Setup

1. Open https://unbill-delta.vercel.app ; deployment of code revision `1069dfb` was confirmed by the contributor. Close unrelated tabs and any secret-bearing editor/terminal windows.
2. Use the supplied synthetic PDF/PNG/text fixtures. Never show `.env.local`, private account settings, raw API logs or real patient records.
3. The release checks are recorded in [release evidence](../docs/audits/2026-10-26/RELEASE.md). Open the synthetic example once before the take. Keep that one-click path available if a provider is temporarily unavailable; label sample mode accurately.
4. Record at a readable desktop size; keep the main demonstration under three minutes. Verify microphone/system settings yourself before the final take.

## Suggested screen sequence (about 2 minutes 40 seconds)

| Time      | Screen action                                       | Factual point to communicate in your own words                                                                                                     |
| --------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0:00–0:20 | Home                                                | Audience: people who need understandable questions about an itemized statement. No unsourced error-rate or savings statistics.                     |
| 0:20–0:50 | Intake, consent, upload synthetic PDF or paste text | Gemini reads the statement; unknown facts remain unknown; actual extraction can take several seconds. Do not describe the sample path as live OCR. |
| 0:50–1:20 | Report and expanded repeated-charge row             | Show gross charges, reported patient balance and selected review amount as separate figures. Findings require verification.                        |
| 1:20–1:45 | Deselect first ER finding, open letter              | The sample starts at $2,717.50 selected; removing $1,130 produces $1,587.50. The letter, schedule and closing use the same total.                  |
| 1:45–2:05 | Phone guide and optional coach                      | Four deterministic phone prompts; optional streaming Groq coaching. No guaranteed latency or automatic legal protection.                           |
| 2:05–2:25 | Share disclosure, create link, vault revocation     | Redacted link; procedures/amounts remain visible; independent revocation and 30-day expiration.                                                    |
| 2:25–2:40 | Vault or home                                       | Encrypted device history and honest scope. State why this review preparation is useful.                                                            |

If the recording is too long, prioritize intake → review → selection → matching letter, then show coach/sharing briefly. The video should visibly show the functioning core rather than slides alone.

## Accuracy checklist

- [ ] Narration matches the visible features, figures and product limits.
- [ ] Actual source figures visible; no invented official pricing, savings, diagnosis or legal enforcement claims.
- [ ] Only synthetic/de-identified input shown.
- [ ] Letter selection is consistent and readable.
- [ ] Audio and screen text are clear; no credentials or unrelated windows shown.
- [ ] Video is under three minutes, shows the complete flow and is publicly visible on YouTube/Vimeo; verified while signed out.
- [ ] Video URL recorded in `shipping-status.md` and the actual submission form.

After upload, add the public video URL to [shipping status](shipping-status.md). Devpost submission is handled by the contributor.

For the form, use the public repository in “Try it out” and https://github.com/z-lovejeet/UnBill/blob/main/LICENSE in the license field. Complete the Skill Pack explanation and both age-of-majority and eligibility checkboxes. The app requires no login; the synthetic examples provide immediate access.

## Actual feedback

On 26 October 2026 the contributor reviewed the letter PDF and said it “looks clean simple and good.”
