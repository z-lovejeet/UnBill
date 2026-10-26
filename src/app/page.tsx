import Link from 'next/link';
import { ArrowRight, FileSearch, ListChecks, MessageSquare, ShieldCheck } from 'lucide-react';
import { SampleBillCards } from '@/components/sample-bill-cards';
export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-20">
      <section className="grid gap-12 lg:grid-cols-[1.35fr_1fr] items-center">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[.18em] font-semibold text-emerald-800">
            Independent billing review assistance
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-[-.045em] leading-[1.08]">
            Understand your bill.
            <br />
            <span className="font-serif italic font-normal">Ask better questions.</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
            UnBill turns an itemized medical statement into a clear review: possible repeated
            charges, overlapping panels, price comparisons, and a letter you can check before
            sending.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/scan"
              className="inline-flex gap-2 items-center rounded-xl bg-slate-950 px-5 py-3 text-white font-semibold text-sm hover:bg-slate-800"
            >
              Review a Statement
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#sample-tests"
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold hover:bg-white"
            >
              Try a Synthetic Example
            </a>
          </div>
          <p className="text-xs leading-relaxed text-slate-500">
            Built for the Build With AI: Basics hackathon. Use synthetic or de-identified documents
            for this public demonstration. Findings are review prompts, not legal or clinical
            determinations.
          </p>
        </div>
        <div className="double-bezel">
          <div className="double-bezel-inner p-7 space-y-6">
            <p className="text-xs uppercase tracking-widest text-slate-500">
              One statement, a clearer next step
            </p>
            {[
              [
                FileSearch,
                'Read the statement',
                'Gemini extracts supported images, PDFs or pasted text.',
              ],
              [
                ListChecks,
                'Review the evidence',
                'Choose which findings to include. Amounts stay consistent across the report and letter.',
              ],
              [
                MessageSquare,
                'Prepare the conversation',
                'Print a review request, use the phone guide, or ask the streaming billing coach.',
              ],
            ].map(([Icon, title, copy]) => {
              const Symbol = Icon as typeof FileSearch;
              return (
                <div key={String(title)} className="flex gap-4">
                  <Symbol className="w-5 h-5 text-emerald-700 shrink-0 mt-1" />
                  <div>
                    <h2 className="font-semibold">{String(title)}</h2>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">{String(copy)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <SampleBillCards />
      <section className="grid md:grid-cols-3 gap-6 border-y border-slate-200 py-10">
        {[
          [
            'Your device, your history',
            'Reports are encrypted at rest in this browser. The device holds the key; other scripts with access to this origin can still access an unlocked report.',
          ],
          [
            'A defined reference catalog',
            'The 19-code catalog uses illustrative values. It is not an official CMS fee schedule or a legal price cap. Unknown codes remain unassessed.',
          ],
          [
            'Sharing you control',
            'Optional links remove direct identifiers and expire after 30 days. Procedure details remain visible to link holders; you can revoke a link from your vault.',
          ],
        ].map(([title, copy]) => (
          <div key={title}>
            <ShieldCheck className="w-5 h-5 text-emerald-700 mb-3" />
            <h2 className="font-semibold">{title}</h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">{copy}</p>
          </div>
        ))}
      </section>
      <section className="max-w-3xl space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">A review aid with clear limits</h2>
        <p className="text-slate-600 leading-relaxed">
          Repeated services can be valid. Insurance terms, billing modifiers, provider identity,
          medical necessity and financial-assistance eligibility matter. UnBill does not activate a
          collection stay, confirm fraud, promise savings, or determine the amount you legally owe.
        </p>
        <div className="flex gap-5 text-sm font-semibold">
          <Link href="/about" className="underline underline-offset-4">
            How the Review Works
          </Link>
          <Link href="/privacy" className="underline underline-offset-4">
            Data & Privacy
          </Link>
        </div>
      </section>
    </div>
  );
}
