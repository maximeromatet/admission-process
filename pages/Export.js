// ============================================================
//  Export Page
// ============================================================

window.ExportPage = function() {
  const { useState } = React;
  const [appState] = React.useContext(window.AppStateContext);
  const { candidates, batches } = appState;
  const [batchChecks, setBatchChecks] = useState(
    Object.fromEntries(batches.map(b => [b.id, true]))
  );
  const [copiedId, setCopiedId] = useState(null);

  const selectedBatches = batches.filter(b => batchChecks[b.id]);
  const exportCands = candidates.filter(c => batchChecks[c.batchId]);

  function toCSV() {
    const headers = [
      'ID','Name','Email','Phone','Nationality','School','Degree','GradYear',
      'Background','Gender','DOB','Age','Batch','Internal','Status',
      'ApplicationReview_Academic','ApplicationReview_Entrepreneurial','ApplicationReview_Professional','ApplicationReview_Essay','ApplicationReview_International','ApplicationReview_Avg',
      'Interview_Alignment','Interview_Mindset','Interview_Motivation','Interview_Resilience','Interview_Communication','Interview_Avg',
      'Overall','AutoDecision','ApplicationDate'
    ];

      const rows = exportCands.map(c => {
      const s1 = c.stage1Scores || {};
      const s2 = c.stage2Scores || {};
      const s1a = Utils.s1Avg(c);
      const s2a = Utils.s2Avg(c);
      const oa = Utils.overallAvg(c);
      const auto = Utils.autoDecision(c);
      return [
        c.id, c.name, c.email, c.phone, c.nationality, c.school, c.degree, c.graduationYear,
        c.background, c.gender, c.dob, Utils.calcAge(c.dob),
        (batches.find(b => b.id === c.batchId) || {}).name || c.batchId,
        c.isInternal ? 'Yes' : 'No', c.status,
        s1.academic ?? '', s1.entrepreneurial ?? '', s1.professional ?? '', s1.essay ?? '', s1.international ?? '',
        s1a !== null ? s1a.toFixed(2) : '',
        s2.alignment ?? '', s2.mindset ?? '', s2.motivation ?? '', s2.resilience ?? '', s2.communication ?? '',
        s2a !== null ? s2a.toFixed(2) : '',
        oa !== null ? oa.toFixed(2) : '',
        auto || '',
        c.applicationDate,
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'xhec_candidates_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function emailTemplate(candidate, type) {
    const batch = (batches.find(b => b.id === candidate.batchId) || {}).name || '';
    const templates = {
      accepted: `Dear ${candidate.name},\n\nWe are delighted to inform you that you have been selected to join the MSc X-HEC Entrepreneurs programme — ${batch}.\n\nYour application demonstrated exceptional promise, and we look forward to welcoming you to our community of entrepreneurs.\n\nPlease confirm your enrolment by responding to this email within 7 days.\n\nWarm regards,\nMSc X-HEC Entrepreneurs Admissions Committee\nHEC Paris | École Polytechnique`,
      waitlisted: `Dear ${candidate.name},\n\nThank you for your application to the MSc X-HEC Entrepreneurs programme — ${batch}.\n\nAfter careful review, we have placed your application on our waiting list. You will be notified if a place becomes available.\n\nWe encourage you to keep us informed of any significant updates to your profile.\n\nSincerely,\nMSc X-HEC Entrepreneurs Admissions Committee`,
      rejected: `Dear ${candidate.name},\n\nThank you for your interest in the MSc X-HEC Entrepreneurs programme — ${batch}.\n\nAfter thorough consideration, we regret that we are unable to offer you a place in this intake. The competition was extremely strong this cycle.\n\nWe encourage you to reapply in a future round and wish you every success.\n\nKind regards,\nMSc X-HEC Entrepreneurs Admissions Committee`,
    };
    return templates[type] || '';
  }

  function copyTemplate(candidateId, type) {
    const cand = candidates.find(c => c.id === candidateId);
    if (!cand) return;
    const text = emailTemplate(cand, type);
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(candidateId + type);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  const decisionCands = exportCands.filter(c => ['accepted','waitlisted','rejected'].includes(c.status));

  return (
    <div>
      {/* CSV Export */}
      <div className="card mb-20" style={{marginBottom:20}}>
        <div className="card-header">
          <span className="card-title">CSV Export</span>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Include Rounds</label>
            <div style={{display:'flex', flexWrap:'wrap', gap:12, marginTop:4}}>
              {batches.map(b => (
                <label key={b.id} style={{display:'flex', alignItems:'center', gap:7, cursor:'pointer', fontSize:13}}>
                  <input
                    type="checkbox"
                    checked={!!batchChecks[b.id]}
                    onChange={e => setBatchChecks(prev => ({ ...prev, [b.id]: e.target.checked }))}
                    style={{accentColor:'var(--navy)'}}
                  />
                  {b.name}
                </label>
              ))}
            </div>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:14, marginTop:8}}>
            <button className="btn btn-primary" onClick={toCSV} disabled={exportCands.length === 0}>
              ⬇ Download CSV ({exportCands.length} candidates)
            </button>
            <span style={{fontSize:12, color:'var(--text-light)'}}>
              Includes all profile fields, 10 individual scores, averages and auto-decisions.
            </span>
          </div>
        </div>
      </div>

      {/* Email Templates */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Email Templates</span>
          <span style={{fontSize:12, color:'var(--text-light)'}}>
            {decisionCands.length} candidate{decisionCands.length !== 1 ? 's' : ''} with decisions
          </span>
        </div>
        <div className="card-body">
          {decisionCands.length === 0 ? (
            <EmptyState icon="📧" title="No candidates with decisions yet" />
          ) : (
            decisionCands.map(c => (
              <div key={c.id} style={{
                padding:'14px 0', borderBottom:'1px solid var(--border)',
                display:'flex', alignItems:'center', gap:14
              }}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600, color:'var(--navy)', fontFamily:'var(--font-cond)', fontSize:15}}>
                    {c.name}
                  </div>
                  <div style={{fontSize:12, color:'var(--text-light)'}}>
                    {(batches.find(b => b.id === c.batchId) || {}).name} · {c.email}
                  </div>
                </div>
                <StatusBadge status={c.status} />
                <button
                  className={"btn btn-sm " + (copiedId === c.id + c.status ? 'btn-accent' : 'btn-ghost')}
                  onClick={() => copyTemplate(c.id, c.status)}
                >
                  {copiedId === c.id + c.status ? '✓ Copied!' : '📋 Copy Template'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
