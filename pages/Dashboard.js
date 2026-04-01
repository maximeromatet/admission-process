// ============================================================
//  Dashboard Page
// ============================================================

window.DashboardPage = function({ navigate }) {
  const [appState] = React.useContext(window.AppStateContext);
  const { candidates, batches, settings } = appState;

  // ── Stats ─────────────────────────────────────────────────
  const total      = candidates.length;
  const accepted   = candidates.filter(c => c.status === 'accepted').length;
  const waitlisted = candidates.filter(c => c.status === 'waitlisted').length;
  const appReview  = candidates.filter(c => ['pending','app_review'].includes(c.status)).length;
  const interview  = candidates.filter(c => c.status === 'interview').length;
  const rejected   = candidates.filter(c => c.status === 'rejected').length;

  // ── Quota ─────────────────────────────────────────────────
  const q = Utils.computeQuotas(candidates, settings);
  const T = settings.totalTarget;

  // ── Gender breakdown (accepted only) ─────────────────────
  const acceptedCands = candidates.filter(c => c.status === 'accepted');
  const womenCount = acceptedCands.filter(c => c.gender === 'F').length;
  const menCount   = acceptedCands.filter(c => c.gender === 'M').length;
  const womenPct   = acceptedCands.length ? Math.round((womenCount / acceptedCands.length) * 100) : 0;
  const menPct     = 100 - womenPct;

  const cardStyle = { cursor:'pointer', transition:'box-shadow 0.15s, transform 0.15s' };
  function hover(e, on) {
    e.currentTarget.style.boxShadow = on ? '0 4px 16px rgba(0,58,112,0.13)' : '';
    e.currentTarget.style.transform = on ? 'translateY(-2px)' : '';
  }

  function StatCard({ label, value, sub, color, accentClass, tabFilter }) {
    return (
      <div
        className={'stat-card ' + accentClass}
        style={cardStyle}
        onClick={() => navigate('candidates', { tabFilter })}
        onMouseEnter={e => hover(e, true)}
        onMouseLeave={e => hover(e, false)}
      >
        <div className="stat-label">{label}</div>
        <div className="stat-value" style={color ? {color} : {}}>{value}</div>
        <div className="stat-sub">{sub}</div>
        <div style={{marginTop:8, fontSize:11, color:'var(--blue)', fontWeight:600}}>View →</div>
      </div>
    );
  }

  return (
    <div>

      {/* ── Stats — row 1: primary metrics ──────────────────── */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16, marginBottom:12}}>
        <StatCard label="Total Applications" value={total}     sub="Across all rounds"    accentClass="accent-navy"  tabFilter="all"       />
        <StatCard label="Accepted"           value={accepted}  sub={'of ' + T + ' target'} accentClass="accent-green" tabFilter="accepted" color="#16a34a" />
        <StatCard label="Rejected"           value={rejected}  sub="Not admitted"          accentClass="accent-navy"  tabFilter="rejected" color="#be123c" />
      </div>

      {/* ── Stats — row 2: secondary metrics centered ────────── */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16, marginBottom:28, maxWidth:'75%', margin:'0 auto 28px auto'}}>
        <StatCard label="Waitlisted"  value={waitlisted} sub="Pending final call"  accentClass="accent-amber" tabFilter="waitlisted" color="#d97706" />
        <StatCard label="App Review"  value={appReview}  sub="Awaiting evaluation" accentClass="accent-blue"  tabFilter="app_review" color="var(--blue)" />
        <StatCard label="Interview"   value={interview}  sub="In progress"         accentClass="accent-blue"  tabFilter="interview"  color="#8b5cf6" />
      </div>

      {/* ── Rounds Overview ─────────────────────────────────── */}
      <div style={{marginBottom:28}}>
        <div style={{fontFamily:'var(--font-cond)', fontSize:18, fontWeight:700, color:'var(--navy)', marginBottom:14, letterSpacing:0.3}}>
          Rounds Overview
        </div>
        <div className="batch-grid">
          {batches.filter(b => !b.archived).map(batch => {
            const bCands    = candidates.filter(c => c.batchId === batch.id);
            const bAccepted = bCands.filter(c => c.status === 'accepted').length;
            const status    = Utils.batchStatus(batch);
            const next      = Utils.batchNextDate(batch);
            return (
              <div
                key={batch.id}
                className="batch-card"
                style={{...cardStyle, textAlign:'center'}}
                onClick={() => navigate('candidates', { batchFilter: batch.id })}
                onMouseEnter={e => hover(e, true)}
                onMouseLeave={e => hover(e, false)}
              >
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6}}>
                  <div className="batch-card-name">{batch.name}</div>
                  <BatchStatusChip status={status} />
                </div>
                {batch.isInternal && (
                  <div style={{fontSize:11, color:'var(--blue)', fontWeight:600, marginBottom:6}}>
                    🎓 HEC & Polytechnique
                  </div>
                )}
                {next && (
                  <div className="batch-card-date" style={{marginBottom:10}}>{next.label}: {Utils.fmtDate(next.date)}</div>
                )}
                <div style={{display:'flex', justifyContent:'center', gap:32}}>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontFamily:'var(--font-cond)', fontSize:26, fontWeight:800, color:'var(--navy)'}}>{bCands.length}</div>
                    <div style={{fontSize:11, color:'var(--text-light)', textTransform:'uppercase', letterSpacing:0.5, marginTop:2}}>Applicants</div>
                  </div>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontFamily:'var(--font-cond)', fontSize:26, fontWeight:800, color:'#16a34a'}}>{bAccepted}</div>
                    <div style={{fontSize:11, color:'var(--text-light)', textTransform:'uppercase', letterSpacing:0.5, marginTop:2}}>Accepted</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Cohort Composition — full width ─────────────────── */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Cohort Composition</span>
          <span style={{fontSize:12, color:'var(--text-light)'}}>Target: {T} seats · Avg age: {q.avgAge}</span>
        </div>
        <div className="card-body">
          {/* Quota rows + gender bar side by side */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:40, alignItems:'start'}}>

            {/* Left — background quota rows */}
            <div>
              <QuotaRow label="Total Accepted"   current={q.total}       target={T} />
              <QuotaRow label="Business"         current={q.business}    target={T} pct={settings.businessPct} />
              <QuotaRow label="Engineering"      current={q.engineering} target={T} pct={settings.engineeringPct} />
              <QuotaRow label="Science & Other"  current={q.diverse}     target={T} pct={settings.diversePct} />
              <QuotaRow label="Internal (X/HEC)" current={q.internal}    target={settings.internalTarget} />
            </div>

            {/* Right — gender split bar */}
            <div>
              <div style={{fontSize:12, fontWeight:700, color:'var(--text-light)', textTransform:'uppercase', letterSpacing:1, marginBottom:16}}>
                Gender — Accepted cohort
              </div>
              {acceptedCands.length === 0 ? (
                <div style={{fontSize:13, color:'var(--text-light)'}}>No accepted candidates yet.</div>
              ) : (
                <>
                  {/* Segmented bar */}
                  <div style={{display:'flex', height:36, borderRadius:8, overflow:'hidden', marginBottom:14, boxShadow:'0 1px 4px rgba(0,0,0,0.08)'}}>
                    {womenPct > 0 && (
                      <div style={{
                        width: womenPct + '%',
                        background: 'linear-gradient(90deg, #ec4899, #db2777)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:13, fontWeight:700, color:'#fff', gap:4,
                        transition:'width 0.4s',
                      }}>
                        {womenPct >= 12 && <span>♀ {womenPct}%</span>}
                      </div>
                    )}
                    {menPct > 0 && (
                      <div style={{
                        width: menPct + '%',
                        background: 'linear-gradient(90deg, #2563eb, #1d4ed8)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:13, fontWeight:700, color:'#fff', gap:4,
                        transition:'width 0.4s',
                      }}>
                        {menPct >= 12 && <span>♂ {menPct}%</span>}
                      </div>
                    )}
                  </div>

                  {/* Legend */}
                  <div style={{display:'flex', gap:24, marginBottom:12}}>
                    <div style={{display:'flex', alignItems:'center', gap:8}}>
                      <div style={{width:14, height:14, borderRadius:4, background:'linear-gradient(90deg,#ec4899,#db2777)'}} />
                      <div>
                        <div style={{fontSize:13, fontWeight:600, color:'var(--text)'}}>Women</div>
                        <div style={{fontSize:11, color:'var(--text-light)'}}>{womenCount} · {womenPct}%</div>
                      </div>
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:8}}>
                      <div style={{width:14, height:14, borderRadius:4, background:'linear-gradient(90deg,#2563eb,#1d4ed8)'}} />
                      <div>
                        <div style={{fontSize:13, fontWeight:600, color:'var(--text)'}}>Men</div>
                        <div style={{fontSize:11, color:'var(--text-light)'}}>{menCount} · {menPct}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Target indicator */}
                  <div style={{fontSize:12, color:'var(--text-light)', padding:'6px 10px', background:'var(--bg)', borderRadius:6, display:'inline-flex', alignItems:'center', gap:8}}>
                    <span>Target: {settings.womenPct}% women</span>
                    {womenPct >= settings.womenPct
                      ? <span style={{color:'#16a34a', fontWeight:700}}>✓ On track</span>
                      : <span style={{color:'#d97706', fontWeight:700}}>↑ {settings.womenPct - womenPct}pp below target</span>
                    }
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};