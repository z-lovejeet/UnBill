"""Generate synthetic OCR fixtures from the same checked-in sample JSON. Requires reportlab."""
from pathlib import Path
import json, shutil
from xml.sax.saxutils import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='BillCell',fontName='Helvetica',fontSize=9,leading=13))
for name in ['er_visit_broken_wrist','outpatient_surgery']:
 report=json.loads(Path(f'public/samples/{name}.json').read_text())
 output=Path(f'output/pdf/{name}.pdf')
 story=[Paragraph('SYNTHETIC EXAMPLE - NOT A REAL PATIENT',styles['Heading3']),Paragraph(escape(report['facility']['name']),styles['Title']),Spacer(1,15)]
 for line in [f"Patient: {report['patient'].get('patientName','Synthetic Patient')}",f"Account: {report['patient']['accountNumber']}",f"Statement date: {report['patient']['statementDate']}"]:
  story.append(Paragraph(escape(line),styles['Normal']))
 story.extend([Spacer(1,20),Paragraph('ITEMIZED CHARGES',styles['Heading2'])])
 rows=[['Service date','Code','Description','Qty','Line total']]
 for i in report['items']:
  rows.append([i['dateOfService'],i['code'],Paragraph(escape(i['rawDescription']),styles['BillCell']),str(i['quantity']),f"${i['billedAmount']:,.2f}"])
 table=Table(rows,colWidths=[75,52,245,35,65],repeatRows=1,hAlign='LEFT')
 table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#0f172a')),('TEXTCOLOR',(0,0),(-1,0),colors.white),('FONTNAME',(0,0),(-1,0),'Helvetica-Bold'),('FONTSIZE',(0,0),(-1,-1),9),('VALIGN',(0,0),(-1,-1),'TOP'),('ALIGN',(-1,1),(-1,-1),'RIGHT'),('TOPPADDING',(0,0),(-1,-1),10),('BOTTOMPADDING',(0,0),(-1,-1),10),('LINEBELOW',(0,0),(-1,-1),.5,colors.HexColor('#e2e8f0'))]))
 story.extend([table,Spacer(1,22),Paragraph(f"Gross total: ${report['financials']['totalBilledGross']:,.2f}",styles['Heading2']),Paragraph(f"Insurance adjustments: ${report['financials']['insuranceAdjustments']:,.2f}",styles['Normal']),Paragraph(f"Patient balance: ${report['financials']['patientResponsibility']:,.2f}",styles['Normal']),Spacer(1,20),Paragraph('Testing fixture only. All names, accounts and charges are synthetic. This document is not a treatment record or a payment request.',styles['Normal'])])
 SimpleDocTemplate(str(output),pagesize=letter,rightMargin=70,leftMargin=35,topMargin=35,bottomMargin=35).build(story)
 shutil.copyfile(output,f'public/samples/{name}.pdf')
 print(output)
