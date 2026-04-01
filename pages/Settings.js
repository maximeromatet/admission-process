// ============================================================
//  Settings Page
// ============================================================

window.SettingsPage = function() {
  const { useState } = React;
  const [appState, setAppState] = React.useContext(window.AppStateContext);
  const { settings } = appState;
  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);
  const [showReset, setShowReset] = useState(false);

  function save() {
    setAppState(prev => ({ ...prev, settings: { ...form } }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function resetDemo() {
    setAppState({
      candidates: window.CANDIDATES_SEED,
      batches: window.BATCHES_SEED,
      users: window.COMMITTEE_USERS_SEED,
      alumni: window.ALUMNI_SEED,
      alumniAvail: window.ALUMNI_AVAIL_SEED,
      interviews: window.INTERVIEWS_SEED,
      settings: window.SETTINGS_SEED,
    });
    setForm({ ...window.SETTINGS_SEED });
    setShowReset(false);
  }

  const F = (key, label, unit, min, max) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <input
          type="number"
          className="form-control"
          style={{maxWidth:100}}
          min={min} max={max}
          value={form[key] || 0}
          onChange={e => setForm(p => ({ ...p, [key]: +e.target.value }))}
        />
        {unit && <span style={{fontSize:13, color:'var(--text-light)'}}>{unit}</span>}
      </div>
    </div>
  );

  return (
    <div>
      <div className="grid-2" style={{alignItems:'start'}}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Quota Configuration</span>
          </div>
          <div className="card-body">
            {F('totalTarget', 'Total Seats Target', 'seats', 1, 500)}
            {F('businessPct', 'Business Background Target', '%', 0, 100)}
            {F('engineeringPct', 'Engineering Background Target', '%', 0, 100)}
            {F('diversePct', 'Science & Other Target', '%', 0, 100)}
            {F('internalTarget', 'Internal (X/HEC) Target', 'seats', 0, 200)}
            {F('womenPct', 'Women Target', '% minimum', 0, 100)}

            <div style={{marginTop:16, display:'flex', gap:10, alignItems:'center'}}>
              <button className="btn btn-primary" onClick={save}>
                {saved ? '✓ Saved!' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Data Management</span>
          </div>
          <div className="card-body">
            <p style={{fontSize:13, color:'var(--text)', marginBottom:14}}>
              Reset the application back to the demo dataset. All current changes — including new scores, status updates, and interview scheduling — will be lost.
            </p>
            <div style={{
              background:'#fff1f2', border:'1px solid #fecdd3', borderRadius:6,
              padding:'10px 14px', marginBottom:16, fontSize:12, color:'#be123c'
            }}>
              ⚠ This action cannot be undone.
            </div>
            <button className="btn btn-danger" onClick={() => setShowReset(true)}>
              Reset to Demo Data
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showReset}
        onClose={() => setShowReset(false)}
        onConfirm={resetDemo}
        title="Reset to Demo Data"
        message="This will permanently discard all changes and restore the original demo dataset. Are you sure?"
        danger
      />
    </div>
  );
};
