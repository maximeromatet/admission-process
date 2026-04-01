// ============================================================
//  Candidate Detail Page — PDF-first evaluator layout
// ============================================================

window.CandidateDetailPage = function({ candidateId, navigate }) {
  const { useState, useRef } = React;
  const [appState, setAppState] = React.useContext(window.AppStateContext);
  const { candidates, batches, users } = appState;

  const c = candidates.find(x => x.id === candidateId);

  const [s1Scores, setS1Scores]     = useState(c ? (c.stage1Scores || {}) : {});
  const [s2Scores, setS2Scores]     = useState(c ? (c.stage2Scores || {}) : {});
  const [s1Notes, setS1Notes]       = useState(c ? (c.notes || '') : '');
  const [s2Notes, setS2Notes]       = useState(c ? (c.s2Notes || '') : '');
  const [savedFlash, setSavedFlash] = useState('');
  const [showLog, setShowLog]       = useState(false);
  const [showDocsWarning, setShowDocsWarning] = useState(false);
  const [statusOverride, setStatusOverride]   = useState('');
  const [pdfUrl, setPdfUrl]         = useState(c ? (c.pdfUrl || null) : null);
  const [pdfName, setPdfName]       = useState(c && c.pdfUrl ? 'Application PDF' : '');
  const flashTimer = useRef(null);
  const fileInputRef = useRef(null);

  if (!c) return (
    <div className="card">
      <EmptyState icon="❌" title="Candidate not found" action={
        <button className="btn btn-primary" onClick={() => navigate('candidates')}>Back to Applications</button>
      } />
    </div>
  );

  const batch       = batches.find(b => b.id === c.batchId);
  const s1Avg       = Utils.s1Avg({ stage1Scores: s1Scores });
  const s2Avg       = Utils.s2Avg({ stage2Scores: s2Scores });
  const overall     = (s1Avg !== null && s2Avg !== null) ? ((s1Avg + s2Avg) / 2) : null;
  const missing     = Utils.docsMissing(c.docs);
  const docsOk      = missing.length === 0;

  const S1_DONE = Utils.S1_CRITERIA.every(k => s1Scores[k] !== undefined && s1Scores[k] !== null);
  const S2_DONE = Utils.S2_CRITERIA.every(k => s2Scores[k] !== undefined && s2Scores[k] !== null);

  const isAppReview     = ['pending', 'app_review'].includes(c.status);
  const isInterview     = c.status === 'interview';
  const isDecisionDone  = ['accepted', 'waitlisted', 'rejected'].includes(c.status);

  // ── helpers ───────────────────────────────────────────────
  function flash(msg) {
    setSavedFlash(msg);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setSavedFlash(''), 2000);
  }

  function updateCandidate(patch) {
    setAppState(prev => ({
      ...prev,
      candidates: prev.candidates.map(x => x.id === c.id ? { ...x, ...patch } : x),
    }));
  }

  function addLog(action) {
    const entry = { action, time: new Date().toISOString() };
    updateCandidate({ activityLog: [...(c.activityLog || []), entry] });
  }

  function handleS1Score(key, val) {
    const next = { ...s1Scores, [key]: val };
    setS1Scores(next);
    updateCandidate({ stage1Scores: next, status: c.status === 'pending' ? 'app_review' : c.status });
    flash('Saved');
  }

  function handleS2Score(key, val) {
    const next = { ...s2Scores, [key]: val };
    setS2Scores(next);
    updateCandidate({ stage2Scores: next });
    flash('Saved');
  }

  function submitS1() {
    if (!docsOk) { setShowDocsWarning(true); return; }
    const nextStatus = s1Avg > 3.5 ? 'interview' : 'rejected';
    updateCandidate({ stage1Scores: s1Scores, notes: s1Notes, status: nextStatus });
    addLog('Application Review submitted (avg ' + s1Avg.toFixed(1) + ') → ' + nextStatus);
    flash('Submitted');
  }

  function submitS2() {
    let nextStatus;
    if (s2Avg > 3.5)      nextStatus = 'accepted';
    else if (s2Avg >= 3.0) nextStatus = 'waitlisted';
    else                   nextStatus = 'rejected';
    updateCandidate({ stage2Scores: s2Scores, s2Notes: s2Notes, status: nextStatus });
    addLog('Interview submitted (avg ' + s2Avg.toFixed(1) + ') → ' + nextStatus);
    flash('Submitted');
  }

  function handleStatusOverride() {
    if (!statusOverride) return;
    updateCandidate({ status: statusOverride });
    addLog('Status overridden to: ' + Utils.STATUS_LABELS[statusOverride]);
    setStatusOverride('');
    flash('Updated');
  }

  function handlePdfUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(URL.createObjectURL(file));
    setPdfName(file.name);
  }

  // ── sub-components ────────────────────────────────────────
  function StageHeader({ stageLabel, title, color }) {
    return (
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20, paddingBottom:14, borderBottom:'2px solid '+color }}>
        <div style={{ background:color, color:'#fff', borderRadius:6, padding:'3px 10px', fontSize:11, fontWeight:700, fontFamily:'var(--font-cond)', letterSpacing:1, textTransform:'uppercase' }}>
          {stageLabel}
        </div>
        <div style={{ fontFamily:'var(--font-cond)', fontSize:17, fontWeight:700, color:'var(--navy)' }}>
          {title}
        </div>
        {savedFlash && (
          <div style={{ marginLeft:'auto', fontSize:12, color:'#16a34a', fontWeight:600 }}>✓ {savedFlash}</div>
        )}
      </div>
    );
  }

  function CriteriaScorer({ criteria, labels, scores, onScore }) {
    const done = criteria.filter(k => scores[k] !== undefined && scores[k] !== null).length;
    return (
      <div>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
          <span style={{ fontSize:12, color:'var(--text-light)' }}>{done}/{criteria.length} criteria scored</span>
          {done === criteria.length && <span style={{ fontSize:12, color:'#16a34a', fontWeight:600 }}>✓ All scored</span>}
        </div>
        {criteria.map(key => (
          <div key={key} style={{ marginBottom:14 }}>
            <div style={{ fontFamily:'var(--font-cond)', fontSize:12, fontWeight:600, color:'var(--navy)', marginBottom:5 }}>
              {labels[key]}
            </div>
            <ScoreSelector value={scores[key]} onChange={v => onScore(key, v)} />
          </div>
        ))}
      </div>
    );
  }

  function S1Summary() {
    if (!['interview','accepted','waitlisted','rejected'].includes(c.status)) return null;
    return (
      <div style={{ borderTop:'1px solid var(--border)', paddingTop:14, marginTop:14 }}>
        <div style={{ fontSize:11, fontWeight:700, color:'var(--text-light)', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>
          Application Review
        </div>
        {Utils.S1_CRITERIA.map(key => (
          <div key={key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
            <span style={{ fontSize:12, color:'var(--text-light)' }}>{Utils.S1_LABELS[key]}</span>
            <ScoreChip value={c.stage1Scores ? c.stage1Scores[key] : undefined} />
          </div>
        ))}
        {s1Avg !== null && (
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8, paddingTop:8, borderTop:'1px solid var(--border)' }}>
            <span style={{ fontSize:12, fontWeight:600, color:'var(--navy)' }}>S1 Average</span>
            <ScoreChip value={s1Avg} />
          </div>
        )}
        {c.notes && (
          <div style={{ marginTop:10, padding:'8px 10px', background:'var(--bg)', borderRadius:6, fontSize:12, color:'var(--text)', fontStyle:'italic', borderLeft:'2px solid var(--border)' }}>
            {c.notes}
          </div>
        )}
      </div>
    );
  }

  // ── render ────────────────────────────────────────────────
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>

      {/* Top bar */}
      <div className="action-bar" style={{ marginBottom:12 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('candidates')}>← Applications</button>
        <div style={{ flex:1 }} />
        {savedFlash && <span style={{ fontSize:13, color:'#16a34a', fontWeight:600 }}>✓ {savedFlash}</span>}
        <button className="btn btn-ghost btn-sm" onClick={() => setShowLog(v => !v)} style={{ fontSize:12 }}>
          📋 {showLog ? 'Hide Log' : 'Activity Log'}
        </button>
        <select className="form-control" style={{ minWidth:160, padding:'6px 10px', fontSize:13 }} value={statusOverride} onChange={e => setStatusOverride(e.target.value)}>
          <option value="">Override status…</option>
          {Utils.STATUS_ORDER.map(s => <option key={s} value={s}>{Utils.STATUS_LABELS[s]}</option>)}
        </select>
        <button className="btn btn-outline btn-sm" onClick={handleStatusOverride} disabled={!statusOverride}>Apply</button>
      </div>

      {/* Activity log */}
      {showLog && (
        <div className="card" style={{ marginBottom:14 }}>
          <div className="card-header"><span className="card-title">Activity Log</span></div>
          <div className="card-body"><ActivityLog log={c.activityLog} /></div>
        </div>
      )}

      {/* Main layout — PDF left, evaluator right */}
      <div style={{ display:'flex', gap:16, alignItems:'flex-start', flex:1 }}>

        {/* ── LEFT — PDF viewer ─────────────────────────────── */}
        <div style={{ flex:'0 0 58%', display:'flex', flexDirection:'column', gap:12 }}>
          <div className="card" style={{ overflow:'hidden' }}>
            <div className="card-header">
              <span className="card-title">Application PDF</span>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                {pdfName && <span style={{ fontSize:12, color:'var(--text-light)' }}>{pdfName}</span>}
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  {pdfUrl ? '↺ Replace PDF' : '⬆ Upload PDF'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  style={{ display:'none' }}
                  onChange={handlePdfUpload}
                />
              </div>
            </div>

            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                style={{ width:'100%', height:'calc(100vh - 200px)', border:'none', display:'block' }}
                title="Application PDF"
              />
            ) : (
              <div
                style={{
                  height:'calc(100vh - 200px)', display:'flex', flexDirection:'column',
                  alignItems:'center', justifyContent:'center', background:'var(--bg)',
                  cursor:'pointer', gap:12,
                }}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                <div style={{ fontSize:40 }}>📄</div>
                <div style={{ fontFamily:'var(--font-cond)', fontSize:16, fontWeight:700, color:'var(--navy)' }}>
                  Upload Application PDF
                </div>
                <div style={{ fontSize:13, color:'var(--text-light)', textAlign:'center', maxWidth:280 }}>
                  Click to upload the candidate's application file (CV, essays, documents)
                </div>
                <button className="btn btn-primary" style={{ marginTop:8 }}>Choose PDF</button>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT — evaluator panel ───────────────────────── */}
        <div style={{ flex:'0 0 calc(42% - 16px)', display:'flex', flexDirection:'column', gap:14 }}>

          {/* Profile summary */}
          <div className="card">
            <div className="card-body" style={{ paddingBottom:14 }}>
              <div style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:12 }}>
                <div className="avatar-lg" style={{ background: c.gender === 'F' ? '#9333ea' : 'var(--blue)', flexShrink:0 }}>
                  {Utils.initials(c.name)}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:'var(--font-cond)', fontSize:18, fontWeight:800, color:'var(--navy)', lineHeight:1.2 }}>
                    {c.name}
                    {c.isInternal && <span style={{ marginLeft:8, fontSize:11, color:'var(--blue)', fontWeight:700 }}>X-INTERNAL</span>}
                  </div>
                  <div style={{ fontSize:12, color:'var(--text-light)', marginTop:2 }}>{c.school}</div>
                  <div style={{ marginTop:6, display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                    <StatusBadge status={c.status} />
                    {batch && <span style={{ fontSize:11, color:'var(--text-light)' }}>{batch.name}</span>}
                  </div>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px 12px', fontSize:12 }}>
                <span style={{ color:'var(--text-light)' }}>Degree</span>
                <span style={{ color:'var(--text)', fontWeight:500 }}>{c.degree}</span>
                <span style={{ color:'var(--text-light)' }}>Background</span>
                <span style={{ color:'var(--text)', fontWeight:500 }}>{c.background}</span>
                <span style={{ color:'var(--text-light)' }}>Nationality</span>
                <span style={{ color:'var(--text)', fontWeight:500 }}>{c.nationality}</span>
                <span style={{ color:'var(--text-light)' }}>Age</span>
                <span style={{ color:'var(--text)', fontWeight:500 }}>{Utils.calcAge(c.dob)} yo</span>
                <span style={{ color:'var(--text-light)' }}>Applied</span>
                <span style={{ color:'var(--text)', fontWeight:500 }}>{Utils.fmtDate(c.applicationDate)}</span>
              </div>

              {/* Docs */}
              <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid var(--border)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:'var(--text-light)', textTransform:'uppercase', letterSpacing:1 }}>Documents</span>
                  {docsOk
                    ? <span style={{ fontSize:11, color:'#16a34a', fontWeight:600 }}>✓ Complete</span>
                    : <span style={{ fontSize:11, color:'#c05621', fontWeight:600 }}>⚠ {missing.length} missing</span>}
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                  {Utils.DOC_ITEMS.map(item => (
                    <span key={item.key} style={{
                      fontSize:10, padding:'2px 7px', borderRadius:10, fontWeight:600,
                      background: c.docs && c.docs[item.key] ? '#d1fae5' : '#fee2e2',
                      color: c.docs && c.docs[item.key] ? '#065f46' : '#991b1b',
                    }}>
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* S1 summary visible during interview */}
              <S1Summary />
            </div>
          </div>

          {/* ── Application Review panel ── */}
          {isAppReview && (
            <div className="card">
              <div className="card-body">
                <StageHeader stageLabel="Application Review" title="Evaluate the file" color="var(--navy)" />

                {!docsOk && (
                  <div style={{ background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:6, padding:'8px 12px', marginBottom:14, fontSize:12, color:'#c05621' }}>
                    ⚠ Missing: {missing.join(', ')}
                  </div>
                )}

                <CriteriaScorer
                  criteria={Utils.S1_CRITERIA}
                  labels={Utils.S1_LABELS}
                  scores={s1Scores}
                  onScore={handleS1Score}
                />

                {s1Avg !== null && (
                  <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:'var(--bg)', borderRadius:6, marginBottom:14 }}>
                    <span style={{ fontSize:12, color:'var(--text-light)' }}>Average</span>
                    <ScoreChip value={s1Avg} />
                    <span style={{ fontSize:11, color: s1Avg > 3.5 ? '#16a34a' : '#be123c', fontWeight:600, marginLeft:4 }}>
                      {s1Avg > 3.5 ? '→ Advances to Interview' : '→ Will be rejected'}
                    </span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Evaluator Notes</label>
                  <textarea className="form-control" value={s1Notes}
                    onChange={e => setS1Notes(e.target.value)}
                    onBlur={() => { updateCandidate({ notes: s1Notes }); flash('Notes saved'); }}
                    placeholder="Key observations from the application…" rows={3}
                  />
                  <div style={{ fontSize:11, color:'var(--text-light)', marginTop:3 }}>Auto-saves on click away</div>
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width:'100%', padding:'11px 0', fontSize:14, marginTop:4 }}
                  onClick={submitS1}
                  disabled={!S1_DONE}
                >
                  {S1_DONE
                    ? '✓ Submit Application Review'
                    : 'Score all criteria to submit (' + Object.keys(s1Scores).filter(k => s1Scores[k] !== undefined).length + '/5)'}
                </button>
              </div>
            </div>
          )}

          {/* ── Interview panel ── */}
          {isInterview && (
            <div className="card">
              <div className="card-body">
                <StageHeader stageLabel="Interview" title="Evaluate the interview" color="var(--blue)" />

                <CriteriaScorer
                  criteria={Utils.S2_CRITERIA}
                  labels={Utils.S2_LABELS}
                  scores={s2Scores}
                  onScore={handleS2Score}
                />

                {s2Avg !== null && (
                  <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:'var(--bg)', borderRadius:6, marginBottom:14 }}>
                    <span style={{ fontSize:12, color:'var(--text-light)' }}>Average</span>
                    <ScoreChip value={s2Avg} />
                    {overall !== null && <>
                      <span style={{ fontSize:12, color:'var(--text-light)', marginLeft:4 }}>Overall</span>
                      <ScoreChip value={overall} />
                    </>}
                    <span style={{ fontSize:11, fontWeight:600, marginLeft:4,
                      color: s2Avg > 3.5 ? '#16a34a' : s2Avg >= 3.0 ? '#d97706' : '#be123c' }}>
                      {s2Avg > 3.5 ? '→ Accepted' : s2Avg >= 3.0 ? '→ Waitlisted' : '→ Rejected'}
                    </span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Interview Notes</label>
                  <textarea className="form-control" value={s2Notes}
                    onChange={e => setS2Notes(e.target.value)}
                    onBlur={() => { updateCandidate({ s2Notes: s2Notes }); flash('Notes saved'); }}
                    placeholder="Key impressions from the interview…" rows={3}
                  />
                  <div style={{ fontSize:11, color:'var(--text-light)', marginTop:3 }}>Auto-saves on click away</div>
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width:'100%', padding:'11px 0', fontSize:14, marginTop:4, background:'var(--blue)' }}
                  onClick={submitS2}
                  disabled={!S2_DONE}
                >
                  {S2_DONE
                    ? '✓ Submit Interview Evaluation'
                    : 'Score all criteria to submit (' + Object.keys(s2Scores).filter(k => s2Scores[k] !== undefined).length + '/5)'}
                </button>
              </div>
            </div>
          )}

          {/* ── Final decision panel ── */}
          {isDecisionDone && (
            <div className="card" style={{ borderLeft:'3px solid ' + Utils.PIPELINE_COLORS[c.status] }}>
              <div className="card-body">
                <div style={{ fontSize:11, fontWeight:700, color:'var(--text-light)', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>
                  Final Decision
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <StatusBadge status={c.status} />
                  {overall !== null && (
                    <span style={{ fontSize:13, color:'var(--text-light)' }}>
                      Overall score: <strong>{overall.toFixed(2)}</strong>
                    </span>
                  )}
                </div>
                {c.s2Notes && (
                  <div style={{ marginTop:10, padding:'8px 10px', background:'var(--bg)', borderRadius:6, fontSize:12, fontStyle:'italic', color:'var(--text)', borderLeft:'2px solid var(--border)' }}>
                    {c.s2Notes}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Docs warning modal */}
      <Modal
        open={showDocsWarning}
        onClose={() => setShowDocsWarning(false)}
        title="⚠ Incomplete Documents"
        size="sm"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowDocsWarning(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={() => {
              setShowDocsWarning(false);
              const nextStatus = s1Avg > 3.5 ? 'interview' : 'rejected';
              updateCandidate({ stage1Scores: s1Scores, notes: s1Notes, status: nextStatus });
              addLog('Application Review submitted with missing docs → ' + nextStatus);
            }}>Submit Anyway</button>
          </>
        }
      >
        <p style={{ fontSize:13, marginBottom:10 }}>The following documents are missing:</p>
        <ul style={{ paddingLeft:18, fontSize:13, color:'#c05621' }}>
          {missing.map(m => <li key={m}>{m}</li>)}
        </ul>
      </Modal>
    </div>
  );
};