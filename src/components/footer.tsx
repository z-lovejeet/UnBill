import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-auto print:hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="max-w-md">
            <Link href="/" className="text-2xl font-bold tracking-[-0.04em]">
              UnBill<span className="text-emerald-700">.</span>
            </Link>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Understand the statement. Choose your questions. Prepare for a clearer billing
              conversation.
            </p>
          </div>
          <nav
            aria-label="Footer"
            className="flex flex-wrap content-start gap-x-7 gap-y-4 text-sm font-medium"
          >
            <Link href="/scan" className="hover:text-emerald-800">
              Review a statement
            </Link>
            <Link href="/history" className="hover:text-emerald-800">
              Local vault
            </Link>
            <Link href="/about" className="hover:text-emerald-800">
              About
            </Link>
            <Link href="/privacy" className="hover:text-emerald-800">
              Privacy
            </Link>
          </nav>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-5 text-xs text-slate-500">
          <p className="max-w-2xl leading-6">
            Educational billing review assistance. Findings and illustrative comparisons need
            verification; they do not establish legal rights, clinical conclusions or guaranteed
            savings.
          </p>
          <div className="flex gap-5 shrink-0 items-start">
            <a
              href="https://github.com/z-lovejeet/UnBill"
              target="_blank"
              rel="noreferrer"
              className="inline-flex gap-1 items-center hover:text-emerald-800"
            >
              Source <ArrowUpRight className="h-3 w-3" />
            </a>
            <a
              href="https://github.com/z-lovejeet/UnBill/blob/main/LICENSE"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-800"
            >
              MIT License
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
