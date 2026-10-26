import Link from 'next/link';
import { ArrowRight, Check, ArrowUpRight } from 'lucide-react';
import { SampleBillCards } from '@/components/sample-bill-cards';
import { GuideSteps, NextStep } from '@/components/page-content';
import er from '../../public/samples/er_visit_broken_wrist.json';
import { formatCurrency } from '@/lib/utils';

export default function Home() {
  return (
    <div className="page-shell space-y-20 sm:space-y-28">
      <section className="grid gap-12 lg:grid-cols-[1.2fr_1fr] items-center">
        <div className="space-y-6">
          <p className="eyebrow">A clearer way to review medical bills</p>
          <h1 className="page-title">
            Your bill.
            <br />
            In plain English.
            <br />
            <span className="font-serif italic font-normal text-emerald-900">Your next step.</span>
          </h1>
          <p className="page-lede">
            Make sense of itemized charges, find questions worth asking, and walk into your next
            billing conversation with a clear, consistent review request.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/scan" className="action-primary">
              Review a statement <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#sample-tests" className="action-secondary">
              Explore an example
            </a>
          </div>
          <p className="text-xs leading-6 text-slate-500">
            No account needed. Start with a synthetic example or a de-identified statement.
          </p>
        </div>
        <div className="lg:pl-6">
          <div className="surface overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
              <span className="text-xs font-semibold text-slate-600">
                A statement, made understandable
              </span>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-1 rounded">
                Example report
              </span>
            </div>
            <div className="p-6 sm:p-8 space-y-7">
              <div>
                <p className="text-xs text-slate-500">Synthetic emergency room visit</p>
                <p className="mt-3 text-4xl font-mono tracking-tight">
                  {formatCurrency(er.financials.totalBilledGross)}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Gross charges across {er.items.length} line items
                </p>
              </div>
              <div className="space-y-4 border-y border-slate-100 py-5">
                {[
                  ['See what was billed', 'Readable services, codes, quantities and amounts.'],
                  [
                    'Choose what to question',
                    'Expand findings and decide what belongs in your request.',
                  ],
                  [
                    'Keep every figure aligned',
                    'Your selection carries into the letter and phone guide.',
                  ],
                ].map(([title, copy]) => (
                  <div className="flex gap-3" key={title}>
                    <Check className="h-4 w-4 text-emerald-700 shrink-0 mt-1" />
                    <div>
                      <p className="text-sm font-semibold">{title}</p>
                      <p className="text-xs leading-6 text-slate-500 mt-1">{copy}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between gap-4 items-end">
                <div>
                  <p className="text-xs text-slate-500">Initial amount selected for review</p>
                  <p className="text-2xl font-mono mt-2 text-emerald-900">
                    {formatCurrency(er.financials.totalPotentialSavings)}
                  </p>
                </div>
                <a
                  href="#sample-tests"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
                >
                  Try it <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
              <p className="text-[11px] leading-5 text-slate-500">
                Selected charges are a starting point for questions, not confirmed savings.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="editorial-section">
        <div>
          <p className="eyebrow">From statement to conversation</p>
          <h2 className="section-title mt-4">
            Less decoding.
            <br />
            More direction.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            A useful review should explain what you are looking at and help you decide what to do
            next.
          </p>
        </div>
        <GuideSteps
          items={[
            {
              title: 'Bring the itemized details',
              copy: 'Upload a supported image or PDF, or paste the statement text. UnBill reads the line items and checks the extracted totals before creating your report.',
            },
            {
              title: 'Review one charge at a time',
              copy: 'See possible repeats, panel overlaps, documentation questions and illustrative price comparisons. Open each finding to read the reason and suggested question.',
            },
            {
              title: 'Prepare a request you can verify',
              copy: 'Choose the findings you want to discuss. The letter and four phone prompts use the same selected amount, including after you revisit the report.',
            },
          ]}
        />
      </section>
      <SampleBillCards />
      <section className="editorial-section">
        <div>
          <p className="eyebrow">Built around the follow-up</p>
          <h2 className="section-title mt-4">
            A report is only
            <br />
            the beginning.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-9">
          {[
            [
              'A letter that follows your choices',
              'Print, save as PDF or copy a review request built from the charges you selected. Change the selection and the package updates with it.',
            ],
            [
              'Help when the wording is hard',
              'The optional billing coach can help turn your questions into practical language. You choose when to send a question and can stop the response.',
            ],
            [
              'A place to pick up later',
              'The local vault keeps up to 30 recent reports encrypted in this browser, so you can return to the same selection before a follow-up call.',
            ],
            [
              'Sharing you control',
              'Create a redacted report link, keep its private revocation control in your vault, and withdraw access when you no longer need it.',
            ],
          ].map(([title, copy]) => (
            <div key={title}>
              <h3 className="font-semibold tracking-tight">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{copy}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="quiet-panel grid gap-7 md:grid-cols-2">
        <div>
          <p className="eyebrow">Understand the numbers</p>
          <h2 className="section-title mt-3">
            A charge, a balance and a review amount are different.
          </h2>
        </div>
        <div className="space-y-4 text-sm leading-7 text-slate-600">
          <p>
            Gross charges describe what was billed before adjustments. A reported patient balance
            comes from the statement. Your selected review amount is the portion you want clarified,
            and it can change as you choose findings.
          </p>
          <p>
            Comparisons use illustrative reference values for supported codes. Insurance terms,
            repeat services and missing documentation can change the interpretation. The billing
            team can explain the underlying record.
          </p>
          <Link href="/about" className="text-link">
            Explore the review methodology <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
      <NextStep
        title="Start with clarity, then decide what to ask."
        copy="Explore a complete example without an account, or bring a de-identified itemized statement. You stay in control of what goes into the review request."
        href="/scan"
        label="Start your review"
      />
    </div>
  );
}
