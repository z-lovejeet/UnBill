export type AnomalySeverity = 'HIGH' | 'MEDIUM' | 'LOW' | 'NORMAL';
export type AnomalyType =
  | 'DUPLICATE_CHARGE'
  | 'UNBUNDLED_CHARGE'
  | 'EXCESSIVE_MARKUP'
  | 'UPCODING_SEVERITY'
  | 'QUANTITY_OVERBILL';
export interface RawLineItem {
  id: string;
  code: string;
  rawDescription: string;
  dateOfService: string;
  quantity: number;
  billedAmount: number;
  modifiers?: string[];
  providerId?: string;
}
export interface AnomalyReport {
  itemId: string;
  code: string;
  parentCode?: string;
  anomalyType: AnomalyType;
  severity: AnomalySeverity;
  disputedAmount: number;
  title: string;
  explanation: string;
  remedy: string;
  statutoryBasis?: string;
}
export interface AuditedLineItem extends RawLineItem {
  plainEnglishDescription: string;
  clinicalCategory: string;
  referenceAmount: number;
  referenceRange: [number, number];
  status: AnomalySeverity;
  isDisputed: boolean;
  anomalies: AnomalyReport[];
}
export interface FacilityMetadata {
  name: string;
  address?: string;
  billingPhone?: string;
}
export interface PatientMetadata {
  accountNumber: string;
  statementDate: string;
  patientName?: string;
}
export interface FinancialSummary {
  totalBilledGross: number;
  insuranceAdjustments: number;
  patientResponsibility: number | null;
  totalPotentialSavings: number;
  riskScore: number;
}
export interface DisputePackage {
  formalLetterText: string;
  statutoryCitations: string[];
  phoneNegotiationPoints: string[];
  generatedAt: string;
}
export interface AuditReport {
  schemaVersion: 2;
  id: string;
  createdAt: string;
  facility: FacilityMetadata;
  patient: PatientMetadata;
  financials: FinancialSummary;
  items: AuditedLineItem[];
  anomalies: AnomalyReport[];
  disputePackage: DisputePackage;
  warnings: string[];
  source?: 'sample' | 'document' | 'structured' | 'shared';
}
