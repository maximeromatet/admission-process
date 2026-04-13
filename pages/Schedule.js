// ============================================================
//  Schedule Page
// ============================================================

window.SchedulePage = function({ navigate }) {
  const { useState, useMemo } = React;
  const [appState, setAppState] = React.useContext(window.AppStateContext);
  const { candidates, batches, users, alumni, alumniAvail, interviews } = appState;

  const [activeTab, setActiveTab] = useState('agenda');

  // Auto-select the current active round (Reviewing or Interview Phase).
  // Falls back to '' (All Rounds) if nothing is active.
  const defaultBatch = (function() {
    const priority = ['Interview Phase', 'Reviewing', 'Open'];
    for (const status of priority) {
      const b = batches.find(b => !b.archived && Utils.batchStatus(b) === status);
      if (b) return b.id;
    }
    return '';
  })();

  const [batchFilter, setBatchFilter] = useState(defaultBatch);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    candidateId: '', date: '', time: '09:00',
    chairId: '', alumniIds: [], zoomLink: '', notes: ''
  });

  const batch = batches.find(b => b.id === batchFilter);
  // When "All Rounds" is selected, merge every batch's interview window for the modal date picker
  const interviewDays = batch
    ? Utils.interviewWindow(batch)
    : [...new Set(batches.filter(b => !b.archived).flatMap(b => Utils.interviewWindow(b)))].sort();

  const filteredInterviews = useMemo(() =>
    batchFilter ? interviews.filter(i => i.batchId === batchFilter) : interviews,
    [interviews, batchFilter]
  );

  // Group by date — exclude unscheduled
  const byDate = useMemo(() => {
    const map = {};
    filteredInterviews.filter(i => i.date).forEach(i => {
      if (!map[i.date]) map[i.date] = [];
      map[i.date].push(i);
    });
    Object.keys(map).forEach(d => map[d].sort((a, b) => a.time.localeCompare(b.time)));
    return map;
  }, [filteredInterviews]);

  const allDates = [...new Set(filteredInterviews.filter(i => i.date).map(i => i.date))].sort();
  const toSchedule = filteredInterviews.filter(i => !i.date || i.status === 'To Schedule');

  const getCand = id => candidates.find(c => c.id === id);
  const getUser = id => users.find(u => u.id === id);
  const getAlum = id => alumni.find(a => a.id === id);

  // Available alumni for date+period
  function getAvailAlumni(date, time) {
    const hour = parseInt(time.split(':')[0]);
    const period = hour < 12 ? 'AM' : 'PM';
    return alumni.filter(a =>
      alumniAvail.some(av => av.alumniId === a.id && av.date === date && av.period === period)
    );
  }

  function saveInterview() {
    const cand = getCand(form.candidateId);
    // When "All Rounds" is active, derive batchId from the candidate rather than the filter
    const resolvedBatchId = batchFilter || (cand ? cand.batchId : '');
    // Update existing placeholder if one exists, else add new
    const existing = interviews.find(i => i.candidateId === form.candidateId && i.status === 'To Schedule');
    if (existing) {
      setAppState(prev => ({
        ...prev,
        interviews: prev.interviews.map(i => i.id === existing.id
          ? { ...i, ...form, batchId: resolvedBatchId, status: 'Scheduled' }
          : i
        ),
      }));
    } else {
      const id = 'i' + Date.now();
      setAppState(prev => ({ ...prev, interviews: [...prev.interviews, { ...form, id, batchId: resolvedBatchId, status: 'Scheduled' }] }));
    }
    if (cand) {
      setAppState(prev => ({
        ...prev,
        candidates: prev.candidates.map(c =>
          c.id === form.candidateId
            ? { ...c, activityLog: [...(c.activityLog || []), {
                action: 'Interview scheduled for ' + Utils.fmtDate(form.date),
                time: new Date().toISOString()
              }]}
            : c
        ),
      }));
    }
    setShowModal(false);
    setForm({ candidateId:'', date:'', time:'09:00', chairId:'', alumniIds:[], zoomLink:'', notes:'' });
  }

  const invitedCands = candidates.filter(c =>
    (batchFilter ? c.batchId === batchFilter : true) && c.status === 'interview'
  );

  // Date picker in the modal: ONLY shows the Mon–Fri interview week
  // for the selected candidate's own batch (week after that batch's admissibility date).
  // If no candidate is selected, the date list is empty — the user must pick a candidate first.
  const modalCand = getCand(form.candidateId);
  const modalBatch = modalCand ? batches.find(b => b.id === modalCand.batchId) : null;
  const modalInterviewDays = modalBatch ? Utils.interviewWindow(modalBatch) : [];

  const statusColor = s => s === 'Completed' ? '#16a34a' : s === 'No-show' ? '#be123c' : '#2563eb';

  // Alumni availability grid data
  const alumniGridDays = interviewDays.slice(0, 10); // show first 10 working days

  return (
    <div>
      <div className="tabs">
        <div className={"tab " + (activeTab === 'agenda' ? 'active' : '')} onClick={() => setActiveTab('agenda')}>
          Interview Agenda
        </div>
        <div className={"tab " + (activeTab === 'avail' ? 'active' : '')} onClick={() => setActiveTab('avail')}>
          Alumni Availability
        </div>
      </div>

      {activeTab === 'agenda' && (
        <div>
          <div style={{display:'flex', alignItems:'center', gap:12, marginBottom: batch ? 8 : 18}}>
            <select
              className="form-control"
              style={{width:'auto'}}
              value={batchFilter}
              onChange={e => setBatchFilter(e.target.value)}
            >
              <option value="">All Rounds</option>
              {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <span style={{fontSize:12, color:'var(--text-light)'}}>
              {filteredInterviews.length} interview{filteredInterviews.length !== 1 ? 's' : ''} scheduled
            </span>
            <div style={{marginLeft:'auto'}}>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                + Schedule Interview
              </button>
            </div>
          </div>

          {/* Per-round interview window banner */}
          {batch && interviewDays.length > 0 && (
            <div style={{
              background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:6,
              padding:'7px 14px', marginBottom:16, fontSize:12,
              display:'flex', alignItems:'center', gap:8, color:'#1e40af',
            }}>
              <span style={{fontWeight:700}}>📅 {batch.name} interview week:</span>
              <span>{Utils.dayLabel(interviewDays[0])} → {Utils.dayLabel(interviewDays[interviewDays.length - 1])}</span>
              <span style={{color:'#60a5fa', marginLeft:4}}>
                (admissibility: {Utils.fmtDate(batch.admissibilityDate)})
              </span>
            </div>
          )}

          {toSchedule.length === 0 && allDates.length === 0 ? (
            <div className="card">
              <EmptyState icon="📅" title="No interviews scheduled" text="Click + Schedule Interview to add one." />
            </div>
          ) : (
            <>
              {/* Unscheduled — needs a date */}
              {toSchedule.length > 0 && (
                <div className="schedule-day-group">
                  <div className="schedule-day-label" style={{color:'#d97706'}}>⚠ To Schedule ({toSchedule.length})</div>
                  {toSchedule.map(iv => {
                    const cand = getCand(iv.candidateId);
                    return (
                      <div
                        key={iv.id}
                        className="interview-card"
                        style={{cursor:'pointer', borderLeft:'3px solid #d97706'}}
                        onClick={() => cand && navigate('candidate-detail', { candidateId: cand.id, mode: 'interview' })}
                      >
                        <div className="interview-time" style={{color:'#d97706'}}>TBD</div>
                        <div className="interview-info">
                          <div className="interview-candidate">
                            {cand ? cand.name : 'Unknown'}
                            {cand && <span style={{marginLeft:8, fontSize:11, color:'var(--text-light)'}}>· {cand.background}</span>}
                          </div>
                          <div className="interview-panel" style={{color:'#d97706'}}>Needs scheduling — click + Schedule Interview to assign a slot</div>
                        </div>
                        <div>
                          <span style={{fontFamily:'var(--font-cond)', fontSize:12, fontWeight:700, color:'#d97706', background:'#fef3c7', padding:'3px 10px', borderRadius:20}}>
                            To Schedule
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Scheduled interviews by date */}
              {allDates.map(date => (
                <div key={date} className="schedule-day-group">
                  <div className="schedule-day-label">{Utils.dayLabel(date)}</div>
                  {(byDate[date] || []).map(iv => {
                    const cand = getCand(iv.candidateId);
                    const chair = getUser(iv.chairId);
                    const alums = (iv.alumniIds || []).map(id => getAlum(id)).filter(Boolean);
                    return (
                      <div key={iv.id} className="interview-card" style={{cursor:'pointer'}} onClick={() => cand && navigate('candidate-detail', { candidateId: cand.id, mode: 'interview' })}>
                        <div className="interview-time">
                          {iv.time}<br/>
                          <span style={{fontSize:11, color:'var(--text-light)', fontWeight:400}}>25 min</span>
                        </div>
                        <div className="interview-info">
                          <div className="interview-candidate">
                            {cand ? cand.name : 'Unknown candidate'}
                            {cand && <span style={{marginLeft:8, fontSize:11, color:'var(--text-light)'}}>· {cand.background}</span>}
                          </div>
                          <div className="interview-panel">
                            Chair: <strong>{chair ? chair.name : '—'}</strong>
                            {alums.length > 0 && (
                              <span style={{marginLeft:8}}>
                                Alumni: {alums.map(a => a.name).join(', ')}
                              </span>
                            )}
                          </div>
                          {iv.zoomLink && (
                            <div style={{marginTop:4}}>
                              <a href={iv.zoomLink} style={{color:'var(--blue)', fontSize:12}}>
                                🎥 Zoom link
                              </a>
                            </div>
                          )}
                          {iv.notes && (
                            <div style={{marginTop:4, fontSize:12, color:'var(--text-light)', fontStyle:'italic'}}>
                              {iv.notes}
                            </div>
                          )}
                        </div>
                        <div>
                          <span style={{
                            fontFamily:'var(--font-cond)', fontSize:12, fontWeight:700,
                            color: statusColor(iv.status),
                            background: iv.status === 'Completed' ? '#ecfdf5'
                              : iv.status === 'No-show' ? '#fff1f2' : '#eff6ff',
                            padding:'3px 10px', borderRadius:20
                          }}>
                            {iv.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {activeTab === 'avail' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Alumni Availability Grid</span>
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              {batch && interviewDays.length > 0 && (
                <span style={{fontSize:11, color:'var(--blue)', fontWeight:600}}>
                  Interview week: {Utils.dayLabel(interviewDays[0])} → {Utils.dayLabel(interviewDays[interviewDays.length - 1])}
                </span>
              )}
              <select
                className="form-control"
                style={{width:'auto'}}
                value={batchFilter}
                onChange={e => setBatchFilter(e.target.value)}
              >
                <option value="">All Rounds</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>
          <div className="card-body">
            {interviewDays.length === 0 ? (
              <EmptyState icon="📅" title="No interview window for this round" />
            ) : (
              <div className="avail-grid">
                <table className="avail-table">
                  <thead>
                    <tr>
                      <th style={{background:'var(--navy)', color:'var(--white)'}}>Alumni</th>
                      {alumniGridDays.map(d => (
                        <th key={d} colSpan={2} style={{background:'#f8fbfd', textAlign:'center', fontSize:11}}>
                          {Utils.dayLabel(d)}
                        </th>
                      ))}
                    </tr>
                    <tr>
                      <th style={{background:'#fafcfe'}} />
                      {alumniGridDays.map(d => (
                        <React.Fragment key={d}>
                          <th style={{background:'#fafcfe', fontSize:11, color:'var(--blue)'}}>AM</th>
                          <th style={{background:'#fafcfe', fontSize:11, color:'#ea580c'}}>PM</th>
                        </React.Fragment>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {alumni.map(a => (
                      <tr key={a.id}>
                        <td style={{fontWeight:600, whiteSpace:'nowrap', background:'#fafcfe'}}>
                          {a.name}
                        </td>
                        {alumniGridDays.map(d => (
                          <React.Fragment key={d}>
                            {['AM','PM'].map(period => {
                              const avail = alumniAvail.some(av =>
                                av.alumniId === a.id && av.date === d && av.period === period
                              );
                              return (
                                <td key={period}>
                                  <div className={"avail-cell " + (avail ? 'available' : 'busy')}>
                                    {avail ? '✓' : ''}
                                  </div>
                                </td>
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div style={{marginTop:12, display:'flex', gap:16, fontSize:12, color:'var(--text-light)'}}>
              <span><span style={{background:'#d1fae5', padding:'2px 8px', borderRadius:3}}>✓ Available</span></span>
              <span><span style={{background:'#f3f4f6', padding:'2px 8px', borderRadius:3}}>  Unavailable</span></span>
            </div>
          </div>
        </div>
      )}

      {/* Schedule modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Schedule Interview"
        size="lg"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button
              className="btn btn-primary"
              onClick={saveInterview}
              disabled={!form.candidateId || !form.date || !form.chairId}
            >
              Schedule
            </button>
          </>
        }
      >
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Candidate *</label>
            <select
              className="form-control"
              value={form.candidateId}
              onChange={e => setForm(prev => ({ ...prev, candidateId: e.target.value, date: '', alumniIds: [] }))}
            >
              <option value="">Select candidate…</option>
              {invitedCands.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.background})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Chair (Committee Member) *</label>
            <select
              className="form-control"
              value={form.chairId}
              onChange={e => setForm(prev => ({ ...prev, chairId: e.target.value }))}
            >
              <option value="">Select chair…</option>
              {users.filter(u => u.role !== 'Alumni').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date *</label>

            {/* Interview week info — only shown once a candidate is selected */}
            {modalBatch && modalInterviewDays.length > 0 && (
              <div style={{
                background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:6,
                padding:'6px 12px', marginBottom:6, fontSize:12, color:'#1e40af',
                display:'flex', gap:6, alignItems:'center',
              }}>
                <span>📅</span>
                <span>
                  <strong>{modalBatch.name}</strong> interview week:{' '}
                  <strong>{Utils.dayLabel(modalInterviewDays[0])}</strong> → <strong>{Utils.dayLabel(modalInterviewDays[modalInterviewDays.length - 1])}</strong>
                  <span style={{color:'#93c5fd', marginLeft:8, fontWeight:400}}>
                    (admissibility: {Utils.fmtDate(modalBatch.admissibilityDate)})
                  </span>
                </span>
              </div>
            )}

            <select
              className="form-control"
              value={form.date}
              onChange={e => setForm(prev => ({ ...prev, date: e.target.value, alumniIds: [] }))}
              disabled={!form.candidateId}
            >
              {!form.candidateId
                ? <option value="">← Select a candidate first</option>
                : <>
                    <option value="">Select date…</option>
                    {modalInterviewDays.map(d => <option key={d} value={d}>{Utils.dayLabel(d)}</option>)}
                  </>
              }
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Time (25-min slot)</label>
            <select
              className="form-control"
              value={form.time}
              onChange={e => setForm(prev => ({ ...prev, time: e.target.value }))}
            >
              {Utils.getTimeSlots().map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {form.date && (
          <div className="form-group">
            <label className="form-label">
              Alumni Panel (select 2)
              {form.date && <span style={{color:'var(--blue)', marginLeft:6, fontWeight:400, textTransform:'none', letterSpacing:0}}>
                — showing available for {Utils.dayLabel(form.date)} {parseInt(form.time) < 12 ? 'AM' : 'PM'}
              </span>}
            </label>
            <div style={{display:'flex', flexDirection:'column', gap:6}}>
              {getAvailAlumni(form.date, form.time).map(a => (
                <label key={a.id} style={{display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13}}>
                  <input
                    type="checkbox"
                    checked={form.alumniIds.includes(a.id)}
                    onChange={e => {
                      const ids = e.target.checked
                        ? [...form.alumniIds, a.id].slice(-2)
                        : form.alumniIds.filter(id => id !== a.id);
                      setForm(prev => ({ ...prev, alumniIds: ids }));
                    }}
                  />
                  {a.name}
                </label>
              ))}
              {getAvailAlumni(form.date, form.time).length === 0 && (
                <div style={{fontSize:12, color:'var(--text-light)'}}>No alumni available for this slot.</div>
              )}
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Zoom Link</label>
          <input
            className="form-control"
            value={form.zoomLink}
            onChange={e => setForm(prev => ({ ...prev, zoomLink: e.target.value }))}
            placeholder="https://zoom.us/j/…"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea
            className="form-control"
            value={form.notes}
            onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
            rows={2}
          />
        </div>
      </Modal>
    </div>
  );
};