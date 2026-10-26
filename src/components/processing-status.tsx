import { Check, Loader2 } from 'lucide-react';
export type ProcessingPhase = 'reading' | 'request' | 'saving';
export function ProcessingStatus({ phase, sample }: { phase: ProcessingPhase; sample: boolean }) {
  const current = ['reading', 'request', 'saving'].indexOf(phase);
  const steps = [
    [
      'Prepare the input',
      sample ? 'Load the synthetic statement.' : 'Read your chosen file or pasted text.',
    ],
    [
      'Read, validate and review',
      sample
        ? 'Run the example through the billing-review rules.'
        : 'Extract the statement, validate its figures and run the review checks.',
    ],
    [
      'Open your report',
      'Save the encrypted report in this browser and prepare the itemized view.',
    ],
  ];
  return (
    <section role="status" aria-live="polite" className="surface p-6 sm:p-8 space-y-6">
      <div className="flex gap-3 items-center">
        <Loader2 className="h-5 w-5 text-emerald-700 animate-spin shrink-0" />
        <div>
          <h2 className="font-semibold">Your review is in progress</h2>
          <p className="text-xs text-slate-500 mt-1">
            Keep this tab open while your report is prepared.
          </p>
        </div>
      </div>
      <ol className="space-y-5">
        {steps.map(([title, copy], index) => (
          <li
            key={title}
            className="flex gap-3"
            aria-current={index === current ? 'step' : undefined}
          >
            <span
              className={
                'h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-xs font-mono ' +
                (index <= current
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'bg-slate-100 text-slate-400')
              }
            >
              {index < current ? <Check className="h-3.5 w-3.5" /> : index + 1}
            </span>
            <div>
              <p
                className={
                  'text-sm font-semibold ' + (index > current ? 'text-slate-400' : 'text-slate-900')
                }
              >
                {title}
              </p>
              <p className="text-xs text-slate-500 leading-6 mt-1">{copy}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="text-xs leading-6 text-slate-500">
        We will open the report when reading and review are complete. If the source cannot be read
        reliably, you will get an explanation and a chance to retry.
      </p>
    </section>
  );
}
