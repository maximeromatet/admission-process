// ============================================================
//  Dashboard Page
// ============================================================

window.DashboardPage = function({ navigate }) {
  const [appState] = React.useContext(window.AppStateContext);
  const { candidates, batches, settings, interviews } = appState;

  const total      = candidates.length;
  const accepted   = candidates.filter(c => c.status === 'accepted').length;
  const waitlisted = candidates.filter(c => c.status === 'waitlisted').length;
  const appReview  = candidates.filter(c => ['pending','app_review'].includes(c.status)).length;
  const interview  = candidates.filter(c => c.status === 'interview').length;

  // Today's interviews
  const TODAY = '2026-03-31';
  const todayInterviews = (interviews || []).filter(i => i.date === TODAY);

  // Pipeline
  const pipeline = Utils.STATUS_ORDER.map(st => ({
    status: st,
    label: Utils.STATUS_LABELS[st],
    count: candidates.filter(c => c.status === st).length,
    color: Utils.PIPELINE_COLORS[st],
  })).filter(p => p.count > 0);
  const pipelineMax = Math.max(...pipeline.map(p => p.count), 1);

  // Quota
  const q = Utils.computeQuotas(candidates, settings);
  const T = settings.totalTarget;

  const cardStyle = {
    cursor: 'pointer',
    transition: 'box-shadow 0.15s, transform 0.15s',
  };

  function StatCard({ label, value, sub, color, accentClass, tabFilter }) {
    return (
      <div
        className={'stat-card ' + accentClass}
        style={cardStyle}
        onClick={() => navigate('candidates', { tabFilter })}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,58,112,0.13)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
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
      {/* Stat cards */}
      <div className="stat-grid">
        <StatCard label="Total Applications" value={total}      sub="Across all rounds"      accentClass="accent-navy"  tabFilter="all"        />
        <StatCard label="Application Review"          value={appReview} sub="Awaiting evaluation"    accentClass="accent-blue"  tabFilter="app_review" color="var(--blue)" />
        <StatCard label="Interview"           value={interview} sub="Ready to interview"     accentClass="accent-blue"  tabFilter="interview"  color="#8b5cf6" />
        <StatCard label="Accepted"            value={accepted}  sub={'of ' + T + ' target'}  accentClass="accent-green" tabFilter="accepted"   color="#16a34a" />
        <StatCard label="Waitlisted"          value={waitlisted} sub="Pending final call"    accentClass="accent-amber" tabFilter="waitlisted" color="#d97706" />
      </div>

      {/* Today's interviews */}
      {todayInterviews.length > 0 && (
        <div className="card" style={{marginBottom:20, borderLeft:'3px solid #8b5cf6'}}>
          <div className="card-header">
            <span className="card-title">📅 Today's Interviews</span>
            <span style={{fontSize:12, color:'var(--text-light)'}}>{todayInterviews.length} scheduled</span>
          </div>
          <div className="card-body" style={{paddingTop:8}}>
            {todayInterviews.map(iv => {
              const cand = candidates.find(c => c.id === iv.candidateId);
              return (
                <div
                  key={iv.id}
                  onClick={() => cand && navigate('candidate-detail', { candidateId: cand.id })}
                  style={{
                    display:'flex', alignItems:'center', gap:12, padding:'10px 0',
                    borderBottom:'1px solid var(--border)', cursor:'pointer',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fbfd'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <div style={{fontFamily:'var(--font-cond)', fontWeight:700, fontSize:15, color:'var(--navy)', minWidth:48}}>
                    {iv.time}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600, color:'var(--navy)'}}>{cand ? cand.name : '—'}</div>
                    <div style={{fontSize:12, color:'var(--text-light)'}}>
                      {cand ? cand.school + ' · ' + cand.background : ''}
                    </div>
                  </div>
                  <div style={{fontSize:12, color:'#8b5cf6', fontWeight:600}}>Open →</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid-2" style={{alignItems:'start'}}>
        {/* Pipeline */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Application Pipeline</span>
          </div>
          <div className="card-body">
            {pipeline.length === 0
              ? <EmptyState icon="📊" title="No data yet" />
              : pipeline.map(p => (
                <div
                  key={p.status}
                  className="pipeline-row"
                  style={{cursor:'pointer'}}
                  onClick={() => navigate('candidates', { tabFilter: p.status })}
                >
                  <div className="pipeline-label">{p.label}</div>
                  <div className="pipeline-bar-wrap">
                    <div
                      className="pipeline-bar-fill"
                      style={{ width: Math.round((p.count / pipelineMax) * 100) + '%', background: p.color }}
                    >
                      {p.count >= 2 ? p.count : ''}
                    </div>
                  </div>
                  <div className="pipeline-count">{p.count}</div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Cohort Composition */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Cohort Composition</span>
            <span style={{fontSize:12, color:'var(--text-light)'}}>
              Target: {T} seats · Avg age: {q.avgAge}
            </span>
          </div>
          <div className="card-body">
            <QuotaRow label="Total Accepted"   current={q.total}       target={T} />
            <QuotaRow label="Business"         current={q.business}    target={T} pct={settings.businessPct} />
            <QuotaRow label="Engineering"      current={q.engineering} target={T} pct={settings.engineeringPct} />
            <QuotaRow label="Science & Other"  current={q.diverse}     target={T} pct={settings.diversePct} />
            <QuotaRow label="Internal (X/HEC)" current={q.internal}    target={settings.internalTarget} />
            <QuotaRow label="Women"            current={q.women}       target={accepted || 1} pct={settings.womenPct} />
          </div>
        </div>
      </div>

      {/* Batch cards */}
      <div style={{marginTop:20}}>
        <div style={{fontFamily:'var(--font-cond)', fontSize:18, fontWeight:700, color:'var(--navy)', marginBottom:14, letterSpacing:0.3}}>
          Rounds Overview
        </div>
        <div className="batch-grid">
          {batches.filter(b => !b.archived).map(batch => {
            const bCands   = candidates.filter(c => c.batchId === batch.id);
            const bAccepted = bCands.filter(c => c.status === 'accepted').length;
            const bPending  = bCands.filter(c => !['accepted','waitlisted','rejected'].includes(c.status)).length;
            const status   = Utils.batchStatus(batch);
            const next     = Utils.batchNextDate(batch);
            return (
              <div
                key={batch.id}
                className="batch-card"
                style={cardStyle}
                onClick={() => navigate('candidates', { batchFilter: batch.id })}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,58,112,0.13)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
              >
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4}}>
                  <div className="batch-card-name">{batch.name}</div>
                  <BatchStatusChip status={status} />
                </div>
                {batch.isInternal && (
                  <div style={{fontSize:11, color:'var(--blue)', fontWeight:600, marginBottom:4}}>🎓 Internal Track</div>
                )}
                {next && (
                  <div className="batch-card-date">{next.label}: {Utils.fmtDate(next.date)}</div>
                )}
                <div className="batch-mini-stats">
                  <div className="batch-mini-stat">
                    <div className="batch-mini-stat-value">{bCands.length}</div>
                    <div className="batch-mini-stat-label">Applied</div>
                  </div>
                  <div className="batch-mini-stat">
                    <div className="batch-mini-stat-value" style={{color:'#16a34a'}}>{bAccepted}</div>
                    <div className="batch-mini-stat-label">Accepted</div>
                  </div>
                  <div className="batch-mini-stat">
                    <div className="batch-mini-stat-value" style={{color:'var(--blue)'}}>{bPending}</div>
                    <div className="batch-mini-stat-label">In Progress</div>
                  </div>
                  <div className="batch-mini-stat">
                    <div className="batch-mini-stat-value" style={{color:'var(--navy)'}}>{batch.targetSeats}</div>
                    <div className="batch-mini-stat-label">Target</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};