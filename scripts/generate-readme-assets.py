#!/usr/bin/env python3
"""Generate self-contained README SVG illustrations using only the standard library.

Run from any directory: python3 scripts/generate-readme-assets.py
The drawings explain implemented behavior; none is a captured application screen.
"""
from pathlib import Path
import xml.etree.ElementTree as ET

OUT = Path(__file__).resolve().parents[1] / 'docs' / 'assets' / 'readme'
OUT.mkdir(parents=True, exist_ok=True)
NS = 'http://www.w3.org/2000/svg'
ET.register_namespace('', NS)
C = dict(ink='#142821', muted='#56665F', pine='#116149', mint='#DDF3E8',
         canvas='#F7FAF7', line='#DCE5DE', white='#FFFFFF', sky='#E9F3FC',
         blue='#245D85', amber='#FFF3D8', ochre='#855715', rose='#FCE9E7', red='#9B423C')


def el(parent, tag, **attrs):
    return ET.SubElement(parent, f'{{{NS}}}{tag}', {k.replace('_', '-'): str(v) for k, v in attrs.items()})


class Art:
    def __init__(self, name, title, desc, height=460, width=1280):
        self.name, self.w, self.h = name, width, height
        self.root = ET.Element(f'{{{NS}}}svg', dict(width=str(width), height=str(height),
            viewBox=f'0 0 {width} {height}', role='img', **{'aria-labelledby': 'title desc'}))
        el(self.root, 'title', id='title').text = title
        el(self.root, 'desc', id='desc').text = desc
        self.rect(0, 0, width, height, C['canvas'], radius=24)
        if width > 400:
            self.text(46, 42, 'UNBILL  /  PRODUCT & ENGINEERING GUIDE', 11, C['pine'], 700, spacing=2)
            self.text(46, 87, title, 30, C['ink'], 700)
            self.text(46, height - 22, 'UnBill  •  Read the charge. Understand the concern. Prepare the next step.', 12, C['muted'])

    def rect(self, x, y, w, h, fill, stroke='none', radius=16):
        el(self.root, 'rect', x=x, y=y, width=w, height=h, rx=radius, fill=fill, stroke=stroke)

    def text(self, x, y, value, size=18, fill=None, weight=400, spacing=0):
        el(self.root, 'text', x=x, y=y, fill=fill or C['ink'], font_size=size,
           font_family='Arial, Helvetica, sans-serif', font_weight=weight, letter_spacing=spacing).text = value

    def lines(self, x, y, values, size=17, fill=None, gap=28, weight=400):
        for n, value in enumerate(values):
            self.text(x, y + n * gap, value, size, fill, weight)

    def arrow(self, x1, y1, x2, y2, color=None):
        color = color or C['pine']
        el(self.root, 'path', d=f'M{x1} {y1} L{x2} {y2}', fill='none', stroke=color, stroke_width=2)
        if abs(x2 - x1) >= abs(y2 - y1):
            d = 1 if x2 >= x1 else -1
            points = f'{x2},{y2} {x2-d*8},{y2-5} {x2-d*8},{y2+5}'
        else:
            d = 1 if y2 >= y1 else -1
            points = f'{x2},{y2} {x2-5},{y2-d*8} {x2+5},{y2-d*8}'
        el(self.root, 'polygon', points=points, fill=color)

    def card(self, x, y, w, h, tag, title, lines, fill=None, accent=None, size=17):
        self.rect(x, y, w, h, fill or C['white'], C['line'])
        self.text(x+22, y+32, tag, 11, accent or C['pine'], 700, spacing=1.5)
        self.text(x+22, y+66, title, 22, C['ink'], 700)
        self.lines(x+22, y+100, lines, size, C['muted'], gap=27)

    def save(self):
        ET.indent(self.root, space='  ')
        ET.ElementTree(self.root).write(OUT / self.name, encoding='utf-8', xml_declaration=True)


# The hero is editorial artwork, not a screenshot or a claimed customer outcome.
a = Art('hero.svg', 'Understand the bill. Prepare the conversation.',
        'UnBill turns an itemized statement into explained findings, a selected-charge letter, a phone script and controlled sharing.', 560)
