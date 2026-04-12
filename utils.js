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
    const today = new Date();
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

  // Returns 'YYYY-MM-DD' in LOCAL time — avoids UTC drift for European timezones
  function localDateStr(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + dd;
  }

  // Working days Mon-Fri in a date range (uses noon to avoid DST/TZ shifts)
  function getWorkingDays(startDate, endDate) {
    const days = [];
    const cur = new Date(startDate + 'T12:00:00');
    const end = new Date(endDate + 'T12:00:00');
    while (cur <= end) {
      const dow = cur.getDay();
      if (dow >= 1 && dow <= 5) {
        days.push(localDateStr(cur));
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
  const TODAY = localDateStr(new Date());

  function batchStatus(batch) {
    if (batch.admissionDate < TODAY) {
      // Show 'Confirming Enrollment' for the 14 days following admission results
      const d = new Date(batch.admissionDate + 'T12:00:00');
      d.setDate(d.getDate() + 14);
      const confirmingUntil = localDateStr(d);
      return TODAY <= confirmingUntil ? 'Confirming Enrollment' : 'Completed';
    }
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
  // Rule: Mon–Fri of the week immediately following the admissibility date.
  // e.g. admissibility on Thu 11 Jun → interviews Mon 15 Jun – Fri 19 Jun.
  function interviewWindow(batch) {
    const adm = new Date(batch.admissibilityDate + 'T12:00:00');
    const dow = adm.getDay(); // 0=Sun, 1=Mon … 6=Sat
    // Days until the next Monday.
    // If admissibility falls on Monday itself, jump to the following Monday (+7).
    const toMonday = dow === 0 ? 1 : (8 - dow) % 7 || 7;
    adm.setDate(adm.getDate() + toMonday);          // adm is now Monday
    const friday = new Date(adm);
    friday.setDate(friday.getDate() + 4);            // Friday of same week
    return getWorkingDays(localDateStr(adm), localDateStr(friday));
  }

  // ── Quota tracker ──────────────────────────────────────────
  function computeQuotas(candidates, settings) {
    const accepted = candidates.filter(c => c.status === 'accepted');
    const total = accepted.length;
    const business = accepted.filter(c => c.background === 'Business').length;
    const engineering = accepted.filter(c => c.background === 'Engineering').length;
    const diverse = accepted.filter(c => c.background === 'Diverse').length;
    const internal = accepted.filter(c => c.isInternal).length;
    const women = accepted.filter(c => c.gender === 'F').length;
    const ages = accepted.map(c => calcAge(c.dob)).filter(a => typeof a === 'number');
    const avgAge = ages.length ? (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1) : '—';
    return { total, business, engineering, diverse, internal, women, avgAge };
  }

  // ── Time slot suggestions ──────────────────────────────────
  // 30-minute slots (25 min interview + 5 min break), starting at 09:00
  function getTimeSlots() {
    const slots = [];
    for (let h = 9; h <= 17; h++) {
      for (let m = 0; m < 60; m += 30) {
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
