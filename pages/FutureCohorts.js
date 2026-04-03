// ============================================================
//  Future Cohorts Page
//  Acceptance = deposit paid before deadline (single indicator)
// ============================================================

window.FutureCohortsPage = function({ navigate }) {
  const { useMemo } = React;
  const [appState, setAppState] = React.useContext(window.AppStateContext);
  const { candidates } = appState;

  const accepted = candidates.filter(c => c.status === 'accepted');

  const CATEGORIES = ['Business', 'Engineering', 'Diverse'];
  const CATEGORY_COLORS = {
    'Business':        { bg:'#eff6ff', border:'#2563eb', text:'#1e40af' },
    'Engineering':     { bg:'#f0fdf4', border:'#16a34a', text:'#166534' },
    'Diverse': { bg:'#faf5ff', border:'#9333ea', text:'#6b21a8' },
  };

  function getCat(c) {
    if (c.background === 'Engineering')     return 'Engineering';
    if (c.background === 'Diverse') return 'Diverse';
    return 'Business';
  }

  function toggleDeposit(candidateId) {
    setAppState(prev => ({
      ...prev,
      candidates: prev.candidates.map(c => {
        if (c.id !== candidateId) return c;
        const current = c.cohort && c.cohort.depositPaid;
        return { ...c, cohort: { ...(c.cohort || {}), depositPaid: !current } };
      }),
    }));
  }

  const grouped = useMemo(() => {
    const map = {};
    CATEGORIES.forEach(cat => { map[cat] = []; });
    accepted.forEach(c => { map[getCat(c)].push(c); });
    return map;
  }, [accepted]);

  const totalDeposit = accepted.filter(c => c.cohort && c.cohort.depositPaid).length;

  return (
    <div>
      {/* Summary */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:28}}>
        <div className="stat-card accent-green">
          <div className="stat-label">Total Accepted</div>
          <div className="stat-value" style={{color:'#16a34a'}}>{accepted.length}</div>
          <div className="stat-sub">Offer extended</div>
        </div>
        <div className="stat-card accent-blue">
          <div className="stat-label">Deposit Paid</div>
          <div className="stat-value" style={{color:'var(--blue)'}}>{totalDeposit}</div>
          <div className="stat-sub">Confirmed enrollment</div>
        </div>
        <div className="stat-card accent-amber">
          <div className="stat-label">Pending</div>
          <div className="stat-value" style={{color:'#d97706'}}>{accepted.length - totalDeposit}</div>
          <div className="stat-sub">Awaiting deposit</div>
        </div>
      </div>

      {/* Note on acceptance logic */}
      <div style={{
        background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:8,
        padding:'10px 16px', fontSize:13, color:'#1e40af', marginBottom:24,
        display:'flex', alignItems:'center', gap:8,
      }}>
        <span style={{fontSize:16}}>ℹ</span>
        <span>A candidate is considered to have accepted the offer <strong>once their deposit has been paid</strong>. Toggle the deposit status below to track confirmations.</span>
      </div>

      {/* Category sections */}
      {CATEGORIES.map(cat => {
        const cands = grouped[cat] || [];
        const col = CATEGORY_COLORS[cat];
        const catDeposit = cands.filter(c => c.cohort && c.cohort.depositPaid).length;

        return (
          <div key={cat} className="card" style={{marginBottom:20, borderLeft:'3px solid ' + col.border}}>
            <div className="card-header">
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <span className="card-title">{cat}</span>
                <span style={{
                  fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:10,
                  background: col.bg, color: col.text, border:'1px solid '+col.border,
                }}>
                  {cands.length} candidate{cands.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div style={{fontSize:12, color:'var(--text-light)'}}>
                Deposit paid: <strong>{catDeposit}/{cands.length}</strong>
              </div>
            </div>

            {cands.length === 0 ? (
              <div className="card-body">
                <div style={{fontSize:13, color:'var(--text-light)', fontStyle:'italic'}}>No accepted candidates in this category yet.</div>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>School</th>
                      <th>Round</th>
                      <th style={{textAlign:'center'}}>Overall Score</th>
                      <th style={{textAlign:'center'}}>Deposit Paid</th>
                      <th style={{textAlign:'center'}}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cands.map(c => {
                      const overall = Utils.overallAvg(c);
                      const depositPaid = c.cohort && c.cohort.depositPaid;
                      const batch = appState.batches.find(b => b.id === c.batchId);
                      return (
                        <tr key={c.id}>
                          <td>
                            <div
                              style={{fontWeight:600, color:'var(--navy)', cursor:'pointer'}}
                              onClick={() => navigate('candidate-detail', { candidateId: c.id, mode: 'decision' })}
                            >
                              {c.name}
                            </div>
                            <div style={{fontSize:11, color:'var(--text-light)'}}>{c.email}</div>
                          </td>
                          <td style={{fontSize:13}}>{c.school}</td>
                          <td style={{fontFamily:'var(--font-cond)', fontWeight:600, fontSize:13}}>
                            {batch ? batch.name : c.batchId}
                          </td>
                          <td style={{textAlign:'center'}}>
                            <ScoreChip value={overall} />
                          </td>
                          <td style={{textAlign:'center'}}>
                            <button
                              onClick={() => toggleDeposit(c.id)}
                              style={{
                                display:'inline-flex', alignItems:'center', gap:5,
                                padding:'5px 14px', borderRadius:20, fontSize:12, fontWeight:600,
                                cursor:'pointer', border:'none', transition:'all 0.15s',
                                background: depositPaid ? '#d1fae5' : '#fee2e2',
                                color:      depositPaid ? '#065f46' : '#991b1b',
                              }}
                            >
                              {depositPaid ? '✓ Paid' : '✗ Not paid'}
                            </button>
                          </td>
                          <td style={{textAlign:'center'}}>
                            <span style={{
                              fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:20,
                              background: depositPaid ? '#d1fae5' : '#fef3c7',
                              color:      depositPaid ? '#065f46' : '#92400e',
                              fontFamily:'var(--font-cond)',
                            }}>
                              {depositPaid ? 'Confirmed' : 'Awaiting deposit'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};