a.rect(32, 112, 1216, 387, C['ink'], radius=22)
a.text(70, 180, 'UnBill', 70, C['white'], 700, spacing=-3)
a.lines(74, 237, ['Your bill. In plain English.', 'Your next step.'], 33, '#C4EBD7', gap=44, weight=500)
a.lines(74, 356, ['Review itemized charges. Ask specific questions.', 'Keep the report, letter and phone script aligned.'], 19, '#D6E2DB', gap=31)
a.rect(74, 433, 320, 35, '#244A3C', radius=8)
a.text(89, 456, 'NO ACCOUNT NEEDED  ·  MIT LICENSE', 12, '#DAF6E6', 700, spacing=1)
for j, (num, title, body, color) in enumerate([
    ('01', 'Read', 'Images, PDFs or pasted text', C['mint']),
    ('02', 'Review', 'Clear findings tied to each charge', C['amber']),
    ('03', 'Prepare', 'Letter, call script and next steps', C['sky']),
]):
    y=151+j*105
    a.rect(723, y, 480, 88, color, radius=14)
    a.text(746, y+36, num, 17, C['pine'], 700)
    a.text(791, y+34, title, 22, C['ink'], 700)
    a.text(791, y+63, body, 16, C['muted'])
a.save()


a = Art('journey.svg', 'One connected journey, from statement to follow-up.',
        'Four stages: bring an itemized statement, understand the findings, prepare the request, and manage saved reports and shared access.', 380)
steps=[('01 / INTAKE','Bring the details',['Upload a file or paste text.','Consent before extraction.'],C['white']),
       ('02 / REVIEW','Understand each charge',['See the concern and reason.','Choose what to question.'],C['mint']),
       ('03 / PREPARE','Start the conversation',['Copy a letter. Read a script.','Ask the optional coach.'],C['sky']),
       ('04 / CONTROL','Return or share',['Reopen encrypted history.','Revoke a redacted link.'],C['amber'])]
for i,(tag,title,lines,fill) in enumerate(steps):
    x=46+i*300
    a.card(x,125,278,195,tag,title,lines,fill,size=16)
    if i<3: a.arrow(x+280,221,x+297,221)
a.save()


a = Art('features.svg', 'A complete workspace for the billing conversation.',
        'Six product capabilities: flexible intake, readable results, synchronized preparation, conversational help, device history and revocable sharing.', 615)
features=[('INPUT','Readable source',['PNG, JPEG, WebP, PDF or text.','Synthetic examples for exploration.'],C['white']),
          ('RESULTS','Explain the concern',['Named findings and source details.','Separate charges, balance and review.'],C['amber']),
          ('PREPARATION','Keep figures aligned',['Selected-charge review letter.','Read-aloud script, copy and PDF.'],C['mint']),
          ('COACH','Ask a follow-up',['Streaming, formatted answers.','Separate consent and minimized context.'],C['sky']),
          ('VAULT','Pick up later',['Up to 30 browser-encrypted reports.','Reopen the same review and selection.'],C['white']),
          ('SHARING','Control a separate copy',['Redacted link with 30-day expiration.','Private creator control for revocation.'],C['rose'])]
