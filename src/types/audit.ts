export type AnomalySeverity = 'HIGH' | 'MEDIUM' | 'LOW' | 'NORMAL';

export type AnomalyType = 
  | 'DUPLICATE_CHARGE' 
  | 'UNBUNDLED_CHARGE' 
  | 'EXCESSIVE_MARKUP' 
  | 'UPCODING_SEVERITY' 
  | 'QUANTITY_OVERBILL' 
  | 'OUT_OF_NETWORK_SURPRISE';

export interface RawLineItem {
  id: string;
  code: string;
  rawDescription: string;
  dateOfService: string;
  quantity: number;
  billedAmount: number;
}

export interface AuditedLineItem extends RawLineItem {
  plainEnglishDescription: string;
  clinicalCategory: string;
  benchmarkMedian: number;
  fairMarketRange: [number, number];
  status: AnomalySeverity;
  isDisputed: boolean;
  anomalies: AnomalyReport[];
}

export interface AnomalyReport {
  itemId: string;
  code: string;
  anomalyType: AnomalyType;
  severity: AnomalySeverity;
  disputedAmount: number;
  title: string;
  explanation: string;
  remedy: string;
  statutoryBasis?: string;
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
  patientResponsibility: number;
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
  id: string;
  createdAt: string;
  facility: FacilityMetadata;
  patient: PatientMetadata;
  financials: FinancialSummary;
  items: AuditedLineItem[];
  anomalies: AnomalyReport[];
  disputePackage: DisputePackage;
}
