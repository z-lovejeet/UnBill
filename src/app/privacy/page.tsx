import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { PageIntro } from '@/components/page-content';
export default function Privacy() {
  return (
    <article className="page-shell space-y-14 sm:space-y-20">
      <PageIntro
        eyebrow="Data and privacy · updated 26 October 2026"
        title={
          <>
            Your data.
            <br />
            <span className="font-serif italic font-normal">A clear account of the journey.</span>
          </>
        }
        description="Know what stays in your browser, what is sent for processing and what becomes accessible when you share. Each optional feature has its own data boundary."
      />
      <section className="surface overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100">
          <h2 className="section-title">At a glance</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            No account is needed. Use synthetic or de-identified statements in the public app.
          </p>
        </div>
        <dl className="grid md:grid-cols-2">
          {[
            [
              'Statement processing',
              'Your consent sends an upload or pasted text through the application server to Google Gemini. Built-in examples do not use document extraction.',
            ],
            [
              'Device history',
              'Up to 30 reports are encrypted in this browser. The device holds the encryption key; there is no account-based sync or recovery.',
            ],
            [
              'Optional coach',
              'Your questions and minimized report context go through the server to Groq after you consent. Chat is not intentionally saved by the app.',
            ],
            [
              'Optional links',
              'A redacted report is stored separately for up to 30 days. Anyone holding its link can read the remaining procedure details and amounts.',
            ],
          ].map(([title, copy]) => (
            <div key={title} className="p-6 sm:p-8 border-b border-slate-100">
              <dt className="font-semibold">{title}</dt>
              <dd className="mt-3 text-sm leading-7 text-slate-600">{copy}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="editorial-section" id="processing">
        <div>
          <p className="eyebrow">01 / Processing</p>
          <h2 className="section-title mt-4">
            What leaves
            <br />
            your browser.
          </h2>
        </div>
        <div className="space-y-5 text-sm leading-7 text-slate-600">
          <p>
            When you start document processing, the selected image, PDF or pasted text travels
            through the server to Gemini. Requests have input and waiting limits. The application
            does not intentionally save original uploads or log their contents; hosting
            infrastructure and providers can have their own operational records and retention.
          </p>
          <p>
            The optional coach sends your question history and a minimized report summary to Groq.
            Generated context omits direct patient/account identifiers, but anything you type into a
            question is still sent. Keep names, account numbers and other identifying details out of
            the chat.
          </p>
          <p>
            Provider policies depend on the service and account configuration. Google distinguishes
            paid and unpaid processing terms; Groq documents retention exceptions and account
            controls. A configured API key does not establish which protections an operator has
            enabled.
          </p>
          <div className="flex flex-wrap gap-5">
            <a
              href="https://ai.google.dev/gemini-api/terms"
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              Gemini terms <ArrowUpRight className="h-4 w-4" />
            </a>
            <a
              href="https://console.groq.com/docs/your-data"
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              Groq data controls <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
      <section className="editorial-section" id="local-history">
        <div>
          <p className="eyebrow">02 / Local history</p>
          <h2 className="section-title mt-4">
            Saved here.
            <br />
            Managed here.
          </h2>
        </div>
        <div className="space-y-5 text-sm leading-7 text-slate-600">
          <p>
            Reports and private share controls are stored as AES-256-GCM ciphertext in this
            browser&apos;s localStorage. A nonextractable key lives in IndexedDB. This protects the
            saved representation, but it is not a password or login boundary: scripts with access to
            this origin can read an opened report.
          </p>
          <p>
            History belongs to this browser profile on this device. Switching browsers, clearing
            site data, losing the key or a compromised device can make reports unavailable or expose
            an open session. There is no server account to restore the vault.
          </p>
          <p>
            Use the vault to delete one report or clear saved reports. Older history is validated
            during migration; where available, an encrypted recovery archive retains the previous
            local copy. A downloaded recovery file can contain private data and should be handled
            accordingly.
          </p>
          <Link href="/history" className="text-link">
            Manage your local vault <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
      <section className="editorial-section" id="sharing">
        <div>
          <p className="eyebrow">03 / Sharing</p>
          <h2 className="section-title mt-4">
            A link is
            <br />a separate copy.
          </h2>
        </div>
        <div className="space-y-5 text-sm leading-7 text-slate-600">
          <p>
            Creating a link requires a separate sharing choice. The server removes direct
            patient/account identifiers, facility contact details and service dates, then stores the
            redacted report in Upstash Redis for up to 30 days. Procedures and amounts remain
            visible and can still be sensitive.
          </p>
          <p>
            Anyone holding the cryptographic link can access it until it expires or is revoked. The
            creator&apos;s private revocation control is encrypted in the local vault. Keep that
            browser available while the link is active.
          </p>
          <div className="quiet-panel">
            <h3 className="font-semibold text-slate-900">
              Deletion and revocation do different things.
            </h3>
            <p className="mt-2">
              Deleting a local report does not revoke a shared copy. Revoke the link in the vault
              before clearing site data if you want server access to stop. Clearing all site data
              also removes the private control; an unrevoked link then remains until expiration.
            </p>
          </div>
        </div>
      </section>
      <section className="editorial-section">
        <div>
          <p className="eyebrow">04 / Operations</p>
          <h2 className="section-title mt-4">
            The wider
            <br />
            service boundary.
          </h2>
        </div>
        <div className="space-y-5 text-sm leading-7 text-slate-600">
          <p>
            Short-lived rate-limit counters in Redis use hashed network identifiers. The application
            does not intentionally store raw IP addresses in those counters and includes no
            advertising or analytics scripts. Hosting services can collect operational metadata
            independently.
          </p>
          <p>
            This public release is a billing-review demonstration for synthetic or de-identified
            input. It is not presented as HIPAA-certified. Operating with sensitive health records
            requires appropriate provider arrangements, account settings and organizational
            practices beyond the application&apos;s local encryption and request controls.
          </p>
          <p>
            For an explanation of the review itself, visit{' '}
            <Link href="/about" className="text-link">
              how UnBill works
            </Link>
            . The{' '}
            <a
              href="https://github.com/z-lovejeet/UnBill"
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              public source
            </a>{' '}
            documents storage and service boundaries.
          </p>
        </div>
      </section>
    </article>
  );
}