for i,(tag,title,lines,fill) in enumerate(features):
    a.card(46+(i%3)*402,125+(i//3)*218,382,196,tag,title,lines,fill,size=16)
a.save()


a = Art('findings.svg', 'Specific questions, connected to the source charge.',
        'The review detects possible duplicates, panel overlap, illustrative price differences, quantity questions and visit-level documentation questions.', 525)
rows=[('Possible duplicate charge','Matching code, date and amount: was the service performed twice?',C['rose'],C['red']),
      ('Test may already be included','A recognized component appears with its panel on the same date.',C['amber'],C['ochre']),
      ('Above example price','An illustrative comparison invites a pricing explanation.',C['sky'],C['blue']),
      ('Check the number of units','Ask for the record supporting the quantity on the statement.',C['mint'],C['pine']),
      ('Check the visit level','Request the documentation supporting the emergency visit code.',C['white'],C['muted'])]
for i,(label,body,fill,color) in enumerate(rows):
    y=122+i*70
    a.rect(46,y,1188,58,fill,C['line'],radius=10)
    el(a.root,'circle',cx=69,cy=y+29,r=5,fill=color)
    a.text(87,y+35,label,17,color,700)
    a.text(409,y+35,body,16,C['muted'])
a.save()


a = Art('money.svg', 'Three amounts. Three different meanings.',
        'Synthetic ER example: original gross charges 3820 dollars, reported patient balance 2620 dollars, initial selected review amount 2717 dollars 50 cents. The review amount is not savings or a new balance.', 390)
for i,(tag,value,lines,fill) in enumerate([
    ('TOTAL ON THE BILL','$3,820.00',['Original itemized charges.','Before adjustments and payments.'],C['sky']),
    ('BALANCE ON THE STATEMENT','$2,620.00',['Reported patient responsibility.','Preserved from the source.'],C['mint']),
    ('AMOUNT TO QUESTION','$2,717.50',['Selected portions of gross charges.','Not a refund or a revised balance.'],C['amber'])]):
    x=46+i*402
    a.rect(x,124,382,190,fill,C['line'])
    a.text(x+22,158,tag,11,C['muted'],700,spacing=1)
    a.text(x+22,211,value,35,C['ink'],700)
    a.lines(x+22,250,lines,16,C['muted'],gap=25)
a.text(46,347,'Synthetic ER example • Initial selection • Do not subtract the review amount from the patient balance.',15,C['pine'],500)
a.save()


a = Art('selection.svg', 'Change a selection. Keep every output in step.',
        'Selected items are recalculated once per line, then the same selected amount is used in the report, letter, phone script and saved report.', 405)
a.card(46,145,304,185,'YOUR CHOICE','Selected charges',['Include or exclude each item.','Keep the question specific.'],C['mint'],size=16)
a.arrow(350,237,396,237)
a.card(398,145,350,185,'ONE CALCULATION','One amount per line',['Use the largest supported portion.','Cap it at that line’s billed charge.'],C['white'],size=16)
a.arrow(748,237,794,237)
a.rect(796,124,438,228,C['sky'],C['line'])
a.text(819,155,'SYNCHRONIZED OUTPUTS',11,C['blue'],700,spacing=1)
for i,label in enumerate(['Report summary','Review letter','Phone script','Saved selection']):
    y=181+i*38
    a.text(824,y+12,'✓',18,C['pine'],700)
    a.text(853,y+12,label,18,C['ink'],500)
a.save()


a = Art('architecture.svg', 'Clear boundaries between product, processing and storage.',
        'The browser calls Next.js routes. Audit uses Gemini plus validation and deterministic rules. Chat uses Groq. Share and request guards use Redis. Browser persistence is encrypted locally.', 705)
a.card(46,126,1188,130,'BROWSER / NEXT.JS + REACT','Intake → report → preparation → coach → vault',
       ['Zustand state · encrypted local history · explicit processing and sharing choices'],C['mint'],size=18)
for x in [225,640,1055]: a.arrow(x,256,x,301)
for x,tag,title,lines in [
    (46,'POST /api/audit','Audit route',['Parse and validate input.','Extract → validate → run rules.']),
    (448,'POST /api/chat','Coach route',['Minimize the report context.','Stream a contextual answer.']),
    (850,'POST / GET / DELETE','Share routes',['Rebuild and redact a copy.','Create, read or revoke access.'])]:
    a.card(x,303,384,177,tag,title,lines,C['white'],size=16)
for x in [225,640,1055]: a.arrow(x,480,x,523)
a.card(46,525,384,119,'GOOGLE GEMINI','Document extraction',['Structured statement fields'],C['sky'],size=15)
a.card(448,525,384,119,'GROQ','Conversational assistance',['Text streaming; no bill modification'],C['sky'],size=15)
a.card(850,525,384,119,'UPSTASH REDIS','Shared state',['Redacted copies + request counters'],C['amber'],size=15)
a.save()


a = Art('model-routing.svg', 'Spend primary quota deliberately. Keep a bounded fallback.',
        'Redis reserves at most eighteen primary attempts per Pacific day. Eligible requests try Gemini 3.8 Flash for at most eighteen seconds; otherwise or on transient failure the request uses Gemini 3.5 Flash-Lite within one ninety-second extraction deadline.', 475)
a.card(46,131,325,190,'SHARED PRIMARY LEDGER','Reserve before calling',['18 attempts per Pacific day.','Count failed attempts as well.','Skip primary when not available.'],C['mint'],size=16)
a.arrow(371,195,418,195)
a.card(420,131,357,190,'PRIMARY / UP TO 18 SECONDS','Gemini 3.8 Flash',['Low thinking; structured output.','Try only with a reserved attempt.','Transient failure → fallback.'],C['white'],size=16)
a.arrow(777,222,824,222)
a.card(826,131,408,190,'FALLBACK / TIME REMAINING','Gemini 3.5 Flash-Lite',['Also used directly after the cap.','Uses the remaining extraction window.','No automatic sample substitution.'],C['sky'],size=16)
a.arrow(208,323,208,356)
a.arrow(208,356,1029,356)
a.arrow(1029,356,1029,323)
a.text(454,348,'Primary skipped: route directly to fallback',15,C['pine'],500)
a.rect(46,384,1188,40,C['amber'],radius=9)
a.text(65,410,'90s extraction deadline  ·  120s audit route  ·  125s browser request  ·  separate 200/day default AI budget',16,C['ochre'],500)
a.save()


a = Art('privacy.svg', 'Four data boundaries, each with a clear purpose.',
        'Browser: encrypted reports and private share controls. Gemini: consented document or text input. Groq: consented questions and minimized report context. Redis: explicitly shared redacted reports and request counters.', 430)
for i,(tag,title,lines,fill) in enumerate([
    ('DEVICE','Local vault',['Encrypted report history.','Private share controls.','No account-based sync.'],C['mint']),
    ('CONSENT TO EXTRACT','Gemini',['Uploaded file or pasted text.','Structured extraction.','Provider terms apply.'],C['sky']),
    ('CONSENT TO CHAT','Groq',['Questions + minimized context.','Typed text is still transmitted.','No names in generated context.'],C['white']),
    ('CONSENT TO SHARE','Redis share copy',['Direct identifiers removed.','Procedures + amounts remain.','Link holders can read it.'],C['amber'])]):
    a.card(46+i*300,125,278,234,tag,title,lines,fill,size=15)
a.save()


a = Art('vault.svg', 'Encrypted history, owned by this browser profile.',
        'AES-256-GCM ciphertext is stored in localStorage. A nonextractable CryptoKey is stored separately in IndexedDB. Up to thirty reports can be reopened. This is not password protection or account recovery.', 410)
a.card(46,126,350,193,'BROWSER STATE','Reports + share controls',['Up to 30 recent reviews.','Selections remain connected.','No server account to restore them.'],C['white'],size=16)
a.arrow(396,220,443,220)
a.card(445,126,350,193,'WEB CRYPTO','AES-256-GCM',['Random IV for each encryption.','Authenticated ciphertext at rest.','Device key in IndexedDB.'],C['mint'],size=16)
a.arrow(795,220,842,220)
a.card(844,126,390,193,'LOCAL PERSISTENCE','Encrypted localStorage',['Reopen on the same browser profile.','Delete local reports independently.','Clearing site data can lose access.'],C['sky'],size=16)
a.text(46,358,'The device key is not a password boundary. Same-origin scripts can access an opened report.',16,C['muted'])
a.save()


a = Art('sharing.svg', 'A shared report is a separate, revocable copy.',
        'Choose to share, redact direct identifiers, create a cryptographic link, then revoke access or allow expiry. Downloaded copies are outside link revocation.', 400)
for i,(tag,title,lines,fill) in enumerate([
    ('01 / CHOOSE','Separate consent',['Procedures and amounts','will remain visible.'],C['white']),
    ('02 / REDACT','Remove identifiers',['Patient, account, contacts','and service dates.'],C['mint']),
    ('03 / PUBLISH','Create the link',['256-bit random identifier.','Up to 30 days in Redis.'],C['sky']),
    ('04 / WITHDRAW','Revoke or expire',['Creator’s private control','removes server access.'],C['rose'])]):
    x=46+i*300
    a.card(x,126,278,198,tag,title,lines,fill,size=16)
    if i<3:a.arrow(x+280,224,x+297,224)
a.text(46,359,'Deleting a local report does not revoke a link. Revocation cannot erase copies already downloaded.',15,C['muted'])
a.save()


a = Art('verification.svg', 'A repeatable local check, plus optional live verification.',
        'npm run check executes lint, TypeScript checking, offline tests and production build. A separate live smoke suite uses synthetic data and consumes provider requests.', 360)
for i,(title,body) in enumerate([('Lint','Code standards'),('Types','Schema-aware interfaces'),('Tests','Offline regression coverage'),('Build','Next.js production bundle')]):
    x=46+i*300
    a.rect(x,127,278,108,C['white'],C['line'])
    a.text(x+20,164,f'0{i+1}',13,C['pine'],700)
    a.text(x+57,165,title,22,C['ink'],700)
    a.text(x+20,207,body,16,C['muted'])
    if i<3:a.arrow(x+280,181,x+297,181)
a.rect(46,259,1188,44,C['mint'],radius=9)
a.text(66,287,'npm run check  /  Offline checks                 npm run test:live  /  Configured services + synthetic input',17,C['pine'],500)
a.save()

# Small local badges avoid external badge services and remote font dependencies.
for slug,label,value,accent in [
    ('node','Node.js','22.x',C['pine']),('next','Next.js','15',C['ink']),
    ('react','React','19',C['blue']),('typescript','TypeScript','strict',C['blue']),
    ('tailwind','Tailwind','3',C['blue']),('gemini','Gemini','extraction',C['pine']),
    ('groq','Groq','coach',C['ochre']),('license','License','MIT',C['pine'])]:
    w=round(24+len(label)*7.2+20+len(value)*7.2)
    b=Art(f'badge-{slug}.svg',f'{label}: {value}',f'{label} {value}',30,w)
    b.rect(0,0,w,30,C['white'],C['line'],radius=7)
    left=round(18+len(label)*7.2)
    b.rect(left,1,w-left-1,28,accent,radius=6)
    b.text(10,20,label,12,C['muted'],600)
    b.text(left+10,20,value,12,C['white'],700)
    b.save()

print(f'Generated {len(list(OUT.glob("*.svg")))} SVG files in {OUT.relative_to(OUT.parents[2])}')
