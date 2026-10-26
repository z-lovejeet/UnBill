import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';

export function PageIntro({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  children?: ReactNode;
}) {
  return (
    <header className="space-y-5">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="page-title">{title}</h1>
      <p className="page-lede">{description}</p>
      {children}
    </header>
  );
}

export function GuideSteps({ items }: { items: { title: string; copy: string }[] }) {
  return (
    <ol className="guide-steps">
      {items.map((item, index) => (
        <li key={item.title} className="flex gap-5">
          <span className="step-number" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="min-w-0">
            <h3 className="font-semibold tracking-tight">{item.title}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">{item.copy}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function NextStep({
  title,
  copy,
  href,
  label,
}: {
  title: string;
  copy: string;
  href: string;
  label: string;
}) {
  return (
    <section className="next-step print:hidden">
      <div className="max-w-xl">
        <p className="eyebrow">Your next step</p>
        <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{copy}</p>
      </div>
      <Link href={href} className="action-primary shrink-0">
        {label}
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
