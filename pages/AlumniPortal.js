// ============================================================
//  Alumni Portal — Standalone availability page
// ============================================================

window.AlumniPortalPage = function({ onLogout }) {
  const { useState } = React;
  const [appState, setAppState] = React.useContext(window.AppStateContext);
  const { batches } = appState;
  const [batchId, setBatchId] = useState('r3');
  const [saved, setSaved] = useState(false);
  const [localAvail, setLocalAvail] = useState([]);

  const batch = batches.find(b => b.id === batchId);
  const days = batch ? Utils.interviewWindow(batch) : [];

  function toggle(date, period) {
    const key = date + '_' + period;
    setLocalAvail(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  }

  function saveAvail() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const availCount = localAvail.length;

  return (
    <div style={{
      minHeight:'100vh', background:'var(--navy)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:24, fontFamily:'var(--font-body)', position:'relative',
    }}>
      <div style={{
        position:'absolute', inset:0, opacity:0.04,
        backgroundImage:'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)',
        backgroundSize:'24px 24px',
      }} />

      <div style={{
        background:'var(--white)', borderRadius:14,
        boxShadow:'0 24px 64px rgba(0,0,0,0.35)',
        width:'100%', maxWidth:820,
        overflow:'hidden', position:'relative', zIndex:1,
      }}>
        {/* Header */}
        <div style={{background:'var(--navy)', padding:'22px 28px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div>
            <div style={{fontFamily:'var(--font-cond)', fontSize:22, fontWeight:800, color:'var(--white)'}}>
              Alumni Interview Portal
            </div>
            <div style={{fontFamily:'var(--font-cond)', fontSize:13, color:'rgba(255,255,255,0.55)', marginTop:2}}>
              MSc X-HEC Entrepreneurs — Admissions 2025–26
            </div>
          </div>
          <button
            className="btn btn-ghost"
            style={{color:'rgba(255,255,255,0.7)', borderColor:'rgba(255,255,255,0.2)'}}
            onClick={onLogout}
          >
            Sign out
          </button>
        </div>

        <div style={{padding:'22px 28px'}}>
          {/* Round selector */}
          <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:20}}>
            <label className="form-label" style={{margin:0}}>Select Round</label>
            <select
              className="form-control"
              style={{width:'auto'}}
              value={batchId}
              onChange={e => setBatchId(e.target.value)}
            >
              {batches.filter(b => !b.archived).map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            {batch && days.length > 0 && (
              <span style={{fontSize:12, color:'var(--text-light)'}}>
                Interview window: {Utils.fmtDate(days[0])} – {Utils.fmtDate(days[days.length - 1])}
              </span>
            )}
          </div>

          <p style={{fontSize:13, color:'var(--text-light)', marginBottom:16}}>
            Please mark your availability below. Each interview is <strong>25 minutes</strong> via Zoom.
            Morning = 09:00–13:00 · Afternoon = 14:00–18:00.
          </p>

          {days.length === 0 ? (
            <EmptyState icon="📅" title="No interview window found for this round" />
          ) : (
            <div style={{overflowX:'auto'}}>
              <table style={{borderCollapse:'separate', borderSpacing:4, width:'100%'}}>
                <thead>
                  <tr>
                    <th style={{
                      fontFamily:'var(--font-cond)', fontSize:12, fontWeight:700,
                      color:'var(--text-light)', padding:'8px 12px', textAlign:'left',
                      letterSpacing:0.8, textTransform:'uppercase'
                    }}>Period</th>
                    {days.map(d => (
                      <th key={d} style={{
                        fontFamily:'var(--font-cond)', fontSize:12, fontWeight:600,
                        color:'var(--navy)', padding:'8px 6px', textAlign:'center', whiteSpace:'nowrap'
                      }}>
                        {Utils.dayLabel(d)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {['AM','PM'].map(period => (
                    <tr key={period}>
                      <td style={{
                        fontFamily:'var(--font-cond)', fontWeight:700, fontSize:14,
                        color: period === 'AM' ? 'var(--blue)' : '#ea580c', padding:'6px 12px'
                      }}>
                        {period === 'AM' ? '☀ Morning' : '🌤 Afternoon'}
                      </td>
                      {days.map(date => {
                        const key = date + '_' + period;
                        const isAvail = localAvail.includes(key);
                        return (
                          <td key={date} style={{padding:3, textAlign:'center'}}>
                            <div
                              onClick={() => toggle(date, period)}
                              style={{
                                width:52, height:40, borderRadius:6, cursor:'pointer',
                                display:'flex', alignItems:'center', justifyContent:'center',
                                fontFamily:'var(--font-cond)', fontWeight:700, fontSize:14,
                                background: isAvail ? '#d1fae5' : '#f3f4f6',
                                color: isAvail ? '#065f46' : '#9ca3af',
                                border: isAvail ? '2px solid #6ee7b7' : '2px solid transparent',
                                transition:'all 0.15s', userSelect:'none',
                              }}
                            >
                              {isAvail ? '✓' : ''}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{display:'flex', alignItems:'center', gap:16, marginTop:20}}>
            <button className="btn btn-primary" onClick={saveAvail} disabled={days.length === 0}>
              {saved ? '✓ Saved!' : 'Save Availability'}
            </button>
            <span style={{fontSize:12, color:'var(--text-light)'}}>
              {availCount} slot{availCount !== 1 ? 's' : ''} selected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};