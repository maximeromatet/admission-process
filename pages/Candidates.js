// ============================================================
//  Candidates (Applications) Page
// ============================================================

window.CandidatesPage = function({ navigate, initialFilter }) {
  const { useState, useMemo, useRef } = React;
  const [appState, setAppState] = React.useContext(window.AppStateContext);
  const { candidates, batches } = appState;

  const [activeTab, setActiveTab]     = useState(initialFilter ? initialFilter.tabFilter || 'all' : 'all');
  const [search, setSearch]           = useState('');
  const [batchFilter, setBatchFilter] = useState(initialFilter ? initialFilter.batchFilter || '' : '');
  const [bgFilter, setBgFilter]       = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const EMPTY_FORM = {
    name: '', email: '', phone: '', nationality: 'French',
    school: '', degree: '', graduationYear: new Date().getFullYear(),
    background: 'Business', gender: 'M', dob: '',
    batchId: 'r3',
    notes: '', s2Notes: '', pdfUrl: '',
    docs: { degree: false, transcripts: false, cv: false, english: false, essay: false, references: false, photo: false },
  };
  const [form, setForm]     = useState(EMPTY_FORM);
  const [pdfFile, setPdfFile] = useState(null);
  const pdfInputRef = useRef(null);

  const TABS = [
    { id: 'all',        label: 'All' },
    { id: 'app_review', label: 'App Review', statuses: ['pending','app_review'] },
    { id: 'interview',  label: 'Interview',  statuses: ['interview'] },
    { id: 'accepted',   label: 'Accepted',   statuses: ['accepted'] },
    { id: 'waitlisted', label: 'Waitlisted', statuses: ['waitlisted'] },
    { id: 'rejected',   label: 'Rejected',   statuses: ['rejected'] },
  ];

  const filtered = useMemo(() => {
    let list = [...candidates];
    const tab = TABS.find(t => t.id === activeTab);
    if (tab && tab.statuses) list = list.filter(c => tab.statuses.includes(c.status));
    if (batchFilter) list = list.filter(c => c.batchId === batchFilter);
    if (bgFilter)    list = list.filter(c => c.background === bgFilter);
    if (genderFilter) list = list.filter(c => c.gender === genderFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.school.toLowerCase().includes(q)
      );
    }
    return list;
  }, [candidates, activeTab, batchFilter, bgFilter, genderFilter, search]);

  const displayList = useMemo(() => {
    if (activeTab === 'waitlisted') {
      return [...filtered].sort((a, b) => (Utils.overallAvg(b) || 0) - (Utils.overallAvg(a) || 0));
    }
    return filtered;
  }, [filtered, activeTab]);

  function tabCount(tab) {
    if (!tab.statuses) return candidates.length;
    return candidates.filter(c => tab.statuses.includes(c.status)).length;
  }

  function handleAddCandidate() {
    const id = 'c' + Date.now();
    let resolvedPdfUrl = '';
    if (pdfFile) {
      resolvedPdfUrl = URL.createObjectURL(pdfFile);
    }
    const newCandidate = {
      ...form,
      id,
      status: 'app_review',
      isInternal: false,
      applicationDate: new Date().toISOString().slice(0, 10),
      graduationYear: parseInt(form.graduationYear),
      pdfUrl: resolvedPdfUrl,
      stage1Scores: {},
      stage2Scores: null,
      cohort: { depositPaid: false },
      activityLog: [
        { action: 'Application submitted', time: new Date().toISOString() },
        { action: 'Moved to Application Review', time: new Date().toISOString() },
      ],
    };
    setAppState(prev => ({ ...prev, candidates: [...prev.candidates, newCandidate] }));
    setShowAddModal(false);
    setForm(EMPTY_FORM);
    setPdfFile(null);
  }

  function setField(key, val) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  function setDoc(key, val) {
    setForm(prev => ({ ...prev, docs: { ...prev.docs, [key]: val } }));
  }

  const batchName = id => { const b = batches.find(b => b.id === id); return b ? b.name : id; };

  const formValid = form.name.trim() && form.school.trim() && form.batchId;

  // ── shared input style ────────────────────────────────────
  const inp = { className:'form-control', style:{fontSize:13} };

  return (
    <div>
      {/* Tabs + Add button */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
        <div className="tabs" style={{ marginBottom:0, borderBottom:'none', flex:1 }}>
          {TABS.map(t => (
            <div key={t.id} className={"tab " + (activeTab === t.id ? 'active' : '')} onClick={() => setActiveTab(t.id)}>
              {t.label}
              <span className="tab-count">{tabCount(t)}</span>
            </div>
          ))}
        </div>
        <button className="btn btn-primary" style={{ marginLeft:16, whiteSpace:'nowrap' }} onClick={() => setShowAddModal(true)}>
          + Add Candidate
        </button>
      </div>
      <div style={{ borderBottom:'2px solid var(--border)', marginBottom:16 }} />

      {/* Filters */}
      <div className="filters-bar">
        <input {...inp} placeholder="🔍  Search name, email, school…" value={search} onChange={e => setSearch(e.target.value)} style={{...inp.style, minWidth:220}} />
        <select {...inp} value={batchFilter} onChange={e => setBatchFilter(e.target.value)}>
          <option value="">All Rounds</option>
          {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select {...inp} value={bgFilter} onChange={e => setBgFilter(e.target.value)}>
          <option value="">All Backgrounds</option>
          <option>Business</option>
          <option>Engineering</option>
          <option>Science &amp; Other</option>
        </select>
        <select {...inp} value={genderFilter} onChange={e => setGenderFilter(e.target.value)}>
          <option value="">All Genders</option>
          <option value="F">Female</option>
          <option value="M">Male</option>
        </select>
        <span style={{ marginLeft:'auto', fontSize:12, color:'var(--text-light)' }}>
          {displayList.length} candidate{displayList.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="card">
        {displayList.length === 0 ? (
          <EmptyState icon="👤" title="No candidates found" text="Try adjusting your filters or add a candidate." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {activeTab === 'waitlisted' && <th>#</th>}
                  <th>Name / Email</th>
                  <th>Round</th>
                  <th>School</th>
                  <th>Background</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>S1</th>
                  <th>S2</th>
                  <th>Overall</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayList.map((c, idx) => {
                  const s1 = Utils.s1Avg(c);
                  const s2 = Utils.s2Avg(c);
                  const overall = Utils.overallAvg(c);
                  return (
                    <tr key={c.id}>
                      {activeTab === 'waitlisted' && (
                        <td style={{ fontFamily:'var(--font-cond)', fontWeight:700, color:'var(--text-light)' }}>#{idx+1}</td>
                      )}
                      <td>
                        <div style={{ fontWeight:600, cursor:'pointer', color:'var(--navy)' }}
                          onClick={() => {
                            const decisionStatuses = ['accepted','waitlisted','rejected'];
                            const m = decisionStatuses.includes(c.status) ? 'decision' : c.status === 'interview' ? 'interview' : 'app-review';
                            navigate('candidate-detail', { candidateId: c.id, mode: m });
                          }}>
                          {c.name}
                          {c.isInternal && <span style={{ marginLeft:6, fontSize:10, color:'var(--blue)', fontWeight:700 }}>INTERNAL</span>}
                        </div>
                        <div style={{ fontSize:11, color:'var(--text-light)' }}>{c.email}</div>
                      </td>
                      <td style={{ fontFamily:'var(--font-cond)', fontWeight:600 }}>{batchName(c.batchId)}</td>
                      <td style={{ maxWidth:130, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.school}</td>
                      <td>
                        <span style={{ fontSize:11, fontWeight:600, color: c.background === 'Business' ? '#2563eb' : c.background === 'Engineering' ? '#059669' : '#9333ea' }}>
                          {c.background}
                        </span>
                      </td>
                      <td>{Utils.calcAge(c.dob)}</td>
                      <td style={{ fontWeight:600 }}>{c.gender}</td>
                      <td><ScoreChip value={s1} /></td>
                      <td><ScoreChip value={s2} /></td>
                      <td><ScoreChip value={overall} /></td>
                      <td><StatusBadge status={c.status} /></td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => {
                            const decisionStatuses = ['accepted','waitlisted','rejected'];
                            const ivStatuses = ['interview'];
                            const m = decisionStatuses.includes(c.status) ? 'decision' : ivStatuses.includes(c.status) ? 'interview' : 'app-review';
                            navigate('candidate-detail', { candidateId: c.id, mode: m });
                          }}>View</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add Candidate Modal ───────────────────────────── */}
      <Modal
        open={showAddModal}
        onClose={() => { setShowAddModal(false); setForm(EMPTY_FORM); setPdfFile(null); }}
        title="Add Candidate"
        size="lg"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => { setShowAddModal(false); setForm(EMPTY_FORM); setPdfFile(null); }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddCandidate} disabled={!formValid}>Add Candidate</button>
          </>
        }
      >
        {/* Section: Identity */}
        <div style={{ fontFamily:'var(--font-cond)', fontSize:12, fontWeight:700, color:'var(--text-light)', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>
          Identity
        </div>
        <div className="grid-2" style={{ marginBottom:16 }}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input {...inp} value={form.name} onChange={e => setField('name', e.target.value)} placeholder="First Last" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input {...inp} type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="name@email.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input {...inp} value={form.phone} onChange={e => setField('phone', e.target.value)} placeholder="+33 6 …" />
          </div>
          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input {...inp} type="date" value={form.dob} onChange={e => setField('dob', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Nationality</label>
            <input {...inp} value={form.nationality} onChange={e => setField('nationality', e.target.value)} placeholder="French" />
          </div>
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select {...inp} value={form.gender} onChange={e => setField('gender', e.target.value)}>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Section: Academic */}
        <div style={{ fontFamily:'var(--font-cond)', fontSize:12, fontWeight:700, color:'var(--text-light)', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>
          Academic Background
        </div>
        <div className="grid-2" style={{ marginBottom:16 }}>
          <div className="form-group">
            <label className="form-label">School *</label>
            <input {...inp} value={form.school} onChange={e => setField('school', e.target.value)} placeholder="HEC Paris, Bocconi…" />
          </div>
          <div className="form-group">
            <label className="form-label">Degree</label>
            <input {...inp} value={form.degree} onChange={e => setField('degree', e.target.value)} placeholder="MSc Management…" />
          </div>
          <div className="form-group">
            <label className="form-label">Graduation Year</label>
            <input {...inp} type="number" value={form.graduationYear} onChange={e => setField('graduationYear', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Background</label>
            <select {...inp} value={form.background} onChange={e => setField('background', e.target.value)}>
              <option>Business</option>
              <option>Engineering</option>
              <option>Science &amp; Other</option>
            </select>
          </div>
        </div>

        {/* Section: Application */}
        <div style={{ fontFamily:'var(--font-cond)', fontSize:12, fontWeight:700, color:'var(--text-light)', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>
          Application
        </div>
        <div className="grid-2" style={{ marginBottom:16 }}>
          <div className="form-group">
            <label className="form-label">Round *</label>
            <select {...inp} value={form.batchId} onChange={e => setField('batchId', e.target.value)}>
              {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        </div>

        {/* Section: Documents */}
        <div style={{ fontFamily:'var(--font-cond)', fontSize:12, fontWeight:700, color:'var(--text-light)', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>
          Documents received
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:16 }}>
          {Utils.DOC_ITEMS.map(item => (
            <label key={item.key} style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, cursor:'pointer' }}>
              <input type="checkbox" checked={!!form.docs[item.key]} onChange={e => setDoc(item.key, e.target.checked)} />
              {item.label}
            </label>
          ))}
        </div>

        {/* Section: Notes */}
        <div style={{ fontFamily:'var(--font-cond)', fontSize:12, fontWeight:700, color:'var(--text-light)', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>
          Initial Notes
        </div>
        <div className="form-group" style={{ marginBottom:16 }}>
          <textarea {...inp} value={form.notes} onChange={e => setField('notes', e.target.value)} placeholder="First impressions, context, flags…" rows={3} />
        </div>

        {/* Section: PDF */}
        <div style={{ fontFamily:'var(--font-cond)', fontSize:12, fontWeight:700, color:'var(--text-light)', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>
          Application PDF
        </div>
        <div
          style={{ border:'2px dashed var(--border)', borderRadius:8, padding:'20px', textAlign:'center', cursor:'pointer', background:'var(--bg)' }}
          onClick={() => pdfInputRef.current && pdfInputRef.current.click()}
        >
          {pdfFile
            ? <span style={{ fontSize:13, color:'#16a34a', fontWeight:600 }}>✓ {pdfFile.name}</span>
            : <span style={{ fontSize:13, color:'var(--text-light)' }}>Click to upload application PDF (optional)</span>
          }
          <input ref={pdfInputRef} type="file" accept=".pdf" style={{ display:'none' }}
            onChange={e => { if (e.target.files[0]) setPdfFile(e.target.files[0]); }} />
        </div>
      </Modal>

    </div>
  );
};