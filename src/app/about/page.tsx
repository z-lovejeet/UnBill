import Link from 'next/link';
import metadata from '../../../data/benchmark_metadata.json';
export default function About() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-emerald-800">Methodology</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">How UnBill Reviews a Statement</h1>
      </header>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Read, Validate, Compare, Prepare</h2>
        <p className="text-slate-600 leading-relaxed">
          Gemini extracts supported statement images, PDFs and pasted text into structured fields.
          The server validates types, nonnegative charges, positive quantities, unique item IDs and
          reconciliation of line totals. Missing dates and codes remain unknown. Unreadable,
          incomplete or unsupported credit statements require manual review.
        </p>
        <p className="text-slate-600 leading-relaxed">
          TypeScript rules identify possible repeated charges, catalog panel overlaps and
          differences from illustrative reference values. The review letter and four phone prompts
          are generated deterministically from your selected items, using one non-overlapping amount
          per item. Groq supplies optional streaming coaching, with identifiers omitted from bill
          context.
        </p>
      </section>
      <section className="rounded-xl border border-amber-200 bg-amber-50 p-6 space-y-3">
        <h2 className="text-xl font-semibold">A Limited Demonstration Catalog</h2>
        <p className="text-sm leading-relaxed">{metadata.notice}</p>
        <p className="text-sm">
          Version {metadata.version} · {metadata.coverage} supported codes. The 1.5× comparison and
          review thresholds are product heuristics, not government rules. Unknown codes receive no
          reference price.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Findings Need Human Verification</h2>
        <p className="text-slate-600 leading-relaxed">
          Same-day repeats may be appropriate. Modifiers, provider identity, medical necessity,
          insurance contracts, hospital type and financial-assistance eligibility can change the
          interpretation. A line-item bill alone cannot establish emergency-department upcoding or
          fraud. The tool does not calculate a legally required payment, guarantee savings, or
          activate a collection or credit-reporting stay.
        </p>
        <p className="text-slate-600 leading-relaxed">
          Reference coding concepts are explained in the{' '}
          <a
            className="underline"
            href={metadata.codingReferences[0]}
            target="_blank"
            rel="noreferrer"
          >
            CMS NCCI FAQ
          </a>{' '}
          and{' '}
          <a
            className="underline"
            href={metadata.codingReferences[1]}
            target="_blank"
            rel="noreferrer"
          >
            AMA E/M descriptors
          </a>
          . These sources do not validate UnBill&apos;s illustrative dollar values.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">What a Sample Proves</h2>
        <p className="text-slate-600 leading-relaxed">
          Synthetic examples run the same deterministic engine and report workflow without sending
          documents to an AI provider. A sample success does not verify OCR, provider latency or
          clinical correctness. Live provider checks and test results are documented separately in
          the repository.
        </p>
      </section>
      <Link
        href="/scan"
        className="inline-block rounded-xl bg-slate-950 text-white px-5 py-3 text-sm font-semibold"
      >
        Start a Review
      </Link>
    </article>
  );
}
