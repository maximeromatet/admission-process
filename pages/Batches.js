// ============================================================
//  Batches Page
// ============================================================

window.BatchesPage = function({ navigate }) {
  const { useState } = React;
  const [appState, setAppState] = React.useContext(window.AppStateContext);
  const { batches, candidates } = appState;
  const [editBatch, setEditBatch] = useState(null);
  const [form, setForm] = useState({});

  function openEdit(batch) {
    setEditBatch(batch);
    setForm({ ...batch });
  }

  function saveEdit() {
    setAppState(prev => ({
      ...prev,
      batches: prev.batches.map(b => b.id === editBatch.id ? { ...b, ...form } : b),
    }));
    setEditBatch(null);
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">All Rounds</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Deadline</th>
                <th>Admissibility</th>
                <th>Decisions</th>
                <th>Target</th>
                <th>Applied</th>
                <th>Accepted</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.map(b => {
                const bCands = candidates.filter(c => c.batchId === b.id);
                const bAcc = bCands.filter(c => c.status === 'accepted').length;
                const status = Utils.batchStatus(b);
                return (
                  <tr key={b.id} style={{opacity: b.archived ? 0.5 : 1}}>
                    <td>
                      <div style={{fontFamily:'var(--font-cond)', fontWeight:700, color:'var(--navy)'}}>
                        {b.name}
                      </div>
                      {b.note && <div style={{fontSize:11, color:'var(--text-light)'}}>{b.note}</div>}
                    </td>
                    <td>{Utils.fmtDate(b.deadline)}</td>
                    <td>{Utils.fmtDate(b.admissibilityDate)}</td>
                    <td>{Utils.fmtDate(b.admissionDate)}</td>
                    <td style={{fontFamily:'var(--font-cond)', fontWeight:700}}>{b.targetSeats}</td>
                    <td>{bCands.length}</td>
                    <td style={{color:'#16a34a', fontWeight:700}}>{bAcc}</td>
                    <td>
                      {b.isInternal
                        ? <span style={{fontSize:11, color:'var(--blue)', fontWeight:700}}>Internal</span>
                        : <span style={{fontSize:11, color:'var(--text-light)'}}>External</span>
                      }
                    </td>
                    <td><BatchStatusChip status={status} /></td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(b)}>Edit</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={!!editBatch}
        onClose={() => setEditBatch(null)}
        title={"Edit — " + (editBatch ? editBatch.name : '')}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setEditBatch(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveEdit}>Save Changes</button>
          </>
        }
      >
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Round Name</label>
            <input className="form-control" value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Target Seats</label>
            <input type="number" className="form-control" value={form.targetSeats || ''} onChange={e => setForm(p => ({ ...p, targetSeats: +e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Application Deadline</label>
            <input type="date" className="form-control" value={form.deadline || ''} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Admissibility Results</label>
            <input type="date" className="form-control" value={form.admissibilityDate || ''} onChange={e => setForm(p => ({ ...p, admissibilityDate: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Admission Results</label>
            <input type="date" className="form-control" value={form.admissionDate || ''} onChange={e => setForm(p => ({ ...p, admissionDate: e.target.value }))} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Note</label>
          <input className="form-control" value={form.note || ''} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder="Optional note…" />
        </div>
        <div style={{display:'flex', gap:20, marginTop:8}}>
          <label style={{display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13}}>
            <input type="checkbox" checked={!!form.isInternal} onChange={e => setForm(p => ({ ...p, isInternal: e.target.checked }))} />
            Internal track (École Polytechnique)
          </label>
          <label style={{display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13}}>
            <input type="checkbox" checked={!!form.archived} onChange={e => setForm(p => ({ ...p, archived: e.target.checked }))} />
            Archived
          </label>
        </div>
      </Modal>
    </div>
  );
};
