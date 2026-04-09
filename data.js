// ============================================================
//  MSc X-HEC Entrepreneurs — Seed Data
// ============================================================

window.BATCHES_SEED = [
  {
    id: 'r1',
    name: 'Round 1',
    deadline: '2025-11-14',
    admissibilityDate: '2025-12-12',
    admissionDate: '2026-01-16',
    targetSeats: 20,
    isInternal: false,
    note: '',
    archived: false,
  },
  {
    id: 'r2',
    name: 'Round 2',
    deadline: '2025-12-12',
    admissibilityDate: '2026-01-22',
    admissionDate: '2026-02-16',
    targetSeats: 25,
    isInternal: false,
    note: '',
    archived: false,
  },
  {
    id: 'r3',
    name: 'Round 3',
    deadline: '2026-02-19',
    admissibilityDate: '2026-03-16',
    admissionDate: '2026-04-08',
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
    admissibilityDate: '2026-06-17',
    admissionDate: '2026-07-15',
    targetSeats: 20,
    isInternal: false,
    note: '',
    archived: false,
  },
];

window.COMMITTEE_USERS_SEED = [
  { id: 'u1', name: 'Etienne Krieger',           email: 'e.krieger@hec.edu',            role: 'Professor',          initials: 'EK' },
  { id: 'u2', name: 'Guillaume Le Dieu de Ville', email: 'g.ledieu@hec.edu',             role: 'Academic Director',  initials: 'GL' },
  { id: 'u3', name: 'Bruno Martinaud',            email: 'b.martinaud@hec.edu',          role: 'Academic Director',  initials: 'BM' },
  { id: 'u4', name: 'Zoé Lechevalier',            email: 'z.lechevalier@alumni.hec.edu', role: 'Alumni',             initials: 'ZL' },
  { id: 'u5', name: 'Miguel Torrez',              email: 'm.torrez@alumni.hec.edu',      role: 'Alumni',             initials: 'MT' },
];

window.ALUMNI_SEED = [
  { id: 'a1', name: 'Zoé Lechevalier', email: 'z.lechevalier@alumni.hec.edu', cohort: 2022, initials: 'ZL' },
  { id: 'a2', name: 'Miguel Torrez',   email: 'm.torrez@alumni.hec.edu',      cohort: 2021, initials: 'MT' },
];

window.ALUMNI_AVAIL_SEED = [
  { alumniId: 'a1', date: '2026-03-17', period: 'AM' },
  { alumniId: 'a1', date: '2026-03-18', period: 'AM' },
  { alumniId: 'a1', date: '2026-03-19', period: 'PM' },
  { alumniId: 'a2', date: '2026-03-17', period: 'PM' },
  { alumniId: 'a2', date: '2026-03-18', period: 'AM' },
  { alumniId: 'a2', date: '2026-03-20', period: 'AM' },
];

window.INTERVIEWS_SEED = [
  {
    id: 'i1', candidateId: 'c1', batchId: 'r1',
    date: '2026-01-30', time: '10:00',
    chairId: 'u1', alumniIds: ['a1', 'a2'],
    zoomLink: 'https://zoom.us/j/111222333',
    status: 'Completed',
    notes: 'Motivated and personable. Clear entrepreneurial drive. Two concrete projects already in progress. Conviction is there — project maturity is the only question mark.',
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
    stage1Scores: { academic: 4, entrepreneurial: 4, professional: 3, essay: 4, international: 4 },
    stage2Scores: { alignment: 3, mindset: 3.5, motivation: 4, resilience: 4, communication: 3 },
    docs: { degree: true, transcripts: true, cv: true, english: true, essay: true, references: true, photo: true },
    notes: 'International profile (Bocconi), political science. Two entrepreneurial projects already underway. Essays: bold and assertive statements, good storytelling.',
    s2Notes: 'Genuine conviction, entrepreneurial thinking already active. Political knowledge and skills acquired in parallel of data-driven thinking at Bocconi. Drive and motivation are real. Age is a weakness',
    pdfUrl: '/maxime.pdf',
    cohort: { offerAccepted: false, depositPaid: false },
    activityLog: [
      { action: 'Application submitted',                         time: '2026-12-12T10:00:00' },
      { action: 'Moved to Application Review',                   time: '2026-01-06T09:00:00' },
      { action: 'Application Review submitted — avg 4.0 → interview', time: '2026-03-08T11:00:00' },
      { action: 'Interview invitation sent',                     time: '2026-03-16T11:30:00' },
      { action: 'Interview conducted',                           time: '2026-03-17T09:00:00' },
      { action: 'Interview submitted — avg 4.0 → waitlisted',   time: '2026-03-28T14:00:00' },
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