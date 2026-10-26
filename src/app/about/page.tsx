import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { PageIntro, GuideSteps, NextStep } from '@/components/page-content';
import metadata from '../../../data/benchmark_metadata.json';
export default function About() {
  return (
    <article className="page-shell space-y-16 sm:space-y-20">
      <PageIntro
        eyebrow="About UnBill"
        title={
          <>
            A better starting point
            <br />
            <span className="font-serif italic font-normal">for the billing conversation.</span>
          </>
        }
        description="UnBill helps you move from a dense itemized statement to specific, understandable questions. Read the charges, inspect the findings and prepare a request that reflects your choices."
      />
      <section className="editorial-section">
        <div>
          <p className="eyebrow">The review method</p>
          <h2 className="section-title mt-4">
            Read carefully.
            <br />
            Keep the facts connected.
          </h2>
        </div>
        <GuideSteps
          items={[
            {
              title: 'Read the source statement',
              copy: 'Gemini extracts supported images, PDFs and pasted text into structured line items. Missing codes or dates remain unknown rather than being filled in with guesses.',
            },
            {
              title: 'Check the extracted record',
              copy: 'Validation checks amounts, quantities, item identities and reconciliation to the gross total. Incomplete or unsupported statements produce a request to correct the input.',
            },
            {
              title: 'Explain the review findings',
              copy: 'Rules inspect the validated items for possible repeats, panel overlaps and reference comparisons. Each finding connects its explanation and suggested question to the source charge.',
            },
            {
              title: 'Prepare from your selection',
              copy: 'One calculation updates the report, letter, phone guide and saved selection. Overlapping findings do not add the same charge to the review amount twice.',
            },
          ]}
        />
      </section>
      <section className="editorial-section">
        <div>
          <p className="eyebrow">What the review looks for</p>
          <h2 className="section-title mt-4">Context for every question.</h2>
        </div>
        <div className="divide-y divide-slate-200">
          {[
            [
              'Possible repeated charges',
              'Matching service codes, dates and amounts can point to a duplicate. Separate providers, repeat procedures or billing modifiers may explain a legitimate repeat; the suggested question asks for that clarification.',
            ],
            [
              'Panel and component overlap',
              'When the catalog recognizes a panel and one of its components on the same date, the report asks how the services were billed together. The source documentation determines whether an adjustment is appropriate.',
            ],
            [
              'Reference comparisons',
              'For supported codes, illustrative reference values add context to the billed amount. They are not official reimbursement rates, an insurer allowance or a quote from the facility. Codes without a reference remain unassessed.',
            ],
            [
              'Documentation questions',
              'Quantity and service-level findings invite an explanation of the record. A statement alone does not establish clinical acuity, medical necessity or an incorrect code.',
            ],
          ].map(([title, copy]) => (
            <div className="py-6 first:pt-0 last:pb-0" key={title}>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{copy}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="surface p-7 sm:p-10">
        <p className="eyebrow">From understanding to follow-through</p>
        <h2 className="section-title mt-4 max-w-xl">Keep the next step close to the evidence.</h2>
        <div className="grid sm:grid-cols-2 gap-8 mt-9">
          {[
            [
              'An itemized report',
              'Expand a service, compare its source figures and choose which findings belong in your request. Gross charges and patient balance stay visibly separate.',
            ],
            [
              'A practical preparation kit',
              'Copy or print a selected-charge letter, follow four phone prompts and open consumer resources that explain the conditions behind relevant protections.',
            ],
            [
              'An optional billing coach',
              'Ask for a clearer explanation or help phrasing a question. The streaming coach uses minimized report context and requires its own processing consent.',
            ],
            [
              'Continuity and controlled sharing',
              'Return to encrypted device history or create a redacted link that expires after 30 days. Revoke it from the browser that created it.',
            ],
          ].map(([title, copy]) => (
            <div key={title}>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{copy}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="editorial-section">
        <div>
          <p className="eyebrow">Transparent by design</p>
          <h2 className="section-title mt-4">
            Understand how
            <br />
            to use the result.
          </h2>
        </div>
        <div className="space-y-6 text-sm leading-7 text-slate-600">
          <p>
            A finding is a reason to ask a question. Verify the statement and compare any patient
            balance with the insurer&apos;s explanation of benefits. UnBill does not determine the
            amount legally owed, confirm fraud, promise a reduction or activate a collection stay.
          </p>
          <p>
            The two synthetic examples run the same review rules, selection controls and preparation
            workflow without sending a document to an extraction provider. For document processing,
            use synthetic or de-identified input in this public app.
          </p>
          <div className="flex flex-wrap gap-5">
            <a
              href={metadata.codingReferences[0]}
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              CMS coding concepts <ArrowUpRight className="h-4 w-4" />
            </a>
            <a
              href={metadata.codingReferences[1]}
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              AMA E/M guidance <ArrowUpRight className="h-4 w-4" />
            </a>
            <Link href="/privacy" className="text-link">
              Data and privacy
            </Link>
          </div>
          <p className="text-xs text-slate-500">
            Coding references explain concepts; they do not supply or endorse the illustrative
            dollar values.
          </p>
        </div>
      </section>
      <section className="quiet-panel flex flex-wrap justify-between gap-6 items-center">
        <div className="max-w-xl">
          <h2 className="text-xl font-semibold tracking-tight">
            Open source, with the method in view.
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            The implementation, planning documents and verification records are public. UnBill is
            distributed under the MIT License, with third-party notices retained.
          </p>
        </div>
        <div className="flex flex-wrap gap-5">
          <a
            className="text-link"
            href="https://github.com/z-lovejeet/UnBill"
            target="_blank"
            rel="noreferrer"
          >
            Explore the repository
          </a>
          <a
            className="text-link"
            href="https://github.com/z-lovejeet/UnBill/blob/main/LICENSE"
            target="_blank"
            rel="noreferrer"
          >
            MIT License <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </section>
      <NextStep
        title="See the complete journey for yourself."
        copy="Open a synthetic example, explore its findings and change a selection to see the report and preparation kit stay in step."
        href="/scan"
        label="Explore a statement"
      />
    </article>
  );
}
