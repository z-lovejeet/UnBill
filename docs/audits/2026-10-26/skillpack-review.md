> Historical pre-repair audit. For the repaired version, see [current release verification](RELEASE.md). Findings below record the earlier audited revision.

# UnBill: current Skill Pack and submission audit

Audit date: 26 October 2026 (India). Project revision: `3f166888704a758c10fdb6113beb58e06d4a89a4`. Upstream Skill Pack revision checked remotely: `a0f065781873e8a7ed9a9a705a8dafa6a0810439`.

This is an evidence audit, not a claim that the learner completed an interview, reviewed the app, recorded a video, or submitted a form. Application/runtime findings are covered separately by the main audit.

## Verdict

**The planning artifacts exist, but complete Skill Pack and submission readiness cannot be certified.** Step 6 still lacks verifiable shipping evidence. Step 5 is checked complete, yet its learner-review record is too generic to establish what happened, and documentation contains observable implementation drift. Do not mistake these gaps for a requirement to rebuild the application or repeat work that was genuinely completed.

The official deadline is 26 October 2026, 5:00 pm EDT, which is **27 October 2026, 2:30 am IST**. Required deliverables include a public repository, planning documents, functioning software, and a publicly visible YouTube/Vimeo demonstration. Keeping the video under three minutes is recommended; judges need not watch beyond that. [Official rules, sections 1 and 4](https://learn-ai-basics.devpost.com/rules).

## Evidence collected

- `git ls-remote` confirmed the upstream revision above. All six local `agent/skills/*/SKILL.md` bodies and supporting files match upstream; differences are description wrapping/frontmatter spacing only. [Upstream tree](https://github.com/challengepost/learn-ai-basics/tree/a0f065781873e8a7ed9a9a705a8dafa6a0810439).
- Unauthenticated GitHub API access reports `private: false`, `visibility: public`, `default_branch: main`, and no detected license. Remote `main` matches the audited local revision. [Repository API](https://api.github.com/repos/z-lovejeet/UnBill), [public repository](https://github.com/z-lovejeet/UnBill).
- The learner profile exists locally and is substantive. It is ignored by `.gitignore:24`, not tracked, and no history was returned for it or `.env`/`.env.local`. Its private contents are intentionally not reproduced here. This narrow check is not a full secret scan.
- No recorded-video URL appears in the tracked project materials reviewed. No authenticated Devpost form or external video/account was inspected.

## Six-step compliance matrix

| Step | Local evidence | Assessment |
|---|---|---|
| 1-start | Ignored local `devpost/learner-profile.md`; `.gitignore:15–24`; placeholder `.env.example`. | Artifact present and private by default. Historical interview conduct cannot be established from files alone. |
| 2-scope | `devpost/scope.md:1–48`: approved status, audience, kernel, core loop, observable success, scope/deferred/cut choices. | Substantive artifact present. Approval text records status; this audit cannot authenticate the original learner exchange. |
| 3-prd | `devpost/prd.md:1–75`: approved status, journey, screens, visual choices, acceptance behaviors, states, boundaries. | Substantive artifact present; several technical/performance/privacy promises need reconciliation with the application. |
| 4-spec | `devpost/spec.md:1–112`: approved architecture, stack, run instructions, components, data, failure modes. | Substantive artifact present, but implementation drift requires a factual refresh. |
| 5-build | Approved checklist with four checked slices, hands-on/final-review/wrap-up sections; app map tracked; many implementation and fix commits. | Implementation history exists. Checked boxes do not independently prove learner feedback, latency targets, or an accurate final app map. |
| 6-ship | Public repository verified. `devpost/submission.md` includes prose and a proposed narration, but only a local live-demo address. | Incomplete evidence: published video, learner authorship, exact form fields, exit survey, and actual submission remain unverified. |

The required artifacts and progress semantics come from the [current README](https://github.com/challengepost/learn-ai-basics/blob/a0f065781873e8a7ed9a9a705a8dafa6a0810439/README.md), [start skill](https://github.com/challengepost/learn-ai-basics/blob/a0f065781873e8a7ed9a9a705a8dafa6a0810439/skills/1-start/SKILL.md), [scope skill](https://github.com/challengepost/learn-ai-basics/blob/a0f065781873e8a7ed9a9a705a8dafa6a0810439/skills/2-scope/SKILL.md), [PRD skill](https://github.com/challengepost/learn-ai-basics/blob/a0f065781873e8a7ed9a9a705a8dafa6a0810439/skills/3-prd/SKILL.md), and [spec skill](https://github.com/challengepost/learn-ai-basics/blob/a0f065781873e8a7ed9a9a705a8dafa6a0810439/skills/4-spec/SKILL.md).

## Findings that matter before submission or recording

### 1. Required shipping evidence is not available

There is a script at `devpost/submission.md:138–151`, but a script is not a recorded/uploaded video. `devpost/submission.md:5` identifies only localhost or a potential deployment. Add and verify the final video URL alongside the spec's sharing instructions once it exists. A local recording is acceptable. Deployment and peer feedback are optional under [6-ship, sections 1–3](https://github.com/challengepost/learn-ai-basics/blob/a0f065781873e8a7ed9a9a705a8dafa6a0810439/skills/6-ship/SKILL.md#3-record-and-share-the-demo-video).

The exact authenticated submission form was not reviewed, so exit-survey answers and submission status are **unknown**, not proven absent. Confirm those before declaring completion. [6-ship completion checklist](https://github.com/challengepost/learn-ai-basics/blob/a0f065781873e8a7ed9a9a705a8dafa6a0810439/skills/6-ship/SKILL.md#5-close-clearly).

The organizer added two required eligibility fields: a short Skill Pack usage explanation and age-of-majority confirmation. The public repository URL belongs in the form's Try it out field. Their presence in local Markdown does not establish that the form is complete. [Organizer's form update](https://learn-ai-basics.devpost.com/updates/46821-two-new-questions-on-the-submission-form), [repository reminder](https://learn-ai-basics.devpost.com/updates/46766-don-t-forget-to-include-a-url-to-your-public-repo).

### 2. Existing submission prose cannot establish learner authorship

`devpost/submission.md` is a full ready-to-copy story plus word-for-word narration. Its existence and Git author do not establish who wrote the prose. The pack reserves project name, short description, other public submission answers, narration, and personal reflections to the learner; an agent may identify gaps and correct spelling/grammar. If this file was generated by an agent, using it verbatim conflicts with the curriculum's authorship instruction. This audit does not allege authorship or predict disqualification. [6-ship, sections 3–4](https://github.com/challengepost/learn-ai-basics/blob/a0f065781873e8a7ed9a9a705a8dafa6a0810439/skills/6-ship/SKILL.md#4-write-your-own-submission).

### 3. The spec does not accurately describe the current tree or data flow

- `devpost/prd.md:22` and `devpost/spec.md:86` describe `/pipeline`; processing currently lives within `src/app/scan/page.tsx`.
- `devpost/spec.md:35` describes `/share/[uuid]`; the API actually returns `/results/<shareId>` at `src/app/api/share/route.ts:50–51`.
- `devpost/spec.md:57–62,97` lists absent component files and `src/lib/groq.ts`; corresponding behavior lives inline in page/API files. Explain actual locations rather than implying separately implemented files.
- `devpost/spec.md:33` names `@google/genai`; `package.json` uses `@google/generative-ai`. Its model/fallback descriptions differ from `src/lib/gemini.ts:17,77`.
- `devpost/spec.md:19,36` presents IndexedDB alongside local storage; actual persistence at `src/lib/store.ts:181–205` is base64-encoded `localStorage`.
- `devpost/spec.md:44` says Edge, but API routes explicitly select Node.js. `README.md:100` still gives a placeholder clone URL; `.env.example` lacks optional model overrides documented in README.

The shipping skill asks for factual setup instructions and app-map updates after fixes; it does not require every original planned file to exist if the implemented behavior is accurately documented. [6-ship, sections 1–2](https://github.com/challengepost/learn-ai-basics/blob/a0f065781873e8a7ed9a9a705a8dafa6a0810439/skills/6-ship/SKILL.md#2-prepare-the-public-github-repository).

### 4. Build and learning completion is asserted more strongly than recorded

`devpost/checklist.md:54–71` checks learner exploration, feedback, final approval, a shown app map, and learning wrap-up. The accompanying evidence repeats engineering outcomes and ends with an autonomous-execution statement. It does not record specific learner feedback or distinguish an interactive learning activity from an agent's recap. Original conversation evidence may exist elsewhere; do not fabricate it. Record the actual completed activity and feedback if known, or complete the missing learner review. [5-build, hands-on checks and final review](https://github.com/challengepost/learn-ai-basics/blob/a0f065781873e8a7ed9a9a705a8dafa6a0810439/skills/5-build/SKILL.md).

Commit chronology alone cannot prove whether planning occurred before implementation. The organizer says to use the pack from the outset, but also explicitly permits a participant's combined build-slice commits without recreating history. UnBill has a real multi-commit implementation history; there is no basis to demand fabricated earlier slice snapshots. [Manager clarification and later reply](https://learn-ai-basics.devpost.com/forum_topics/45533-subject-eligibility-question-using-learn-skill-pack-after-initial-development).

### 5. The app map is present, with smaller completeness gaps

All shown source paths and function anchors at `devpost/app-map.html:193–223` resolve. It is self-contained HTML/CSS/SVG with no scripts, remote fonts, or CDN dependencies. Browser rendering was not checked in this research subtask. It supplies an overview, diagram, change pointers, a reuse note, and run instructions.

It provides five stops rather than the recommended compact 2–3, omits a source commit and snapshot-drift explanation (`:255` only dates the map), and its reusable-practice section (`:240–242`) makes broad guarantees without a specific document/test evidence link. The deterministic-only legal description also omits the AI letter replacement path at `src/app/api/audit/route.ts:99–110`. Update these facts; no new learning exercise is required just to refresh a map. [App-map requirements](https://github.com/challengepost/learn-ai-basics/blob/a0f065781873e8a7ed9a9a705a8dafa6a0810439/skills/5-build/references/code-tour.md#the-app-map).

### 6. Project license is advertised but missing

README claims an MIT license, but no tracked project-root license exists and GitHub detects none. The rules recommend a detectable open-source license; this is a repository completeness issue, not phrased as a mandatory license gate. Preserve any third-party license notices required for bundled skill material as well. [Official rules, repository requirement](https://learn-ai-basics.devpost.com/rules), [upstream MIT license](https://github.com/challengepost/learn-ai-basics/blob/a0f065781873e8a7ed9a9a705a8dafa6a0810439/LICENSE).

## Practical closing checklist

- Resolve critical application findings from the main audit before recording the final demonstration.
- Reconcile setup/spec/app-map descriptions with actual behavior and remove unsupported public claims.
- Establish the learner's actual review/feedback history honestly; do not infer it from checked boxes.
- Learner verifies authorship of the submission answers and writes any missing personal/form answers.
- Record the functioning core journey, upload to public YouTube/Vimeo, and verify access while signed out.
- Complete the exact current form, including Skill Pack usage and age confirmation, and the exit survey; verify the public repository URL in Try it out.
- Submit before 27 October 2026, 2:30 am IST, and retain confirmation. Deployment is optional for this hackathon; production readiness is a separate engineering assessment.

No public repository was created, pushed, deployed, posted to, or submitted during this audit. No submission prose, private profile, source code, or historical completion boxes were changed.
