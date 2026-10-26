import er from '../../public/samples/er_visit_broken_wrist.json';
import surgery from '../../public/samples/outpatient_surgery.json';
import { compileForensicAudit } from './rules-engine';
import { ApiError } from './api-utils';
export function sampleReport(id: string) {
  const raw = id === 'er_visit_broken_wrist' ? er : id === 'outpatient_surgery' ? surgery : null;
  if (!raw) throw new ApiError(404, 'Sample bill not found.');
  const report = compileForensicAudit(raw.items, raw.facility, raw.patient, raw.financials);
  report.id = id === 'er_visit_broken_wrist' ? 'sample_er_wrist_2026' : 'sample_surgery_2026';
  report.source = 'sample';
  return report;
}
