import { z } from 'zod';
export const MAX_FILE_BYTES = 2_500_000;
export const MAX_ITEMS = 200;
const text = (max: number) => z.string().trim().max(max);
const money = z
  .number()
  .finite()
  .min(0)
  .max(100_000_000)
  .refine(
    (n) => Math.abs(n * 100 - Math.round(n * 100)) < 0.0001,
    'Use amounts with at most two decimal places.',
  );
const date = text(10).refine(
  (v) =>
    v === '' ||
    (/^\d{4}-\d{2}-\d{2}$/.test(v) &&
      !isNaN(Date.parse(v)) &&
      new Date(v + 'T00:00:00Z').toISOString().slice(0, 10) === v),
  'Use a valid YYYY-MM-DD service date, or leave it blank if unknown.',
);
export const lineItemSchema = z.object({
  id: text(80).min(1),
  code: text(30).default(''),
  rawDescription: text(500).min(1),
  dateOfService: date.default(''),
  quantity: z.number().int().min(1).max(10000),
  billedAmount: money,
  modifiers: z
    .array(text(4).regex(/^[A-Za-z0-9]{2}$/))
    .max(8)
    .optional(),
  providerId: text(100).optional(),
});
export const facilitySchema = z.object({
  name: text(200).min(1),
  address: text(500).optional(),
  billingPhone: text(40).optional(),
});
export const patientSchema = z.object({
  accountNumber: text(100).min(1),
  statementDate: date.default(''),
  patientName: text(200).optional(),
});
export const rawBillSchema = z
  .object({
    isMedicalBill: z.boolean().optional(),
    rejectionReason: text(500).nullable().optional(),
    facility: facilitySchema.default({ name: 'Not provided' }),
    patient: patientSchema.default({ accountNumber: 'Not provided', statementDate: '' }),
    items: z.array(lineItemSchema).min(1).max(MAX_ITEMS),
    financials: z
      .object({
        totalBilledGross: money.optional(),
        insurancePaid: money.optional(),
        insuranceAdjustments: money.optional(),
        patientBalanceDue: money.nullable().optional(),
        patientResponsibility: money.nullable().optional(),
      })
      .optional(),
  })
  .superRefine((b, ctx) => {
    if (b.isMedicalBill === false)
      ctx.addIssue({
        code: 'custom',
        message: 'The supplied document is not an itemized medical bill.',
      });
    const ids = new Set<string>();
    for (const [index, item] of b.items.entries()) {
      if (ids.has(item.id))
        ctx.addIssue({
          code: 'custom',
          path: ['items', index, 'id'],
          message: 'Line item IDs must be unique.',
        });
      ids.add(item.id);
    }
    const sum = Math.round(b.items.reduce((s, i) => s + i.billedAmount, 0) * 100) / 100;
    if (sum > 100_000_000)
      ctx.addIssue({
        code: 'custom',
        message: 'The supported statement total is at most $100 million.',
      });
    if (
      b.financials?.totalBilledGross !== undefined &&
      Math.abs(sum - b.financials.totalBilledGross) > 0.02
    )
      ctx.addIssue({
        code: 'custom',
        path: ['financials', 'totalBilledGross'],
        message:
          'Item charges do not reconcile to the gross total. Check extraction or supply the complete itemized statement.',
      });
  });
export const extractionSchema = z
  .object({
    isMedicalBill: z.boolean(),
    rejectionReason: text(500).nullable().optional(),
    facility: facilitySchema,
    patient: patientSchema,
    financials: z.object({
      totalBilledGross: money,
      insurancePaid: money.optional(),
      patientBalanceDue: money.nullable(),
    }),
    items: z.array(lineItemSchema).max(MAX_ITEMS),
  })
  .superRefine((b, ctx) => {
    if (b.isMedicalBill) {
      const result = rawBillSchema.safeParse(b);
      if (!result.success)
        for (const issue of result.error.issues) ctx.addIssue({ ...issue, path: issue.path });
    }
  });
export const chatSchema = z
  .object({
    consent: z.literal(true),
    messages: z
      .array(z.object({ role: z.enum(['user', 'assistant']), content: text(4000).min(1) }))
      .min(1)
      .max(20),
    auditContext: z.unknown().optional(),
  })
  .refine((b) => b.messages.at(-1)?.role === 'user', 'The last message must be from the user.');
export function validationMessage(error: z.ZodError) {
  const issue = error.issues[0];
  return `${issue.path.join('.') || 'Request'}: ${issue.message}`;
}
const anomalySchema = z.object({
  itemId: text(80).min(1),
  code: text(30),
  parentCode: text(30).optional(),
  anomalyType: z.enum([
    'DUPLICATE_CHARGE',
    'UNBUNDLED_CHARGE',
    'EXCESSIVE_MARKUP',
    'UPCODING_SEVERITY',
    'QUANTITY_OVERBILL',
  ]),
  severity: z.enum(['HIGH', 'MEDIUM', 'LOW', 'NORMAL']),
  disputedAmount: money,
  title: text(200),
  explanation: text(2000),
  remedy: text(2000),
  statutoryBasis: text(500).optional(),
});
export const reportSchema = z
  .object({
    schemaVersion: z.literal(2),
    id: text(120).regex(/^[A-Za-z0-9_-]+$/),
    createdAt: z.string().datetime(),
    source: z.enum(['sample', 'document', 'structured', 'shared']).optional(),
    facility: facilitySchema,
    patient: patientSchema,
    items: z
      .array(
        lineItemSchema.extend({
          plainEnglishDescription: text(1000),
          clinicalCategory: text(200),
          referenceAmount: money,
          referenceRange: z.tuple([money, money]),
          status: z.enum(['HIGH', 'MEDIUM', 'LOW', 'NORMAL']),
          isDisputed: z.boolean(),
          anomalies: z.array(anomalySchema).max(8),
        }),
      )
      .min(1)
      .max(MAX_ITEMS),
    anomalies: z.array(anomalySchema).max(MAX_ITEMS * 8),
    warnings: z.array(text(1000)).max(20),
    financials: z.object({
      totalBilledGross: money,
      insuranceAdjustments: money,
      patientResponsibility: money.nullable(),
      totalPotentialSavings: money,
      riskScore: z.number().int().min(0).max(100),
    }),
    disputePackage: z.object({
      formalLetterText: text(200000),
      statutoryCitations: z.array(text(3000)).max(10),
      phoneNegotiationPoints: z.array(text(3000)).max(10),
      generatedAt: z.string().datetime(),
    }),
  })
  .superRefine((r, ctx) => {
    const ids = new Set(r.items.map((i) => i.id));
    if (ids.size !== r.items.length)
      ctx.addIssue({ code: 'custom', message: 'Report IDs must be unique.' });
    if (
      r.anomalies.some((a) => !ids.has(a.itemId)) ||
      r.items.some((i) =>
        i.anomalies.some((a) => a.itemId !== i.id || a.disputedAmount > i.billedAmount),
      )
    )
      ctx.addIssue({
        code: 'custom',
        message: 'Report findings must refer to their matching billed items.',
      });
    const total = Math.round(r.items.reduce((s, i) => s + i.billedAmount, 0) * 100) / 100;
    if (Math.abs(total - r.financials.totalBilledGross) > 0.02)
      ctx.addIssue({ code: 'custom', message: 'Report amounts do not reconcile.' });
  });
