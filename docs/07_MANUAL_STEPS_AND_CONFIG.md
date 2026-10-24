# UnBill — Manual Setup & Builder Action Guide

**Document Version:** 1.0.0  
**Status:** Actionable Guide for You (The Builder)  
**Last Updated:** October 2026  
**Author:** UnBill Engineering Core  

---

## 1. What YOU Need to Do Manually

To build and deploy **UnBill**, you only have to complete **3 simple manual tasks**. Everything else (writing the code, datasets, rule algorithms, and UI) is handled by your AI coding partner (Antigravity).

### Task 1: Get Your Free Gemini API Key (2 minutes)
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Sign in with any Google account.
3. Click **"Get API key"** in the top left.
4. Click **"Create API key in new project"**.
5. Copy the generated key (starts with `AIza...`).
6. *Cost:* 100% Free (15 requests per minute, which is more than enough for our entire build and demo).

### Task 2: Get Your Free Groq API Key (Optional but Recommended for Chat, 2 minutes)
1. Go to [Groq Console](https://console.groq.com/).
2. Sign in with Google or GitHub.
3. In the left sidebar, click **"API Keys"**.
4. Click **"Create API Key"**, give it a name like `unbill-hackathon`, and copy it.
5. *Cost:* 100% Free tier (generous rate limits, ultra-fast Llama-3.3-70b streaming).

### Task 3: (Optional) Upstash Redis for Share Links (3 minutes)
*If you want cloud shareable links (`/share/[uuid]`):*
1. Go to [Upstash Console](https://console.upstash.io/) (or add it directly from your Vercel Dashboard Marketplace with 1 click).
2. Create a Free Serverless Redis Database.
3. Copy the `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
*(Note: If you skip this, our fallback URL-hash compression still gives you 100% working share links with zero configuration!)*

---

## 2. Environment Configuration (`.env.local`)

In the root of the `unbill/` directory, create a `.env.local` file with the following variables:

```bash
# ==============================================================================
# UnBill Environment Configuration
# ==============================================================================

# 1. Google Gemini API (Required - Multimodal Vision & Forensic Audit)
# Get yours free at https://aistudio.google.com/
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"

# 2. Groq API (Required for Real-time Sub-350ms Copilot Chat)
# Get yours free at https://console.groq.com/
GROQ_API_KEY="gsk_YourGroqApiKeyHere"

# 3. Upstash Redis (Optional - for Anonymous Report Share links & Global Stats)
# Leave empty if using client-side URL compression fallback
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# 4. App Base URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 3. Terminal Commands Quick Reference

### Install Dependencies
```bash
cd "/Users/lovejeetsingh1/Documents/Hackathons/Build With AI/unbill"
npm install
```

### Start Local Development Server
```bash
npm run dev
```
Open your browser to [http://localhost:3000](http://localhost:3000).

### Run Production Build Test
```bash
npm run build
```
Verify that the build outputs static and serverless edge routes with zero errors.

---

## 4. Winning Demo Video Script (150 Seconds)

A great demo wins the hackathon. Devpost judges watch dozens of submissions; keep the energy high, hook them in the first 15 seconds, and show real software in action.

| Timestamp | Screen Display | Voiceover Script |
|---|---|---|
| **0:00 – 0:20** | **Landing Page Hero:** Show stats (\$88B debt, 80% error rate). Hover over a real-looking, cryptic hospital bill PDF. | *"Over 80% of US medical bills contain errors—duplicate charges, unbundled blood tests, and inflated room markups. Americans hold $88 billion in medical debt, and most never dispute because bills are written in cryptic codes. This is UnBill: an open, private forensic bill auditor and statutory dispute engine."* |
| **0:20 – 0:40** | Click **"Test with Sample ER Bill"** (or upload a bill photo). Show the **Multi-Agent Radar screen** animating. | *"Let's test this real-world emergency room statement totaling $4,820. Our multi-agent pipeline immediately engages: Agent 1 parses clinical codes with Gemini 3.8 Flash; Agent 2 runs deterministic duplicate and CMS benchmark audits; Agent 3 matches federal consumer protection statutes."* |
| **0:40 – 1:10** | **Audit Dashboard:** Pan across the KPI cards (\$1,650 Potential Overcharge) and zoom into the **Itemized Table**. | *"Look at the results: UnBill decoded every line item into plain English. Notice CPT 80053: it was billed twice at 9:14 AM and 9:15 AM—a $280 duplicate charge. And the Level 4 ER facility fee is billed at $1,850, more than triple the regional Medicare allowable median. Total potential savings: $1,650."* |
| **1:10 – 1:35** | Click **"Generate Dispute Kit"**. Show the formal **Fair Credit Billing Act Letter** with certified mail formatting. | *"With one click, UnBill generates an enforceable, formal dispute package under the Fair Credit Billing Act (15 U.S.C. § 1666) and the federal No Surprises Act. It itemizes the exact billing errors, demands a 30-day investigation pause on collections, and prepares an interactive phone negotiation checklist for when you call hospital billing."* |
| **1:35 – 2:05** | Open the **Copilot Chat Drawer**. Ask: *"What if the billing rep says this price is non-negotiable?"* Watch Groq stream in real-time. | *"Need help negotiating? Our Groq-powered Copilot gives sub-second tactical advice, telling you the exact script to read to a hospital supervisor and citing Section 501(r) charity care rules."* |
| **2:05 – 2:30** | Click **History Vault** (`/history`) and show the **Privacy statement**. | *"Best of all, UnBill is architected as a Local-First privacy application. Your medical bills are never stored on a cloud database. No logins, no tracking. Just immediate consumer financial justice. Built with Antigravity, Gemini 3.8 Flash, and Groq."* |

---

## 5. Devpost Submission Checklist

Before submitting on Devpost (Deadline: October 26, 5:00 PM EDT / Oct 27 2:30 AM IST):

- [ ] Repository is set to **Public** on GitHub.
- [ ] Vercel live deployment link added to the "Try it out" field.
- [ ] 2.5-minute demo video uploaded to YouTube or Vimeo and link added.
- [ ] Verified that clicking "Test Sample Bill" works seamlessly on the live deployment.
- [ ] Confirmed age of majority and answered the Skill Pack usage questions on Devpost.
