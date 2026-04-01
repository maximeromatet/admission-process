window.Utils = (() => {
  // ── Score helpers ──────────────────────────────────────────
  const S1_CRITERIA = ['academic', 'entrepreneurial', 'professional', 'essay', 'international'];
  const S2_CRITERIA = ['alignment', 'mindset', 'motivation', 'resilience', 'communication'];
  const S1_LABELS = {
    academic: 'Academic Background',
    entrepreneurial: 'Entrepreneurial Experience',
    professional: 'Professional Experience',
    essay: 'Essay Quality & Storytelling',
    international: 'International Profile',
  };
  const S2_LABELS = {
    alignment: 'Alignment with Program',
    mindset: 'Entrepreneurial Mindset',
    motivation: 'Motivation & Conviction',
    resilience: 'Resilience under Pressure',
    communication: 'Communication & Presence',
  };

  function avgScores(scores, criteria) {
    if (!scores) return null;
    const vals = criteria.map(k => scores[k]).filter(v => v !== null && v !== undefined);
    if (!vals.length) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }

  function s1Avg(c) { return avgScores(c.stage1Scores, S1_CRITERIA); }
  function s2Avg(c) { return avgScores(c.stage2Scores, S2_CRITERIA); }
  function overallAvg(c) {
    const s1 = s1Avg(c);
    const s2 = s2Avg(c);
    if (s1 === null || s2 === null) return null;
    return (s1 + s2) / 2;
  }

  function autoDecision(c) {
    const overall = overallAvg(c);
    if (overall === null) return null;
    if (overall >= 3.5) return 'accepted';
    if (overall >= 3.0) return 'waitlisted';
    return 'rejected';
  }

  function fmtScore(v) {
    if (v === null || v === undefined) return '—';
    return v.toFixed(1);
  }

  function scoreClass(v) {
    if (v === null || v === undefined) return 'na';
    if (v >= 3.5) return 'high';
    if (v >= 3.0) return 'mid';
    return 'low';
  }

  // ── Date helpers ───────────────────────────────────────────
  function calcAge(dob) {
    if (!dob) return '—';
    const today = new Date('2026-03-29');
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  function fmtDate(d) {
    if (!d) return '—';
    const dt = new Date(d + (d.includes('T') ? '' : 'T00:00:00'));
    return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function fmtDateTime(d) {
    if (!d) return '—';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' ' + dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  // Working days Mon-Fri in a date range
  function getWorkingDays(startDate, endDate) {
    const days = [];
    const cur = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    while (cur <= end) {
      const dow = cur.getDay();
      if (dow >= 1 && dow <= 5) {
        days.push(cur.toISOString().slice(0, 10));
      }
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  }

  function dayLabel(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
  }

  // ── Status helpers ─────────────────────────────────────────
  const STATUS_ORDER = ['pending','app_review','interview','accepted','waitlisted','rejected'];
  const STATUS_LABELS = {
    pending:    'Pending',
    app_review: 'Application Review',
    interview:  'Interview',
    accepted:   'Accepted',
    waitlisted: 'Waitlisted',
    rejected:   'Rejected',
  };

  const PIPELINE_COLORS = {
    pending:    '#94a3b8',
    app_review: '#3b82f6',
    interview:  '#8b5cf6',
    accepted:   '#16a34a',
    waitlisted: '#d97706',
    rejected:   '#be123c',
  };

  // ── Batch status ───────────────────────────────────────────
  const TODAY = '2026-03-29';

  function batchStatus(batch) {
    if (batch.admissionDate < TODAY) return 'Completed';
    if (batch.admissibilityDate <= TODAY) return 'Interview Phase';
    if (batch.deadline <= TODAY) return 'Reviewing';
    return 'Open';
  }

  function batchNextDate(batch) {
    if (batch.admissionDate < TODAY) return null;
    if (batch.admissibilityDate <= TODAY) return { label: 'Decisions due', date: batch.admissionDate };
    if (batch.deadline <= TODAY) return { label: 'Admissibility results', date: batch.admissibilityDate };
    return { label: 'Application deadline', date: batch.deadline };
  }

  // ── Initials ───────────────────────────────────────────────
  function initials(name) {
    if (!name) return '?';
    return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }

  // ── Docs checklist ─────────────────────────────────────────
  const DOC_ITEMS = [
    { key: 'degree',      label: 'Degree certificate' },
    { key: 'transcripts', label: 'Official academic transcripts' },
    { key: 'cv',          label: 'CV / Résumé' },
    { key: 'english',     label: 'English language test (TOEFL/IELTS/TOEIC)' },
    { key: 'essay',       label: 'Motivation essay' },
    { key: 'references',  label: '2 Reference letters' },
    { key: 'photo',       label: 'Passport-style photo' },
  ];

  function docsComplete(docs) {
    if (!docs) return false;
    return DOC_ITEMS.every(item => docs[item.key]);
  }

  function docsMissing(docs) {
    if (!docs) return DOC_ITEMS.map(i => i.label);
    return DOC_ITEMS.filter(i => !docs[i.key]).map(i => i.label);
  }

  // ── Interview window for a batch ───────────────────────────
  function interviewWindow(batch) {
    // 2 weeks after admissibility results, working days
    const start = new Date(batch.admissibilityDate + 'T00:00:00');
    start.setDate(start.getDate() + 1);
    const end = new Date(start);
    end.setDate(end.getDate() + 13);
    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);
    return getWorkingDays(startStr, endStr);
  }

  // ── Quota tracker ──────────────────────────────────────────
  function computeQuotas(candidates, settings) {
    const accepted = candidates.filter(c => c.status === 'accepted');
    const total = accepted.length;
    const business = accepted.filter(c => c.background === 'Business').length;
    const engineering = accepted.filter(c => c.background === 'Engineering').length;
    const diverse = accepted.filter(c => c.background === 'Science & Other').length;
    const internal = accepted.filter(c => c.isInternal).length;
    const women = accepted.filter(c => c.gender === 'F').length;
    const ages = accepted.map(c => calcAge(c.dob)).filter(a => typeof a === 'number');
    const avgAge = ages.length ? (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1) : '—';
    return { total, business, engineering, diverse, internal, women, avgAge };
  }

  // ── Time slot suggestions ──────────────────────────────────
  function getTimeSlots() {
    const slots = [];
    for (let h = 8; h <= 17; h++) {
      for (let m = 0; m < 60; m += 25) {
        if (h === 17 && m > 0) break;
        const hh = String(h).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        slots.push(`${hh}:${mm}`);
      }
    }
    return slots;
  }

  return {
    S1_CRITERIA, S2_CRITERIA, S1_LABELS, S2_LABELS,
    s1Avg, s2Avg, overallAvg, autoDecision, fmtScore, scoreClass,
    calcAge, fmtDate, fmtDateTime, getWorkingDays, dayLabel,
    STATUS_ORDER, STATUS_LABELS, PIPELINE_COLORS,
    batchStatus, batchNextDate, initials,
    DOC_ITEMS, docsComplete, docsMissing, interviewWindow,
    computeQuotas, getTimeSlots,
  };
})();
