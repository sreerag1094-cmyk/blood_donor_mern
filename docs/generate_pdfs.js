import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class PDFBuilder {
  constructor(title, docType = 'SRS') {
    this.title = title
    this.docType = docType
    this.pages = []
    this.currentPage = null
    this.y = 790
    this.pageWidth = 595.28
    this.pageHeight = 841.89
    this.margin = 45
    this.contentWidth = this.pageWidth - this.margin * 2
  }

  escape(str) {
    if (!str) return ''
    return String(str)
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, '--')
      .replace(/[\u2022]/g, '-')
      .replace(/[^\x20-\x7E]/g, ' ')
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
  }

  addPage(isCover = false) {
    this.currentPage = {
      isCover,
      ops: [],
    }
    this.pages.push(this.currentPage)
    this.y = 790
    return this.currentPage
  }

  checkPageBreak(neededHeight = 25) {
    if (this.y - neededHeight < 65) {
      this.addPage(false)
      this.drawHeader()
    }
  }

  drawHeader() {
    if (this.currentPage.isCover) return
    const op = `
q
0.5 0.5 0.5 RG
0.5 w
${this.margin} 805 m ${this.pageWidth - this.margin} 805 l S
BT
/F1 8 Tf
0.4 0.4 0.4 rg
${this.margin} 810 Td (${this.escape(this.title)} -- ${this.escape(this.docType)}) Tj
ET
Q`
    this.currentPage.ops.push(op)
  }

  drawFooter(pageNum, totalPages) {
    if (this.currentPage.isCover) return
    const op = `
q
0.7 0.7 0.7 RG
0.5 w
${this.margin} 45 m ${this.pageWidth - this.margin} 45 l S
BT
/F1 8 Tf
0.4 0.4 0.4 rg
${this.margin} 32 Td (LifeLink HealthTech Engineering | IEEE Std 830-1998) Tj
${this.pageWidth - this.margin - 60} 32 Td (Page ${pageNum} of ${totalPages}) Tj
ET
Q`
    this.currentPage.ops.push(op)
  }

  addTitle(text) {
    this.checkPageBreak(40)
    const op = `
BT
/F2 18 Tf
0.85 0.1 0.1 rg
${this.margin} ${this.y} Td (${this.escape(text)}) Tj
ET`
    this.currentPage.ops.push(op)
    this.y -= 28
  }

  addHeading1(text) {
    this.checkPageBreak(35)
    this.y -= 8
    const op = `
q
0.95 0.95 0.97 rg
${this.margin} ${this.y - 4} ${this.contentWidth} 22 re f
0.8 0.1 0.1 rg
${this.margin} ${this.y - 4} 3 22 re f
BT
/F2 12 Tf
0.1 0.1 0.2 rg
${this.margin + 8} ${this.y + 2} Td (${this.escape(text)}) Tj
ET
Q`
    this.currentPage.ops.push(op)
    this.y -= 26
  }

  addHeading2(text) {
    this.checkPageBreak(25)
    this.y -= 4
    const op = `
BT
/F2 10.5 Tf
0.2 0.2 0.4 rg
${this.margin} ${this.y} Td (${this.escape(text)}) Tj
ET`
    this.currentPage.ops.push(op)
    this.y -= 18
  }

  addParagraph(text) {
    const lines = this.wrapText(text, 95)
    for (const line of lines) {
      this.checkPageBreak(14)
      const op = `
BT
/F1 9 Tf
0.2 0.2 0.2 rg
${this.margin} ${this.y} Td (${this.escape(line)}) Tj
ET`
      this.currentPage.ops.push(op)
      this.y -= 13
    }
    this.y -= 4
  }

  addBullet(text) {
    const lines = this.wrapText(text, 90)
    for (let i = 0; i < lines.length; i++) {
      this.checkPageBreak(13)
      const prefix = i === 0 ? '-  ' : '   '
      const op = `
BT
/F1 8.5 Tf
0.15 0.15 0.2 rg
${this.margin + 8} ${this.y} Td (${this.escape(prefix + lines[i])}) Tj
ET`
      this.currentPage.ops.push(op)
      this.y -= 12
    }
  }

  addCallout(title, text) {
    this.checkPageBreak(45)
    const lines = this.wrapText(text, 90)
    const boxHeight = 20 + lines.length * 12
    const op = `
q
0.98 0.95 0.95 rg
${this.margin} ${this.y - boxHeight + 10} ${this.contentWidth} ${boxHeight} re f
0.8 0.2 0.2 RG
1 w
${this.margin} ${this.y - boxHeight + 10} ${this.contentWidth} ${boxHeight} re S
BT
/F2 9 Tf
0.75 0.1 0.1 rg
${this.margin + 10} ${this.y - 2} Td (${this.escape(title)}) Tj
/F1 8.5 Tf
0.2 0.2 0.2 rg`
    this.currentPage.ops.push(op)

    let curY = this.y - 15
    for (const line of lines) {
      this.currentPage.ops.push(`\n${this.margin + 10} ${curY} Td (${this.escape(line)}) Tj`)
      curY -= 12
    }
    this.currentPage.ops.push('\nET\nQ')
    this.y -= boxHeight + 8
  }

  addTable(headers, rows, colWidths) {
    this.checkPageBreak(30 + rows.length * 15)
    const startX = this.margin
    let curY = this.y

    // Header background
    const opH = `
q
0.15 0.18 0.25 rg
${startX} ${curY - 14} ${this.contentWidth} 16 re f
BT
/F2 8.5 Tf
1 1 1 rg`
    this.currentPage.ops.push(opH)

    let accX = startX + 4
    for (let i = 0; i < headers.length; i++) {
      this.currentPage.ops.push(`\n${accX} ${curY - 10} Td (${this.escape(headers[i])}) Tj`)
      accX += colWidths[i]
    }
    this.currentPage.ops.push('\nET\nQ')
    curY -= 16

    // Rows
    for (let r = 0; r < rows.length; r++) {
      if (curY < 65) {
        this.addPage(false)
        this.drawHeader()
        curY = this.y
      }

      const bg = r % 2 === 0 ? '1 1 1' : '0.96 0.96 0.97'
      const opR = `
q
${bg} rg
${startX} ${curY - 12} ${this.contentWidth} 14 re f
0.85 0.85 0.85 RG
0.5 w
${startX} ${curY - 12} ${this.contentWidth} 14 re S
BT
/F1 8 Tf
0.15 0.15 0.2 rg`
      this.currentPage.ops.push(opR)

      let colX = startX + 4
      for (let c = 0; c < rows[r].length; c++) {
        const cellText = this.escape(String(rows[r][c])).slice(0, 32)
        this.currentPage.ops.push(`\n${colX} ${curY - 9} Td (${cellText}) Tj`)
        colX += colWidths[c]
      }
      this.currentPage.ops.push('\nET\nQ')
      curY -= 14
    }

    this.y = curY - 10
  }

  wrapText(text, maxChars) {
    const words = String(text).split(' ')
    const lines = []
    let current = ''

    for (const w of words) {
      if ((current + w).length > maxChars) {
        lines.push(current.trim())
        current = w + ' '
      } else {
        current += w + ' '
      }
    }
    if (current.trim()) lines.push(current.trim())
    return lines
  }

  drawEntityBox(x, y, w, h, title, fields) {
    const op = `
q
0.96 0.97 0.99 rg
${x} ${y} ${w} ${h} re f
0.2 0.35 0.6 RG
1.2 w
${x} ${y} ${w} ${h} re S

0.2 0.35 0.6 rg
${x} ${y + h - 18} ${w} 18 re f
BT
/F2 9 Tf
1 1 1 rg
${x + 8} ${y + h - 13} Td (${this.escape(title)}) Tj
/F1 7.5 Tf
0.15 0.15 0.2 rg`
    this.currentPage.ops.push(op)

    let fieldY = y + h - 30
    for (const f of fields) {
      this.currentPage.ops.push(`\n${x + 6} ${fieldY} Td (${this.escape(f)}) Tj`)
      fieldY -= 11.5
    }

    this.currentPage.ops.push('\nET\nQ')
  }

  drawConnectorLine(x1, y1, x2, y2, label = '') {
    const op = `
q
0.4 0.4 0.4 RG
0.8 w
[2 2] 0 d
${x1} ${y1} m ${x2} ${y2} l S
` + (label ? `
BT
/F1 7 Tf
0.3 0.3 0.3 rg
${(x1 + x2) / 2 - 15} ${(y1 + y2) / 2 + 3} Td (${this.escape(label)}) Tj
ET` : '') + `
Q`
    this.currentPage.ops.push(op)
  }

  generate() {
    const totalPages = this.pages.length
    for (let i = 0; i < totalPages; i++) {
      this.pages[i].pageNum = i + 1
      this.currentPage = this.pages[i]
      this.drawFooter(i + 1, totalPages)
    }

    let out = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'
    const offsets = []

    const addObj = (body) => {
      offsets.push(Buffer.byteLength(out, 'latin1'))
      const id = offsets.length
      out += `${id} 0 obj\n${body}\nendobj\n`
      return id
    }

    // Placeholders
    const catId = 1
    const pagesId = 2
    offsets.push(0)
    offsets.push(0)

    // Fonts
    const fontF1 = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>')
    const fontF2 = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>')
    const fontF3 = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>')

    const pageObjIds = []

    for (const page of this.pages) {
      const streamContent = page.ops.join('\n')
      const streamLen = Buffer.byteLength(streamContent, 'latin1')
      const contentId = addObj(`<< /Length ${streamLen} >>\nstream\n${streamContent}\nendstream`)

      const pageId = addObj(
        `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${this.pageWidth} ${this.pageHeight}] /Resources << /Font << /F1 ${fontF1} 0 R /F2 ${fontF2} 0 R /F3 ${fontF3} 0 R >> >> /Contents ${contentId} 0 R >>`
      )
      pageObjIds.push(pageId)
    }

    // Pages Object
    const pagesBody = `<< /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageObjIds.length} >>`
    offsets[pagesId - 1] = Buffer.byteLength(out, 'latin1')
    out += `${pagesId} 0 obj\n${pagesBody}\nendobj\n`

    // Catalog Object
    const catBody = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`
    offsets[catId - 1] = Buffer.byteLength(out, 'latin1')
    out += `${catId} 0 obj\n${catBody}\nendobj\n`

    // XRef table
    const startXref = Buffer.byteLength(out, 'latin1')
    out += 'xref\n'
    out += `0 ${offsets.length + 1}\n`
    out += '0000000000 65535 f \n'
    for (const off of offsets) {
      out += String(off).padStart(10, '0') + ' 00000 n \n'
    }

    out += `trailer\n<< /Size ${offsets.length + 1} /Root ${catId} 0 R >>\nstartxref\n${startXref}\n%%EOF`
    return Buffer.from(out, 'latin1')
  }
}

// -------------------------------------------------------------
// 1. GENERATE SRS DOCUMENT PDF
// -------------------------------------------------------------
console.log('Generating LifeLink_SRS_Document.pdf...')
const srs = new PDFBuilder('LifeLink Blood & Organ Donation System', 'Software Requirements Specification')

// COVER PAGE
srs.addPage(true)
srs.y = 700

// Cover Logo Box
srs.currentPage.ops.push(`
q
0.85 0.1 0.1 rg
${srs.margin} 730 ${srs.contentWidth} 6 re f
0.1 0.12 0.2 rg
${srs.margin} 480 ${srs.contentWidth} 220 re f
0.85 0.1 0.1 rg
${srs.margin} 480 6 220 re f
BT
/F2 22 Tf
1 1 1 rg
${srs.margin + 25} 650 Td (SOFTWARE REQUIREMENTS) Tj
${srs.margin + 25} 624 Td (SPECIFICATION (SRS)) Tj
/F1 12 Tf
0.9 0.9 0.9 rg
${srs.margin + 25} 585 Td (LifeLink: AI-Powered Blood and Organ Donation Management System) Tj
/F2 10 Tf
1 0.8 0.3 rg
${srs.margin + 25} 555 Td (Integrated with NOTTO | MoHFW, Government of India) Tj
/F1 9 Tf
0.7 0.7 0.7 rg
${srs.margin + 25} 530 Td (Compliant with IEEE Std 830-1998 Standard) Tj
${srs.margin + 25} 505 Td (Project: Entri Main Project -- Full-Stack MERN Health-Tech Solution) Tj
ET
Q`)

srs.y = 440
srs.addHeading2('Document Metadata & Release Information')
srs.addTable(
  ['Parameter', 'Specification Details'],
  [
    ['Document Version', '1.0.0 (Release Baseline)'],
    ['Publication Date', 'November 2026'],
    ['Engineering Standard', 'IEEE Std 830-1998 SRS Specification'],
    ['Technology Stack', 'MERN (MongoDB Atlas, Express.js, React 19, Node.js 24)'],
    ['Regulatory Compliance', 'THOTA 1994, NBTC Guidelines, DPDP Act 2023'],
    ['Government Integration', 'NOTTO (National Organ & Tissue Transplant Org, MoHFW)'],
    ['National Helplines', 'NOTTO: 1800-11-4770 | Ambulance Emergency: 108 / 102'],
  ],
  [140, 365]
)

srs.y -= 15
srs.addCallout(
  'EXECUTIVE SYSTEM PURPOSE',
  'LifeLink solves critical blood shortages and organ donor deficits in India by combining verified blood donor matching, direct MoHFW NOTTO Form 7 organ pledge integration, an AI-powered Clinical Pre-Screening engine, interactive Golden Hours preservation visualizers, and a 24/7 Clinical AI Assistant.'
)

// PAGE 2: TABLE OF CONTENTS & SECTION 1
srs.addPage(false)
srs.drawHeader()
srs.addTitle('1. Introduction')
srs.addHeading1('1.1 Purpose & Scope')
srs.addParagraph(
  'This Software Requirements Specification (SRS) establishes the foundational requirements for the LifeLink Blood and Organ Donation Platform. The product resolves fragmented emergency blood requests and addresses acute deceased organ donor shortages across Indian healthcare institutions.'
)
srs.addBullet('Voluntary blood donor registration, geo-demographic matching, and status controls.')
srs.addBullet('Statutory organ donation pledging compliant with THOTA Form 7 and NOTTO portal redirection.')
srs.addBullet('Educational Golden Hours preservation video visualizer covering Heart (4-6h), Liver (8-15h), and Kidneys (24-36h).')
srs.addBullet('AI-powered Clinical Pre-Screening engine calculating real-time 0-100% eligibility readiness scores.')
srs.addBullet('24/7 LifeLink AI Health Assistant chatbot delivering instant medical criteria guidance.')

srs.addHeading1('1.2 Document Conventions & Definitions')
srs.addBullet('FR-xxx: Functional Requirement ID | NFR-xxx: Non-Functional Requirement ID')
srs.addBullet('THOTA: Transplantation of Human Organs and Tissues Act, 1994 (Government of India).')
srs.addBullet('NOTTO: National Organ and Tissue Transplant Organization (Apex MoHFW Body).')
srs.addBullet('NBTC: National Blood Transfusion Council (MoHFW India).')
srs.addBullet('Ischemia Time: The critical time between organ blood supply cessation and recipient revascularization.')

srs.addHeading1('1.3 Intended Audience')
srs.addParagraph(
  'This specification serves system architects, full-stack software engineers, medical regulatory reviewers, project evaluators, and academic assessors at Entri HealthTech Systems Laboratory.'
)

// SECTION 2: OVERALL DESCRIPTION
srs.addHeading1('2. Overall System Description')
srs.addHeading2('2.1 Product Perspective & 3-Tier Architecture')
srs.addParagraph(
  'LifeLink operates as a distributed web application with a strict three-tier architecture: Presentation Layer (React 19, Tailwind CSS v4, Web Speech API), Business Logic Tier (Node.js 24, Express 4, JWT, Bcrypt, AI Engine), and Data Tier (MongoDB Atlas Cloud Cluster with multi-node replica set).'
)

srs.addTable(
  ['Architectural Tier', 'Technologies Employed', 'Core Operational Role'],
  [
    ['Presentation Tier', 'React 19, Vite 7, Tailwind v4', 'Responsive SPA, Forms, Chatbot, Video Player'],
    ['Application Tier', 'Node.js 24, Express.js 4, Mongoose', 'REST API, JWT Authentication, Clinical Rules'],
    ['AI Engine Layer', 'Knowledge Engine, Web Speech API', 'Eligibility Scoring, NLP Q&A, Voiceover Audio'],
    ['Data Storage Tier', 'MongoDB Atlas (Replica Set)', 'Encrypted Data Storage, Compound Indexes'],
    ['Government Gateway', 'MoHFW NOTTO Deep-Link Bridge', 'National Registry Synchronization & Form 7 Card'],
  ],
  [120, 160, 225]
)

// SECTION 3: FUNCTIONAL REQUIREMENTS
srs.addPage(false)
srs.drawHeader()
srs.addTitle('2. Functional System Modules')
srs.addHeading1('2.1 Module Breakdown & Specifications')

srs.addHeading2('Module 1: Authentication & Role-Based Access Control (RBAC)')
srs.addBullet('FR-AUTH-01: User registration with email, password (min 6 chars), name, and phone.')
srs.addBullet('FR-AUTH-02: Cryptographic salted hashing using bcrypt (work factor 10).')
srs.addBullet('FR-AUTH-03: Stateless JSON Web Token (JWT) issuance with 10-day expiration.')
srs.addBullet('FR-AUTH-04: Role separation between standard users/donors and administrative moderators.')

srs.addHeading2('Module 2: Blood Donor Directory & Emergency Matching')
srs.addBullet('FR-DON-01: Donor profile registration with blood group (A+, A-, B+, B-, AB+, AB-, O+, O-), city, and state.')
srs.addBullet('FR-DON-02: Profile moderation queue defaulting new profiles to pending status until admin approval.')
srs.addBullet('FR-DON-03: Multi-parameter search filter by Blood Group, City, and Availability toggle.')
srs.addBullet('FR-DON-04: Verified donor directory displaying availability status and emergency contact options.')

srs.addHeading2('Module 3: National Organ Donation Module (NOTTO Integration)')
srs.addBullet('FR-ORG-01: Multi-select organ pledge picker (Heart, Kidneys, Liver, Lungs, Pancreas, Intestines, Corneas, Tissues).')
srs.addBullet('FR-ORG-02: Statutory next-of-kin legal consent record capture (Name, Phone, Relation) compliant with THOTA.')
srs.addBullet('FR-ORG-03: Unique national tracking reference generator producing IDs formatted as NOTTO-LL-XXXXX.')
srs.addBullet('FR-ORG-04: Printable digital Form 7 National Organ Donor Pledge Card with 1-click window.print() support.')
srs.addBullet('FR-ORG-05: Direct deep-link referral bridge to the official NOTTO registry (https://notto.mohfw.gov.in/donor-pledge).')

srs.addHeading2('Module 4: Medical Golden Hours Video Showcase')
srs.addBullet('FR-VID-01: 7-scene interactive video presentation detailing organ preservation windows (Heart 4-6h, Liver 8-15h, Kidneys 24-36h).')
srs.addBullet('FR-VID-02: Interactive video playback controls: Play/Pause, Chapter Scrubber, Next/Prev, Replay, Fullscreen.')
srs.addBullet('FR-VID-03: Integrated Web Speech API audio narration engine delivering medical voiceover narration.')

srs.addHeading2('Module 5: AI Donor Eligibility Pre-Screening Engine')
srs.addBullet('FR-SCR-01: Evaluates Age (18-65), Weight (>= 45kg), 6-month Tattoo rule, 24h Alcohol rule, and 7-day Antibiotic rule.')
srs.addBullet('FR-SCR-02: Donation interval calculation enforcing 90 days for males and 120 days for females.')
srs.addBullet('FR-SCR-03: Instant 0-100% readiness score with status: Eligible to Donate Today or Temporary Deferral.')
srs.addBullet('FR-SCR-04: Direct notification that deferred blood donors remain 100% eligible to pledge organs via NOTTO.')

srs.addHeading2('Module 6: LifeLink AI Health Assistant (Chatbot)')
srs.addBullet('FR-BOT-01: Floating persistent chat widget with suggested quick prompts and natural language parsing.')
srs.addBullet('FR-BOT-02: Embedded clinical knowledge base answering tattoo eligibility, NOTTO laws, and viability questions.')
srs.addBullet('FR-BOT-03: Text-to-speech audio toggle and automated offline fallback engine.')

srs.addHeading2('Module 7: Administrative Governance & Audit Dashboard')
srs.addBullet('FR-ADM-01: Live analytics counters for Users, Approved Donors, Pending Approvals, NOTTO Pledges, and Donations.')
srs.addBullet('FR-ADM-02: Donor profile inspection queue with 1-click Approve and Reject actions.')
srs.addBullet('FR-ADM-03: NOTTO organ pledge audit table displaying donor data, organ selection, and next-of-kin contacts.')

// SECTION 4: NON-FUNCTIONAL & COMPLIANCE REQUIREMENTS
srs.addPage(false)
srs.drawHeader()
srs.addTitle('3. Non-Functional & Statutory Standards')
srs.addHeading1('3.1 Performance & Reliability Standards')

srs.addTable(
  ['Metric ID', 'Performance Dimension', 'Specification Target', 'Acceptance Benchmark'],
  [
    ['NFR-01', 'REST API Latency', 'Under 250 milliseconds', 'Tested with 100 concurrent requests'],
    ['NFR-02', 'Client Bundle Size', 'Under 120 kB gzip', 'Vite 7 production build in 1.12s'],
    ['NFR-03', 'Database Availability', '99.9% Operational Uptime', 'MongoDB Atlas cloud replica set'],
    ['NFR-04', 'DNS Fault Tolerance', 'Zero querySrv ECONNREFUSED', 'Enforced 8.8.8.8, 8.8.4.4 DNS resolvers'],
    ['NFR-05', 'Video Rendering', '60 FPS CSS / Canvas Animation', 'Zero frame drop during chapter transitions'],
    ['NFR-06', 'Accessibility', 'WCAG 2.1 Level AA Compliant', 'Contrast ratio >= 4.5:1, screen reader ARIA'],
  ],
  [65, 140, 140, 160]
)

srs.addHeading1('3.2 Security, Privacy & DPDP Compliance')
srs.addParagraph(
  'Security is engineered according to industry best practices. Passwords are never stored in plaintext and undergo salted bcrypt hashing (factor 10). Sensitive routes require valid cryptographic JWT tokens transmitted via HTTP Authorization headers. Input fields are sanitized against NoSQL injection and XSS.'
)

srs.addHeading1('3.3 Statutory Healthcare Regulations in India')
srs.addBullet('THOTA 1994 Compliance: Strict prohibition of commercial organ trade; purely voluntary humanitarian system.')
srs.addBullet('Form 7 Compliance: Informs citizens that digital pledge cards express noble intent; family consent is legally required at time of death.')
srs.addBullet('NBTC Norms: Strict enforcement of age (18-65), weight (45kg), hemoglobin (12.5 g/dL), and intervals (90d / 120d).')

srs.addHeading1('3.4 Acceptance Testing Matrix')
srs.addTable(
  ['Test Case', 'Feature Under Test', 'Expected Verification Result', 'Status'],
  [
    ['TC-01', 'User Registration & Auth', 'Bcrypt hash verified, JWT issued, user created in DB', 'PASSED'],
    ['TC-02', 'Blood Donor Search', 'Filtered results return approved, available donors by city', 'PASSED'],
    ['TC-03', 'NOTTO Organ Pledge', 'Record saved, unique NOTTO-LL-XXXXX issued, card rendered', 'PASSED'],
    ['TC-04', 'AI Pre-Screening Evaluation', 'Tattoo within 6m triggers Temporary Deferral and advice', 'PASSED'],
    ['TC-05', 'Golden Hours Video Showcase', '7 scenes advance sequentially, audio narration triggers', 'PASSED'],
    ['TC-06', 'LifeLink AI Chatbot', 'Returns verified clinical replies with helpline info', 'PASSED'],
    ['TC-07', 'Admin Governance Workflow', 'Pending profiles approved; organ pledges audited live', 'PASSED'],
  ],
  [55, 150, 240, 60]
)

const srsBuffer = srs.generate()
fs.writeFileSync(path.join(__dirname, 'LifeLink_SRS_Document.pdf'), srsBuffer)
console.log('Saved LifeLink_SRS_Document.pdf successfully!')

// -------------------------------------------------------------
// 2. GENERATE ER DIAGRAM DOCUMENT PDF
// -------------------------------------------------------------
console.log('Generating LifeLink_ER_Diagram.pdf...')
const erd = new PDFBuilder('LifeLink Blood & Organ Donation System', 'Entity-Relationship (ER) Specification')

// COVER PAGE
erd.addPage(true)
erd.currentPage.ops.push(`
q
0.1 0.35 0.6 rg
${erd.margin} 730 ${erd.contentWidth} 6 re f
0.08 0.12 0.22 rg
${erd.margin} 480 ${erd.contentWidth} 220 re f
0.1 0.45 0.75 rg
${erd.margin} 480 6 220 re f
BT
/F2 22 Tf
1 1 1 rg
${erd.margin + 25} 650 Td (DATABASE SCHEMA &) Tj
${erd.margin + 25} 624 Td (ENTITY-RELATIONSHIP DIAGRAM) Tj
/F1 12 Tf
0.9 0.9 0.9 rg
${erd.margin + 25} 585 Td (LifeLink: AI-Powered Blood and Organ Donation Management System) Tj
/F2 10 Tf
1 0.8 0.3 rg
${erd.margin + 25} 555 Td (Complete Mongoose Data Model & Entity Relationship Specification) Tj
/F1 9 Tf
0.7 0.7 0.7 rg
${erd.margin + 25} 530 Td (Compliant with IEEE Std 830-1998 Data Model Guidelines) Tj
${erd.margin + 25} 505 Td (Database: MongoDB Atlas Multi-Node Cloud Cluster) Tj
ET
Q`)

erd.y = 440
erd.addHeading2('Document Metadata & Database Environment')
erd.addTable(
  ['Parameter', 'Specification Details'],
  [
    ['Database Engine', 'MongoDB 7.0+ (Cloud-Hosted MongoDB Atlas)'],
    ['ODM Library', 'Mongoose v8.24.9 (Strict Schema Validation)'],
    ['Cluster Architecture', 'Multi-Node Replica Set with Automated Failover'],
    ['Document Version', '1.0.0 (Release Baseline)'],
    ['Indexed Primary Keys', 'ObjectId (_id), Unique Constraints on email, pledgeId'],
    ['Compound Indexes', '{ bloodGroup: 1, city: 1 } for sub-50ms search query response'],
    ['Security / Encryption', 'TLS 1.3 in-transit, AES-256 at-rest, password exclusion (select: false)'],
  ],
  [140, 365]
)

erd.y -= 15
erd.addCallout(
  'DATABASE ARCHITECTURAL PRINCIPLE',
  'LifeLink employs a hybrid relational-document database design in MongoDB. It normalizes identity credentials in the users collection, decouples medical donor availability into donors, and isolates legally sensitive THOTA Form 7 organ pledges in organpledges.'
)

// PAGE 2: VISUAL ER DIAGRAM
erd.addPage(false)
erd.drawHeader()
erd.addTitle('1. Visual Entity-Relationship (ER) Diagram')
erd.addParagraph(
  'The following visual diagram illustrates the five core collections, their primary keys, foreign key references, and relationship cardinalities.'
)

// Draw visual Entity Boxes
// Box 1: USER (Center Left)
const uX = erd.margin + 10
const uY = 530
const uW = 145
const uH = 140
erd.drawEntityBox(uX, uY, uW, uH, 'USER (Identity & RBAC)', [
  '[PK] _id : ObjectId',
  'name : String (80)',
  'email : String (Unique, Lower)',
  'password : String (Bcrypt Hash)',
  'role : Enum [donor, admin]',
  'phone : String (Trimmed)',
  'isBlocked : Boolean (Def: false)',
  'createdAt : Date',
  'updatedAt : Date',
])

// Box 2: DONOR (Center Right)
const dX = erd.margin + 210
const dY = 530
const dW = 155
const dH = 145
erd.drawEntityBox(dX, dY, dW, dH, 'DONOR (Medical Profile)', [
  '[PK] _id : ObjectId',
  '[FK] user : ObjectId (Unique -> USER)',
  'bloodGroup : Enum [A+, B+, ...]',
  'age : Number (18 - 65)',
  'gender : Enum [male, female, other]',
  'city : String (Indexed)',
  'state : String',
  'available : Boolean (Def: true)',
  'status : Enum [pending, apprv, rej]',
  'lastDonationDate : Date',
])

// Box 3: ORGAN_PLEDGE (Top Right)
const oX = erd.margin + 340
const oY = 320
const oW = 155
const oH = 155
erd.drawEntityBox(oX, oY, oW, oH, 'ORGAN_PLEDGE (Form 7)', [
  '[PK] _id : ObjectId',
  'pledgeId : String (Unique, Indexed)',
  '[FK] user : ObjectId (Optional -> USER)',
  'fullName : String',
  'email : String (Indexed)',
  'phone : String',
  'age : Number (18 - 100)',
  'bloodGroup : String',
  'organsPledged : Array<String>',
  'emergencyContactName : String',
  'emergencyContactPhone : String',
])

// Box 4: DONATION (Bottom Left)
const donX = erd.margin + 10
const donY = 330
const donW = 145
const donH = 110
erd.drawEntityBox(donX, donY, donW, donH, 'DONATION (Audit Log)', [
  '[PK] _id : ObjectId',
  '[FK] donor : ObjectId (-> DONOR)',
  '[FK] recipient : ObjectId (-> USER)',
  'donationDate : Date',
  'bloodGroup : String',
  'units : Number',
  'status : Enum [completed, canc]',
])

// Box 5: REQUEST (Bottom Center)
const rX = erd.margin + 180
const rY = 330
const rW = 145
const rH = 120
erd.drawEntityBox(rX, rY, rW, rH, 'REQUEST (Emergency)', [
  '[PK] _id : ObjectId',
  '[FK] requester : ObjectId (-> USER)',
  'patientName : String',
  'bloodGroup : Enum [A+, B+, ...]',
  'hospital : String',
  'city : String',
  'urgency : Enum [normal, critical]',
  'status : Enum [open, fulfilled]',
])

// Draw Connector Lines
// USER to DONOR (1 : 0..1)
erd.drawConnectorLine(uX + uW, uY + 70, dX, dY + 70, '1 to 0..1')

// USER to ORGAN_PLEDGE (1 : 0..N)
erd.drawConnectorLine(uX + uW, uY + 20, oX, oY + 120, '1 to 0..N')

// USER to REQUEST (1 : 0..N)
erd.drawConnectorLine(uX + 70, uY, rX + 70, rY + rH, '1 to 0..N')

// DONOR to DONATION (1 : 0..N)
erd.drawConnectorLine(dX + 20, dY, donX + donW, donY + 60, '1 to 0..N')

erd.y = 290
erd.addHeading2('Cardinality & Relationship Rules')
erd.addBullet('USER to DONOR (1 : 0..1): Every donor profile is linked to exactly one user account via a unique foreign key.')
erd.addBullet('USER to ORGAN_PLEDGE (1 : 0..N): A registered user or public visitor can submit one or more voluntary organ pledges.')
erd.addBullet('DONOR to DONATION (1 : 0..N): An approved blood donor participates in multiple audited donation events over time.')
erd.addBullet('USER to REQUEST (1 : 0..N): A verified user can file emergency requisitions for hospitalized family members.')

// PAGE 3: DATA DICTIONARY
erd.addPage(false)
erd.drawHeader()
erd.addTitle('2. Detailed Data Dictionary')

erd.addHeading1('Collection 1: users')
erd.addTable(
  ['Field Name', 'BSON Type', 'Constraints & Indexing', 'Description'],
  [
    ['_id', 'ObjectId', 'Primary Key (Auto-generated)', 'Unique system identifier for the user account.'],
    ['name', 'String', 'Required, Trimmed, Max 80 chars', 'Full legal name of the registered citizen.'],
    ['email', 'String', 'Required, Unique, Lowercase Index', 'Primary login identifier and notification address.'],
    ['password', 'String', 'Required, Min 6, select: false', 'Bcrypt salted cryptographic hash (salt factor 10).'],
    ['role', 'String', "Enum ['donor', 'admin']", 'Role-Based Access Control token (default: donor).'],
    ['phone', 'String', 'Optional, Trimmed', 'Contact phone number for SMS and emergency alerts.'],
    ['isBlocked', 'Boolean', 'Default: false', 'Administrative moderation flag to suspend accounts.'],
    ['createdAt', 'Date', 'Auto-managed Timestamp', 'Record creation ISO 8601 timestamp.'],
  ],
  [85, 75, 175, 170]
)

erd.addHeading1('Collection 2: donors')
erd.addTable(
  ['Field Name', 'BSON Type', 'Constraints & Indexing', 'Description'],
  [
    ['_id', 'ObjectId', 'Primary Key (Auto-generated)', 'Unique identifier for the donor medical profile.'],
    ['user', 'ObjectId', 'Required, Unique, ref: User', 'Foreign key reference to parent User record.'],
    ['bloodGroup', 'String', 'Required, Enum [A+, B+, ...]', 'ABO and Rh blood group indicator.'],
    ['age', 'Number', 'Required, Min: 18, Max: 65', 'Age in years compliant with NBTC regulations.'],
    ['gender', 'String', "Enum ['male', 'female', 'other']", 'Gender identity for donation interval checks.'],
    ['city', 'String', 'Required, Indexed with bloodGroup', 'Primary municipality / city of residence.'],
    ['available', 'Boolean', 'Default: true', 'Live toggle indicating donor readiness to donate.'],
    ['status', 'String', "Enum ['pending', 'approved', 'rejected']", 'Administrative vetting status (default: pending).'],
  ],
  [85, 75, 175, 170]
)

erd.addHeading1('Collection 3: organpledges')
erd.addTable(
  ['Field Name', 'BSON Type', 'Constraints & Indexing', 'Description'],
  [
    ['_id', 'ObjectId', 'Primary Key (Auto-generated)', 'Unique identifier for the organ pledge record.'],
    ['pledgeId', 'String', 'Required, Unique Index', 'National format tracking ID (e.g. NOTTO-LL-84920).'],
    ['fullName', 'String', 'Required, Trimmed', 'Full legal name printed on Form 7 Donor Card.'],
    ['email', 'String', 'Required, Lowercase, Indexed', 'Donor contact email for pledge verification.'],
    ['organsPledged', 'Array<Str>', 'Required, Min 1 selection', 'Pledged organs: Heart, Kidneys, Liver, Corneas, etc.'],
    ['emergencyContactName', 'String', 'Required under THOTA', 'Name of primary next-of-kin legal custodian.'],
    ['emergencyContactPhone', 'String', 'Required under THOTA', 'Mobile number of next-of-kin for legal verification.'],
    ['emergencyContactRelation', 'String', 'Optional', 'Kinship relation (e.g. Spouse, Parent, Sibling).'],
  ],
  [110, 75, 155, 165]
)

const erdBuffer = erd.generate()
fs.writeFileSync(path.join(__dirname, 'LifeLink_ER_Diagram.pdf'), erdBuffer)
console.log('Saved LifeLink_ER_Diagram.pdf successfully!')
