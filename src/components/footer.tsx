import Link from 'next/link';
export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-10 mt-auto text-xs text-slate-500 print:hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row gap-6 justify-between">
        <p className="max-w-xl leading-relaxed">
          UnBill provides educational billing review assistance. Findings and illustrative
          comparisons require verification; they do not establish legal rights, medical necessity or
          guaranteed savings.
        </p>
        <div className="flex flex-wrap gap-5 shrink-0">
          <Link href="/about" className="underline">
            Methodology
          </Link>
          <Link href="/privacy" className="underline">
            Data Notice
          </Link>
          <a
            href="https://github.com/challengepost/learn-ai-basics"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Devpost Skill Pack
          </a>
        </div>
      </div>
    </footer>
  );
}
