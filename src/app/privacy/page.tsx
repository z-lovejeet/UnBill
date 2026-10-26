import Link from 'next/link';
export default function Privacy() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-emerald-800">
          Data notice · updated 26 October 2026
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Your Data, Step by Step</h1>
        <p className="mt-4 text-slate-600 leading-relaxed">
          Use synthetic or de-identified documents in this public demonstration. UnBill is not
          represented as HIPAA-certified or suitable for storing regulated patient records. An
          operator must establish appropriate provider agreements, settings and policies before
          accepting sensitive health information.
        </p>
      </header>
      {[
        [
          '1. Document processing',
          'With your consent, an uploaded file or pasted statement travels through the application server to Google Gemini. The application does not intentionally save original uploads or log document contents. Requests are size-limited and time-limited. Infrastructure and AI providers can have their own logging and retention policies.',
        ],
        [
          '2. Local history',
          'Up to 30 reports are saved as AES-256-GCM ciphertext in this browser’s localStorage. A nonextractable device key is stored in IndexedDB. No password is required. This protects the stored representation; scripts running with access to this origin can still read an opened report. Device/browser compromise, lost browser keys or cleared storage are outside that protection.',
        ],
        [
          '3. Billing coach',
          'With your consent, your questions and a context summary go through the server to Groq. The generated context omits patient/account names and identifiers. Your own typed question can still contain sensitive information, so do not include it. Chat messages stay in the current page and are not intentionally persisted by UnBill.',
        ],
        [
          '4. Optional sharing',
          'A share link stores a redacted report in Upstash Redis for up to 30 days. Direct patient/account identifiers, facility contact details and service dates are removed. Procedure descriptions and amounts remain, so a redacted report may still be sensitive. Anyone with the cryptographic link can read it. The creator can revoke it using the private control saved in this browser. Deleting local history does not delete public shares.',
        ],
        [
          '5. Deletion and recovery',
          'Delete an individual report or clear saved reports from the vault. Revoke shares separately. Browser storage is device-specific and has no account-based recovery. Clearing all site data also removes private share controls; the server copy then lasts until its expiration unless already revoked. Existing legacy history is migrated where valid; an encrypted recovery archive preserves the old local copy during migration.',
        ],
        [
          '6. Operational controls',
          'Rate limits store hashed network identifiers and short-lived counters in Redis; raw IP values are not intentionally stored by this application. The application has no advertising or analytics scripts. Hosting providers can collect operational metadata. Public endpoints are guarded, but rate controls do not establish regulatory compliance.',
        ],
      ].map(([title, copy]) => (
        <section key={title} className="space-y-3">
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-slate-600 leading-relaxed">{copy}</p>
        </section>
      ))}
      <section className="rounded-xl border bg-white p-6 space-y-3">
        <h2 className="font-semibold">Provider Policies Matter</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Google’s paid and unpaid service terms differ. Unpaid inputs/outputs can be used for
          improvement and human review. Groq documents reliability/abuse retention exceptions and
          optional zero-data-retention controls. UnBill cannot infer those account settings from an
          API key.
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <a
            href="https://ai.google.dev/gemini-api/terms"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Google Gemini Terms
          </a>
          <a
            href="https://console.groq.com/docs/your-data"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Groq Data Controls
          </a>
        </div>
      </section>
      <Link href="/history" className="text-sm underline font-semibold">
        Manage Local Reports & Shared Links
      </Link>
    </article>
  );
}
