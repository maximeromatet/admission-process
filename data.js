// ============================================================
//  MSc X-HEC Entrepreneurs — Seed Data
// ============================================================

window.BATCHES_SEED = [
  {
    id: 'r1',
    name: 'Round 1',
    deadline: '2025-12-12',
    admissibilityDate: '2026-01-22',
    admissionDate: '2026-02-16',
    targetSeats: 20,
    isInternal: false,
    note: '',
    archived: false,
  },
  {
    id: 'r2',
    name: 'Round 2',
    deadline: '2026-02-19',
    admissibilityDate: '2026-03-16',
    admissionDate: '2026-04-08',
    targetSeats: 25,
    isInternal: false,
    note: '',
    archived: false,
  },
  {
    id: 'r3',
    name: 'Round 3',
    deadline: '2026-04-09',
    admissibilityDate: '2026-04-29',
    admissionDate: '2026-05-27',
    targetSeats: 25,
    isInternal: false,
    note: '',
    archived: false,
  },
  {
    id: 'internal',
    name: 'École Polytechnique',
    deadline: '2026-02-13',
    admissibilityDate: '2026-02-27',
    admissionDate: '2026-03-24',
    targetSeats: 40,
    isInternal: true,
    note: 'École Polytechnique students',
    archived: false,
  },
  {
    id: 'r4',
    name: 'Round 4',
    deadline: '2026-05-28',
    admissibilityDate: '2026-06-11',
    admissionDate: '2026-06-24',
    targetSeats: 20,
    isInternal: false,
    note: '',
    archived: false,
  },
];

window.COMMITTEE_USERS_SEED = [
  { id: 'u1', name: 'Etienne Krieger',           email: 'etienne.krieger',            role: 'Professor',          initials: 'EK' },
  { id: 'u2', name: 'Guillaume Le Dieu de Ville', email: 'guillaume.ledieu',             role: 'Academic Director',  initials: 'GL' },
  { id: 'u3', name: 'Bruno Martinaud',            email: 'bruno.martinaud@polytechnique.edu',          role: 'Academic Director',  initials: 'BM' },
  { id: 'u4', name: 'Zoé Lechevalier',            email: 'z.lechevalier@alumni.hec.edu', role: 'Alumni',             initials: 'ZL' },
  { id: 'u5', name: 'Miguel Torrez',              email: 'm.torrez@alumni.hec.edu',      role: 'Alumni',             initials: 'MT' },
];

window.ALUMNI_SEED = [
  { id: 'a1', name: 'Zoé Lechevalier', email: 'z.lechevalier@alumni.hec.edu', cohort: 2022, initials: 'ZL' },
  { id: 'a2', name: 'Miguel Torrez',   email: 'm.torrez@alumni.hec.edu',      cohort: 2021, initials: 'MT' },
];

// Availability is keyed to each round's actual interview window
// (the Mon-Fri week immediately following the admissibility date).
// Round 1 interviews: 26–30 Jan 2026
// École Poly interviews: 2–6 Mar 2026
// Round 2 interviews: 23–27 Mar 2026
// Round 3 interviews: 4–8 May 2026  ← current active round as of Apr 2026
// Round 4 interviews: 15–19 Jun 2026
window.ALUMNI_AVAIL_SEED = [
  // Round 1 (Jan 26–30)
  { alumniId: 'a1', date: '2026-01-26', period: 'AM' },
  { alumniId: 'a1', date: '2026-01-27', period: 'AM' },
  { alumniId: 'a2', date: '2026-01-26', period: 'PM' },
  { alumniId: 'a2', date: '2026-01-28', period: 'AM' },
  // École Polytechnique (Mar 2–6)
  { alumniId: 'a1', date: '2026-03-02', period: 'AM' },
  { alumniId: 'a1', date: '2026-03-04', period: 'PM' },
  { alumniId: 'a2', date: '2026-03-02', period: 'AM' },
  { alumniId: 'a2', date: '2026-03-03', period: 'AM' },
  // Round 2 (Mar 23–27)
  { alumniId: 'a1', date: '2026-03-23', period: 'AM' },
  { alumniId: 'a1', date: '2026-03-25', period: 'AM' },
  { alumniId: 'a2', date: '2026-03-23', period: 'PM' },
  { alumniId: 'a2', date: '2026-03-24', period: 'AM' },
  // Round 3 (May 4–8) — upcoming
  { alumniId: 'a1', date: '2026-05-04', period: 'AM' },
  { alumniId: 'a1', date: '2026-05-05', period: 'AM' },
  { alumniId: 'a1', date: '2026-05-07', period: 'PM' },
  { alumniId: 'a2', date: '2026-05-04', period: 'PM' },
  { alumniId: 'a2', date: '2026-05-05', period: 'AM' },
  { alumniId: 'a2', date: '2026-05-06', period: 'AM' },
  // Round 4 (Jun 15–19) — open
  { alumniId: 'a1', date: '2026-06-16', period: 'AM' },
  { alumniId: 'a2', date: '2026-06-16', period: 'AM' },
  { alumniId: 'a2', date: '2026-06-17', period: 'PM' },
];

