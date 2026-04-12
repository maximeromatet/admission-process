// ============================================================
//  Candidate Detail — three evaluation modes
//  mode: 'app-review' | 'interview' | 'decision' (default: auto)
// ============================================================

window.CandidateDetailPage = function({ candidateId, mode: modeProp, navigate }) {
  const { useState, useRef } = React;
  const [appState, setAppState] = React.useContext(window.AppStateContext);
  const { candidates, batches } = appState;

  const c = candidates.find(x => x.id === candidateId);

  const [s1Scores, setS1Scores]     = useState(c ? (c.stage1Scores || {}) : {});
  const [s2Scores, setS2Scores]     = useState(c ? (c.stage2Scores || {}) : {});
  const [s1Notes, setS1Notes]       = useState(c ? (c.notes   || '') : '');
  const [s2Notes, setS2Notes]       = useState(c ? (c.s2Notes || '') : '');
  const [savedFlash, setSavedFlash] = useState('');
  const [showLog, setShowLog]       = useState(false);
  const [statusOverride, setStatusOverride] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pdfUrl, setPdfUrl]   = useState(c ? (c.pdfUrl || null) : null);
  const [pdfName, setPdfName] = useState(c && c.pdfUrl ? 'Application PDF' : '');
  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name:           c ? (c.name || '')           : '',
    email:          c ? (c.email || '')          : '',
    phone:          c ? (c.phone || '')          : '',
    school:         c ? (c.school || '')         : '',
    degree:         c ? (c.degree || '')         : '',
    background:     c ? (c.background || '')     : '',
    nationality:    c ? (c.nationality || '')    : '',
    dob:            c ? (c.dob || '')            : '',
    graduationYear: c ? (c.graduationYear || '') : '',
    gender:         c ? (c.gender || 'M')        : 'M',
  });
  const flashTimer   = useRef(null);
  const fileInputRef = useRef(null);

  if (!c) return (
    <div className="card">
      <EmptyState icon="❌" title="Candidate not found" action={
        <button className="btn btn-primary" onClick={() => navigate('candidates')}>Back to Applications</button>
      } />
    </div>
  );

  // ── Resolve mode ──────────────────────────────────────────
  const mode = modeProp || (
    ['pending','app_review'].includes(c.status) ? 'app-review' :
    c.status === 'interview'                    ? 'interview'  :
    'decision'
  );

  const batch   = batches.find(b => b.id === c.batchId);
  const s1Avg   = Utils.s1Avg({ stage1Scores: s1Scores });
  const s2Avg   = Utils.s2Avg({ stage2Scores: s2Scores });
  const overall = (s1Avg !== null && s2Avg !== null) ? ((s1Avg + s2Avg) / 2) : null;
  const missing = Utils.docsMissing(c.docs);
  const docsOk  = missing.length === 0;
  const S1_DONE = Utils.S1_CRITERIA.every(k => s1Scores[k] !== undefined && s1Scores[k] !== null);
  const S2_DONE = Utils.S2_CRITERIA.every(k => s2Scores[k] !== undefined && s2Scores[k] !== null);

  // ── Helpers ───────────────────────────────────────────────
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
    updateCandidate({ stage1Scores: next });
    flash('Saved');
  }

  function handleS2Score(key, val) {
    const next = { ...s2Scores, [key]: val };
    setS2Scores(next);
    updateCandidate({ stage2Scores: next });
    flash('Saved');
  }

  function saveS1Notes() {
    updateCandidate({ notes: s1Notes });
    flash('Notes saved');
  }

  function saveS2Notes() {
    updateCandidate({ s2Notes: s2Notes });
    flash('Notes saved');
  }

  function submitS1() {
    const nextStatus = s1Avg > 3.5 ? 'interview' : 'rejected';
    updateCandidate({ stage1Scores: s1Scores, notes: s1Notes, status: nextStatus });
    addLog('Application Review submitted (avg ' + (s1Avg||0).toFixed(1) + ') → ' + nextStatus);

    // Auto-create unscheduled interview placeholder when candidate advances
    if (nextStatus === 'interview') {
      const newInterview = {
        id: 'i' + Date.now(),
        candidateId: c.id,
        batchId: c.batchId,
        date: '',
        time: '',
        chairId: '',
        alumniIds: [],
        zoomLink: '',
        status: 'To Schedule',
        notes: '',
      };
      setAppState(prev => ({
        ...prev,
        candidates: prev.candidates.map(x => x.id === c.id ? { ...x, stage1Scores: s1Scores, notes: s1Notes, status: nextStatus } : x),
        interviews: [...(prev.interviews || []), newInterview],
      }));
    }

    // Redirect to app_review queue
    navigate('candidates', { tabFilter: 'app_review' });
  }

  function submitS2() {
    let nextStatus = s2Avg > 3.5 ? 'accepted' : s2Avg >= 3.0 ? 'waitlisted' : 'rejected';
    updateCandidate({ stage2Scores: s2Scores, s2Notes: s2Notes, status: nextStatus });
    addLog('Interview submitted (avg ' + (s2Avg||0).toFixed(1) + ') → ' + nextStatus);
    // Redirect to interview queue after submit
    navigate('candidates', { tabFilter: 'interview' });
  }

  function handleDelete() {
    setAppState(prev => ({
      ...prev,
      candidates: prev.candidates.filter(x => x.id !== c.id),
      interviews: prev.interviews.filter(i => i.candidateId !== c.id),
    }));
    navigate('candidates');
  }

  function handleStatusOverride() {
    if (!statusOverride) return;
    updateCandidate({ status: statusOverride });
    addLog('Status changed to: ' + Utils.STATUS_LABELS[statusOverride]);
    setStatusOverride('');
    flash('Updated');
  }

  function handlePdfUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (pdfUrl && pdfUrl.startsWith('blob:')) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(URL.createObjectURL(file));
    setPdfName(file.name);
  }

  function toggleDoc(key) {
    const newDocs = { ...(c.docs || {}), [key]: !(c.docs && c.docs[key]) };
    updateCandidate({ docs: newDocs });
  }

  function saveProfile() {
    updateCandidate({
      ...profileForm,
      graduationYear: parseInt(profileForm.graduationYear) || profileForm.graduationYear,
    });
    setEditProfile(false);
    flash('Profile saved');
  }

  // ── StageHeader ───────────────────────────────────────────
  function StageHeader({ stageLabel, title, color }) {
    return (
      <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:20, paddingBottom:14, borderBottom:'2px solid '+color}}>
        <div style={{background:color, color:'#fff', borderRadius:6, padding:'3px 10px', fontSize:11, fontWeight:700, fontFamily:'var(--font-cond)', letterSpacing:1, textTransform:'uppercase'}}>
          {stageLabel}
        </div>
        <div style={{fontFamily:'var(--font-cond)', fontSize:17, fontWeight:700, color:'var(--navy)'}}>
          {title}
        </div>
        {savedFlash && (
          <div style={{marginLeft:'auto', fontSize:12, color:'#16a34a', fontWeight:600}}>✓ {savedFlash}</div>
        )}
      </div>
    );
  }

  function CriteriaScorer({ criteria, labels, scores, onScore, readOnly }) {
    const done = criteria.filter(k => scores[k] !== undefined && scores[k] !== null).length;
    return (
      <div>
        {!readOnly && (
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:12}}>
            <span style={{fontSize:12, color:'var(--text-light)'}}>{done}/{criteria.length} scored</span>
            {done === criteria.length && <span style={{fontSize:12, color:'#16a34a', fontWeight:600}}>✓ All scored</span>}
          </div>
        )}
        {criteria.map(key => (
          <div key={key} style={{marginBottom:14}}>
            <div style={{fontFamily:'var(--font-cond)', fontSize:12, fontWeight:600, color:'var(--navy)', marginBottom:5}}>
              {labels[key]}
            </div>
            {readOnly
              ? <div style={{display:'flex', alignItems:'center', gap:8}}>
                  <ScoreChip value={scores[key]} />
                  {scores[key] === undefined && <span style={{fontSize:12, color:'var(--text-light)'}}>Not scored</span>}
                </div>
              : <ScoreSelector value={scores[key]} onChange={v => onScore(key, v)} />
            }
          </div>
        ))}
      </div>
    );
  }

  // ── Left column: profile + docs + PDF ────────────────────
  const leftColumn = (
    <div style={{flex:'0 0 58%', display:'flex', flexDirection:'column', gap:14}}>

      {/* Profile card */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Profile</span>
          {!editProfile
            ? <button className="btn btn-outline btn-sm" onClick={() => setEditProfile(true)}>✏ Edit</button>
            : <div style={{display:'flex', gap:8}}>
                <button className="btn btn-ghost btn-sm" onClick={() => { setEditProfile(false); setProfileForm({ name: c.name||'', email: c.email||'', phone: c.phone||'', school: c.school||'', degree: c.degree||'', background: c.background||'', nationality: c.nationality||'', dob: c.dob||'', graduationYear: c.graduationYear||'', gender: c.gender||'M' }); }}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={saveProfile}>✓ Save</button>
              </div>
          }
        </div>
        <div className="card-body">
          <div style={{display:'flex', gap:12, alignItems:'flex-start', marginBottom:12}}>
            <div className="avatar-lg" style={{background: (editProfile ? profileForm.gender : c.gender) === 'F' ? '#9333ea' : 'var(--blue)', flexShrink:0}}>
              {Utils.initials(editProfile ? profileForm.name : c.name)}
            </div>
            <div style={{flex:1, minWidth:0}}>
              {editProfile ? (
                <input
                  className="form-control"
                  style={{fontSize:16, fontWeight:700, marginBottom:4}}
                  value={profileForm.name}
                  onChange={e => setProfileForm(p => ({...p, name: e.target.value}))}
                  placeholder="Full name"
                />
              ) : (
                <div style={{fontFamily:'var(--font-cond)', fontSize:18, fontWeight:800, color:'var(--navy)', lineHeight:1.2}}>
                  {c.name}
                  {c.isInternal && <span style={{marginLeft:8, fontSize:11, color:'var(--blue)', fontWeight:700}}>INTERNAL</span>}
                </div>
              )}
              {editProfile ? (
                <input className="form-control" style={{fontSize:12, marginTop:4}} value={profileForm.email} onChange={e => setProfileForm(p => ({...p, email: e.target.value}))} placeholder="Email" />
              ) : (
                <div style={{fontSize:12, color:'var(--text-light)', marginTop:2}}>{c.school}</div>
              )}
              <div style={{marginTop:6, display:'flex', gap:6, flexWrap:'wrap', alignItems:'center'}}>
                <StatusBadge status={c.status} />
                {batch && <span style={{fontSize:11, color:'var(--text-light)'}}>{batch.name}</span>}
              </div>
            </div>
          </div>

          {editProfile ? (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
              {[
                { label:'School',          key:'school',         type:'text' },
                { label:'Degree',          key:'degree',         type:'text' },
                { label:'Graduation Year', key:'graduationYear', type:'number' },
                { label:'Nationality',     key:'nationality',    type:'text' },
                { label:'Phone',           key:'phone',          type:'text' },
                { label:'Date of Birth',   key:'dob',            type:'date' },
              ].map(({ label, key, type }) => (
                <div key={key} className="form-group" style={{marginBottom:4}}>
                  <label className="form-label" style={{fontSize:10}}>{label}</label>
                  <input className="form-control" style={{fontSize:12}} type={type} value={profileForm[key]} onChange={e => setProfileForm(p => ({...p, [key]: e.target.value}))} />
                </div>
              ))}
              <div className="form-group" style={{marginBottom:4}}>
                <label className="form-label" style={{fontSize:10}}>Background</label>
                <select className="form-control" style={{fontSize:12}} value={profileForm.background} onChange={e => setProfileForm(p => ({...p, background: e.target.value}))}>
                  <option>Business</option>
                  <option>Engineering</option>
                  <option>Diverse</option>
                </select>
              </div>
              <div className="form-group" style={{marginBottom:4}}>
                <label className="form-label" style={{fontSize:10}}>Gender</label>
                <select className="form-control" style={{fontSize:12}} value={profileForm.gender} onChange={e => setProfileForm(p => ({...p, gender: e.target.value}))}>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          ) : (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px 12px', fontSize:12}}>
              <span style={{color:'var(--text-light)'}}>School</span>      <span style={{fontWeight:500}}>{c.school}</span>
              <span style={{color:'var(--text-light)'}}>Degree</span>      <span style={{fontWeight:500}}>{c.degree}</span>
              <span style={{color:'var(--text-light)'}}>Background</span>  <span style={{fontWeight:500}}>{c.background}</span>
              <span style={{color:'var(--text-light)'}}>Nationality</span> <span style={{fontWeight:500}}>{c.nationality}</span>
              <span style={{color:'var(--text-light)'}}>Age</span>         <span style={{fontWeight:500}}>{Utils.calcAge(c.dob)} yo</span>
              <span style={{color:'var(--text-light)'}}>Applied</span>     <span style={{fontWeight:500}}>{Utils.fmtDate(c.applicationDate)}</span>
            </div>
          )}

          {/* Documents — editable during app-review and always */}
          <div style={{marginTop:12, paddingTop:12, borderTop:'1px solid var(--border)'}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
              <span style={{fontSize:11, fontWeight:700, color:'var(--text-light)', textTransform:'uppercase', letterSpacing:1}}>Documents</span>
              {docsOk
                ? <span style={{fontSize:11, color:'#16a34a', fontWeight:600}}>✓ Complete</span>
                : <span style={{fontSize:11, color:'#c05621', fontWeight:600}}>⚠ {missing.length} missing</span>}
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:6}}>
              {Utils.DOC_ITEMS.map(item => {
                const checked = !!(c.docs && c.docs[item.key]);
                return (
                  <label key={item.key} style={{display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:12}}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleDoc(item.key)}
                      style={{cursor:'pointer'}}
                    />
                    <span style={{color: checked ? 'var(--text)' : '#c05621', fontWeight: checked ? 400 : 600}}>
                      {item.label}
                      {!checked && ' ⚠'}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* PDF viewer */}
      <div className="card" style={{overflow:'hidden'}}>
        <div className="card-header">
          <span className="card-title">Application PDF</span>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            {pdfName && <span style={{fontSize:12, color:'var(--text-light)'}}>{pdfName}</span>}
            <button className="btn btn-outline btn-sm" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
              {pdfUrl ? '↺ Replace' : '⬆ Upload PDF'}
            </button>
            <input ref={fileInputRef} type="file" accept=".pdf" style={{display:'none'}} onChange={handlePdfUpload} />
          </div>
        </div>
        {pdfUrl ? (
          <iframe src={pdfUrl} style={{width:'100%', height:'calc(100vh - 200px)', border:'none', display:'block'}} title="Application PDF" />
        ) : (
          <div
            style={{height:'calc(100vh - 200px)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'var(--bg)', cursor:'pointer', gap:12}}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <div style={{fontSize:40}}>📄</div>
            <div style={{fontFamily:'var(--font-cond)', fontSize:16, fontWeight:700, color:'var(--navy)'}}>Upload Application PDF</div>
            <div style={{fontSize:13, color:'var(--text-light)', textAlign:'center', maxWidth:280}}>CV, essays and supporting documents</div>
            <button className="btn btn-primary" style={{marginTop:8}}>Choose PDF</button>
          </div>
        )}
      </div>
    </div>
  );

  // ── Right column: mode-specific panel ────────────────────
  let rightPanel = null;

  if (mode === 'app-review') {
    rightPanel = (
      <div className="card">
        <div className="card-body">
          <StageHeader stageLabel="Application Review" title="Evaluate the file" color="var(--navy)" />

          {!docsOk && (
            <div style={{background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:6, padding:'8px 12px', marginBottom:14, fontSize:12, color:'#c05621'}}>
              ⚠ Missing documents: {missing.join(', ')}. Tick them off on the left as you verify.
            </div>
          )}

          <CriteriaScorer
            criteria={Utils.S1_CRITERIA}
            labels={Utils.S1_LABELS}
            scores={s1Scores}
            onScore={handleS1Score}
          />

          {s1Avg !== null && (
            <div style={{display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:'var(--bg)', borderRadius:6, marginBottom:14}}>
              <span style={{fontSize:12, color:'var(--text-light)'}}>Average</span>
              <ScoreChip value={s1Avg} />
              <span style={{fontSize:11, fontWeight:600, marginLeft:4, color: s1Avg > 3.5 ? '#16a34a' : '#be123c'}}>
                {s1Avg > 3.5 ? '→ Will advance to Interview' : '→ Will be rejected'}
              </span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Reviewer Notes</label>
            <textarea
              className="form-control"
              value={s1Notes}
              onChange={e => setS1Notes(e.target.value)}
              onBlur={saveS1Notes}
              placeholder="Key observations from the application…"
              rows={4}
            />
            <div style={{fontSize:11, color:'var(--text-light)', marginTop:3}}>Auto-saves on click away</div>
          </div>

          <button
            className="btn btn-primary"
            style={{width:'100%', padding:'11px 0', fontSize:14, marginTop:8}}
            onClick={submitS1}
            disabled={!S1_DONE}
          >
            {S1_DONE
              ? '✓ Submit'
              : 'Score all 5 criteria to submit (' + Object.keys(s1Scores).filter(k => s1Scores[k] !== undefined).length + '/5)'}
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'interview') {
    rightPanel = (
      <div style={{display:'flex', flexDirection:'column', gap:14}}>
        {/* S1 summary — read only */}
        <div className="card" style={{borderLeft:'3px solid var(--navy)'}}>
          <div className="card-header">
            <span className="card-title" style={{fontSize:13}}>Application Review — Summary</span>
            {s1Avg !== null && <ScoreChip value={s1Avg} />}
          </div>
          <div className="card-body" style={{paddingTop:8}}>
            <CriteriaScorer criteria={Utils.S1_CRITERIA} labels={Utils.S1_LABELS} scores={c.stage1Scores || {}} readOnly />
            {c.notes && (
              <div style={{marginTop:10, padding:'8px 10px', background:'var(--bg)', borderRadius:6, fontSize:12, fontStyle:'italic', color:'var(--text)', borderLeft:'2px solid var(--border)'}}>
                <div style={{fontSize:10, fontWeight:700, color:'var(--text-light)', textTransform:'uppercase', letterSpacing:1, marginBottom:4}}>Reviewer notes</div>
                {c.notes}
              </div>
            )}
          </div>
        </div>

        {/* Interview scoring */}
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
              <div style={{display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:'var(--bg)', borderRadius:6, marginBottom:14}}>
                <span style={{fontSize:12, color:'var(--text-light)'}}>S2 avg</span>
                <ScoreChip value={s2Avg} />
                {overall !== null && <>
                  <span style={{fontSize:12, color:'var(--text-light)', marginLeft:4}}>Overall</span>
                  <ScoreChip value={overall} />
                </>}
                <span style={{fontSize:11, fontWeight:600, marginLeft:4,
                  color: s2Avg > 3.5 ? '#16a34a' : s2Avg >= 3.0 ? '#d97706' : '#be123c'}}>
                  {s2Avg > 3.5 ? '→ Accepted' : s2Avg >= 3.0 ? '→ Waitlisted' : '→ Rejected'}
                </span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Interview Notes</label>
              <textarea
                className="form-control"
                value={s2Notes}
                onChange={e => setS2Notes(e.target.value)}
                onBlur={saveS2Notes}
                placeholder="Key impressions from the interview…"
                rows={4}
              />
              <div style={{fontSize:11, color:'var(--text-light)', marginTop:3}}>Auto-saves on click away</div>
            </div>

            <button
              className="btn btn-primary"
              style={{width:'100%', padding:'11px 0', fontSize:14, marginTop:8, background:'var(--blue)'}}
              onClick={submitS2}
              disabled={!S2_DONE}
            >
              {S2_DONE
                ? '✓ Submit'
                : 'Score all 5 criteria to submit (' + Object.keys(s2Scores).filter(k => s2Scores[k] !== undefined).length + '/5)'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'decision') {
    rightPanel = (
      <div style={{display:'flex', flexDirection:'column', gap:14}}>

        {/* Decision control */}
        <div className="card" style={{borderLeft:'3px solid ' + (Utils.PIPELINE_COLORS[c.status] || 'var(--border)')}}>
          <div className="card-body">
            <div style={{fontSize:11, fontWeight:700, color:'var(--text-light)', textTransform:'uppercase', letterSpacing:1, marginBottom:12}}>
              Final Decision
            </div>
            <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:16}}>
              <StatusBadge status={c.status} />
              {overall !== null && (
                <span style={{fontSize:13, color:'var(--text-light)'}}>Overall: <strong>{overall.toFixed(2)}</strong></span>
              )}
            </div>
            <div style={{display:'flex', gap:8, marginBottom:12}}>
              {['accepted','waitlisted','rejected'].map(s => (
                <button
                  key={s}
                  className="btn btn-sm"
                  style={{
                    flex:1, fontWeight:600, fontSize:12, cursor:'pointer', borderRadius:6, padding:'7px 0',
                    background: c.status === s
                      ? (s === 'accepted' ? '#16a34a' : s === 'waitlisted' ? '#d97706' : '#be123c')
                      : '#fff',
                    border: '1.5px solid ' + (s === 'accepted' ? '#16a34a' : s === 'waitlisted' ? '#d97706' : '#be123c'),
                    color: c.status === s ? '#fff'
                      : (s === 'accepted' ? '#16a34a' : s === 'waitlisted' ? '#d97706' : '#be123c'),
                  }}
                  onClick={() => {
                    updateCandidate({ status: s });
                    addLog('Decision changed to: ' + Utils.STATUS_LABELS[s]);
                    flash('Updated');
                  }}
                >
                  {Utils.STATUS_LABELS[s]}
                </button>
              ))}
            </div>
            <div style={{display:'flex', gap:8}}>
              <select className="form-control" style={{flex:1, fontSize:12}} value={statusOverride} onChange={e => setStatusOverride(e.target.value)}>
                <option value="">Move to another stage…</option>
                {Utils.STATUS_ORDER.filter(s => !['accepted','waitlisted','rejected'].includes(s)).map(s => (
                  <option key={s} value={s}>{Utils.STATUS_LABELS[s]}</option>
                ))}
              </select>
              <button className="btn btn-outline btn-sm" onClick={handleStatusOverride} disabled={!statusOverride}>Apply</button>
            </div>
          </div>
        </div>

        {/* App Review — editable */}
        <div className="card" style={{borderLeft:'3px solid var(--navy)'}}>
          <div className="card-header">
            <span className="card-title" style={{fontSize:13}}>Application Review</span>
            {s1Avg !== null && <ScoreChip value={s1Avg} />}
          </div>
          <div className="card-body" style={{paddingTop:8}}>
            <CriteriaScorer criteria={Utils.S1_CRITERIA} labels={Utils.S1_LABELS} scores={s1Scores} onScore={handleS1Score} />
            <div className="form-group" style={{marginTop:8}}>
              <label className="form-label">Reviewer Notes</label>
              <textarea
                className="form-control"
                value={s1Notes}
                onChange={e => setS1Notes(e.target.value)}
                onBlur={saveS1Notes}
                placeholder="Application review notes…"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Interview — editable */}
        <div className="card" style={{borderLeft:'3px solid var(--blue)'}}>
          <div className="card-header">
            <span className="card-title" style={{fontSize:13}}>Interview</span>
            {s2Avg !== null && <ScoreChip value={s2Avg} />}
          </div>
          <div className="card-body" style={{paddingTop:8}}>
            <CriteriaScorer criteria={Utils.S2_CRITERIA} labels={Utils.S2_LABELS} scores={s2Scores} onScore={handleS2Score} />
            <div className="form-group" style={{marginTop:8}}>
              <label className="form-label">Interview Notes</label>
              <textarea
                className="form-control"
                value={s2Notes}
                onChange={e => setS2Notes(e.target.value)}
                onBlur={saveS2Notes}
                placeholder="Interview notes…"
                rows={2}
              />
            </div>
          </div>
        </div>

      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────
  const backLabel  = mode === 'interview' ? '← Interview Schedule' : '← Applications';
  const backTarget = mode === 'interview' ? 'schedule' : 'candidates';

  return (
    <div>
      {/* Top bar */}
      <div className="action-bar" style={{marginBottom:12}}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(backTarget)}>{backLabel}</button>
        <div style={{flex:1}} />
        {savedFlash && <span style={{fontSize:13, color:'#16a34a', fontWeight:600}}>✓ {savedFlash}</span>}
        <button className="btn btn-ghost btn-sm" onClick={() => setShowLog(v => !v)} style={{fontSize:12}}>
          📋 {showLog ? 'Hide Log' : 'Activity Log'}
        </button>
        {mode !== 'decision' && (
          <>
            <select className="form-control" style={{minWidth:160, padding:'6px 10px', fontSize:13}} value={statusOverride} onChange={e => setStatusOverride(e.target.value)}>
              <option value="">Override status…</option>
              {Utils.STATUS_ORDER.map(s => <option key={s} value={s}>{Utils.STATUS_LABELS[s]}</option>)}
            </select>
            <button className="btn btn-outline btn-sm" onClick={handleStatusOverride} disabled={!statusOverride}>Apply</button>
          </>
        )}
        <button
          className="btn btn-sm"
          onClick={() => setShowDeleteConfirm(true)}
          style={{
            background:'#fff1f2', color:'#be123c',
            border:'1.5px solid #fecdd3', marginLeft:4,
          }}
        >
          🗑 Delete
        </button>
      </div>

      {showLog && (
        <div className="card" style={{marginBottom:14}}>
          <div className="card-header"><span className="card-title">Activity Log</span></div>
          <div className="card-body"><ActivityLog log={c.activityLog} /></div>
        </div>
      )}

      <div style={{display:'flex', gap:16, alignItems:'flex-start'}}>
        {leftColumn}
        <div style={{flex:'0 0 calc(42% - 16px)'}}>
          {rightPanel}
        </div>
      </div>

      <ConfirmModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title={"Delete " + c.name + "?"}
        message={"This will permanently remove " + c.name + "'s profile, scores, notes, and any associated interviews. This action cannot be undone."}
        danger
      />
    </div>
  );
};