window.INTERVIEWS_SEED = [
  // Round 1 — completed (Maxime Romatet)
  {
    id: 'i1', candidateId: 'c1', batchId: 'r1',
    date: '2026-01-30', time: '10:00',
    chairId: 'u1', alumniIds: [],
    zoomLink: 'https://zoom.us/j/111222333',
    status: 'Completed',
    notes: 'Motivation, résilience, passion et mentalité entrepreneuriales, valeurs alignées, désir de créer de l\'impact.',
  },
  // Round 3 — to schedule (Sophie Marchand)
  {
    id: 'i2', candidateId: 'c2', batchId: 'r3',
    date: '', time: '',
    chairId: '', alumniIds: [],
    zoomLink: '', status: 'To Schedule', notes: '',
  },
  // Round 3 — to schedule (Lucas Fontaine)
  {
    id: 'i3', candidateId: 'c3', batchId: 'r3',
    date: '', time: '',
    chairId: '', alumniIds: [],
    zoomLink: '', status: 'To Schedule', notes: '',
  },
  // Round 4 — to schedule (Elena Vasquez)
  {
    id: 'i4', candidateId: 'c4', batchId: 'r4',
    date: '', time: '',
    chairId: '', alumniIds: [],
    zoomLink: '', status: 'To Schedule', notes: '',
  },
];

window.CANDIDATES_SEED = [
  {
    id: 'c1', batchId: 'r1',
    name: 'Maxime Romatet',
    email: 'maximeromatet@email.com',
    phone: '+33 7 69 18 70 16',
    nationality: 'French',
    school: 'Bocconi University',
    degree: 'BSc International Politics and Government',
    graduationYear: 2026,
    background: 'Diverse',
    gender: 'M',
    dob: '2005-05-29',
    isInternal: false,
    applicationDate: '2025-12-12',
    assignedEvaluatorS1: 'u1',
    assignedEvaluatorS2: 'u3',
    status: 'waitlisted',
    stage1Scores: { academic: 3.5, entrepreneurial: 4, professional: 2, essay: 4.5, international: 4.5 },
    stage2Scores: { alignment: 2, mindset: 4, motivation: 4, resilience: 4, communication: 3 },
    docs: { degree: true, transcripts: true, cv: true, english: true, essay: true, references: true, photo: true },
    notes: '+ : international (Italie, Corée), détermination, storytelling et expérience entrepreneuriale.\nSciences politiques (même si connaissance et appétence pour les network effects, comportements sociaux, ...)\n- : âge, Bocconi',
    s2Notes: '+ : motivation, résilience, passion et mentalité entrepreneuriales, valeurs alignées, désir de créer de l\'impact\n- : âge, Bocconi',
    pdfUrl: '/maxime.pdf',
    cohort: { offerAccepted: false, depositPaid: false },
    activityLog: [
      { action: 'Application submitted',                             time: '2025-12-12T10:00:00' },
      { action: 'Moved to Application Review',                       time: '2026-01-06T09:00:00' },
      { action: 'Application Review submitted — avg 3.7 → interview', time: '2026-01-20T11:00:00' },
      { action: 'Interview invitation sent',                         time: '2026-01-28T11:30:00' },
      { action: 'Interview conducted',                               time: '2026-02-03T09:00:00' },
      { action: 'Interview submitted — avg 3.4 → waitlisted',       time: '2026-02-10T14:00:00' },
    ],
  },

  // ── Round 3 demo candidates (interview week: Mon 4 May → Fri 8 May) ──
  {
    id: 'c2', batchId: 'r3',
    name: 'Sophie Marchand',
    email: 'sophie.marchand@polytechnique.edu',
    phone: '+33 6 12 34 56 78',
    nationality: 'French',
    school: 'École Polytechnique',
    degree: 'MSc Applied Mathematics',
    graduationYear: 2026,
    background: 'Engineering',
    gender: 'F',
    dob: '2001-03-14',
    isInternal: false,
    applicationDate: '2026-04-08',
    assignedEvaluatorS1: 'u2',
    assignedEvaluatorS2: null,
    status: 'interview',
    stage1Scores: { academic: 4, entrepreneurial: 3.5, professional: 3, essay: 4, international: 3 },
    stage2Scores: null,
    docs: { degree: true, transcripts: true, cv: true, english: true, essay: true, references: true, photo: true },
    notes: '+ : profil ingénierie solide, esprit analytique, projet entrepreneurial clair.\n- : première expérience internationale limitée.',
    s2Notes: '',
    pdfUrl: null,
    cohort: { offerAccepted: false, depositPaid: false },
    activityLog: [
      { action: 'Application submitted',                              time: '2026-04-08T10:00:00' },
      { action: 'Moved to Application Review',                        time: '2026-04-10T09:00:00' },
      { action: 'Application Review submitted — avg 3.5 → interview', time: '2026-04-12T14:00:00' },
    ],
  },
  {
    id: 'c3', batchId: 'r3',
    name: 'Lucas Fontaine',
    email: 'lucas.fontaine@centraliens.net',
    phone: '+33 6 98 76 54 32',
    nationality: 'French',
    school: 'CentraleSupélec',
    degree: 'MEng Energy & Digital Systems',
    graduationYear: 2025,
    background: 'Engineering',
    gender: 'M',
    dob: '2000-09-22',
    isInternal: false,
    applicationDate: '2026-04-07',
    assignedEvaluatorS1: 'u1',
    assignedEvaluatorS2: null,
    status: 'interview',
    stage1Scores: { academic: 3.5, entrepreneurial: 4, professional: 3.5, essay: 3.5, international: 3 },
    stage2Scores: null,
    docs: { degree: true, transcripts: true, cv: true, english: true, essay: true, references: false, photo: true },
    notes: '+ : expérience startup (stage Pigment), bonne maîtrise des enjeux tech.\n- : une lettre de référence manquante.',
    s2Notes: '',
    pdfUrl: null,
    cohort: { offerAccepted: false, depositPaid: false },
    activityLog: [
      { action: 'Application submitted',                              time: '2026-04-07T11:00:00' },
      { action: 'Moved to Application Review',                        time: '2026-04-10T09:00:00' },
      { action: 'Application Review submitted — avg 3.5 → interview', time: '2026-04-12T16:00:00' },
    ],
  },

  // ── Round 4 demo candidate (interview week: Mon 15 Jun → Fri 19 Jun) ──
  {
    id: 'c4', batchId: 'r4',
    name: 'Elena Vasquez',
    email: 'elena.vasquez@hbs.edu',
    phone: '+1 617 555 0142',
    nationality: 'Spanish',
    school: 'Harvard Business School',
    degree: 'MBA',
    graduationYear: 2026,
    background: 'Business',
    gender: 'F',
    dob: '1998-11-05',
    isInternal: false,
    applicationDate: '2026-05-25',
    assignedEvaluatorS1: 'u3',
    assignedEvaluatorS2: null,
    status: 'interview',
    stage1Scores: { academic: 4.5, entrepreneurial: 4, professional: 4.5, essay: 4, international: 5 },
    stage2Scores: null,
    docs: { degree: true, transcripts: true, cv: true, english: true, essay: true, references: true, photo: true },
    notes: '+ : profil international exceptionnel, double culture US/Europe, expérience venture capital.\n- : âge (28 ans), positionnement MBA → MSc.',
    s2Notes: '',
    pdfUrl: null,
    cohort: { offerAccepted: false, depositPaid: false },
    activityLog: [
      { action: 'Application submitted',                              time: '2026-05-25T14:00:00' },
      { action: 'Moved to Application Review',                        time: '2026-05-28T09:00:00' },
      { action: 'Application Review submitted — avg 4.4 → interview', time: '2026-06-03T11:00:00' },
    ],
  },
];

window.SETTINGS_SEED = {
  totalTarget:    120,
  businessPct:     30,
  engineeringPct:  30,
  diversePct:      30,
  internalTarget:  40,
  womenPct:        44,
};