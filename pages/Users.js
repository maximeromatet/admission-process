// ============================================================
//  Users Page
// ============================================================

window.UsersPage = function() {
  const { useState } = React;
  const [appState, setAppState] = React.useContext(window.AppStateContext);
  const { users, alumni } = appState;
  const [activeTab, setActiveTab] = useState('committee');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = new
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({});

  function openNew() {
    setEditTarget(null);
    setForm(activeTab === 'committee'
      ? { name:'', email:'', role:'Admin', initials:'' }
      : { name:'', email:'', cohort: 2024, initials:'' }
    );
    setShowModal(true);
  }

  function openEdit(item) {
    setEditTarget(item);
    setForm({ ...item });
    setShowModal(true);
  }

  function save() {
    if (activeTab === 'committee') {
      if (editTarget) {
        setAppState(prev => ({
          ...prev,
          users: prev.users.map(u => u.id === editTarget.id ? { ...u, ...form } : u),
        }));
      } else {
        const newUser = { ...form, id: 'u' + Date.now() };
        setAppState(prev => ({ ...prev, users: [...prev.users, newUser] }));
      }
    } else {
      if (editTarget) {
        setAppState(prev => ({
          ...prev,
          alumni: prev.alumni.map(a => a.id === editTarget.id ? { ...a, ...form } : a),
        }));
      } else {
        const newAlum = { ...form, id: 'a' + Date.now() };
        setAppState(prev => ({ ...prev, alumni: [...prev.alumni, newAlum] }));
      }
    }
    setShowModal(false);
  }

  function handleDelete(id) {
    if (activeTab === 'committee') {
      setAppState(prev => ({ ...prev, users: prev.users.filter(u => u.id !== id) }));
    } else {
      setAppState(prev => ({ ...prev, alumni: prev.alumni.filter(a => a.id !== id) }));
    }
    setDeleteId(null);
  }

  return (
    <div>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16}}>
        <div className="tabs" style={{marginBottom:0}}>
          <div className={"tab " + (activeTab === 'committee' ? 'active' : '')} onClick={() => setActiveTab('committee')}>
            Committee Members <span className="tab-count">{users.length}</span>
          </div>
          <div className={"tab " + (activeTab === 'alumni' ? 'active' : '')} onClick={() => setActiveTab('alumni')}>
            Alumni Volunteers <span className="tab-count">{alumni.length}</span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Add</button>
      </div>

      {activeTab === 'committee' && (
        <div className="card">
          {users.length === 0 ? (
            <EmptyState icon="👤" title="No committee members yet" />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{display:'flex', alignItems:'center', gap:10}}>
                          <div className="sidebar-user-avatar">{u.initials || Utils.initials(u.name)}</div>
                          <span style={{fontWeight:600}}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{color:'var(--text-light)'}}>{u.email}</td>
                      <td>
                        <span style={{
                          fontFamily:'var(--font-cond)', fontSize:12, fontWeight:700,
                          color:'var(--navy)', background:'var(--bg)', padding:'2px 8px', borderRadius:4
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <div style={{display:'flex', gap:6}}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(u)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(u.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'alumni' && (
        <div className="card">
          {alumni.length === 0 ? (
            <EmptyState icon="🎓" title="No alumni volunteers yet" />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Alumni</th>
                    <th>Email</th>
                    <th>Cohort Year</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {alumni.map(a => (
                    <tr key={a.id}>
                      <td>
                        <div style={{display:'flex', alignItems:'center', gap:10}}>
                          <div className="sidebar-user-avatar" style={{background:'#7c3aed'}}>
                            {a.initials || Utils.initials(a.name)}
                          </div>
                          <span style={{fontWeight:600}}>{a.name}</span>
                        </div>
                      </td>
                      <td style={{color:'var(--text-light)'}}>{a.email}</td>
                      <td style={{fontFamily:'var(--font-cond)', fontWeight:700}}>{a.cohort}</td>
                      <td>
                        <div style={{display:'flex', gap:6}}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(a)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(a.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={(editTarget ? 'Edit' : 'Add') + (activeTab === 'committee' ? ' Committee Member' : ' Alumni Volunteer')}
        size="sm"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={!form.name || !form.email}>Save</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input className="form-control" value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value, initials: Utils.initials(e.target.value) }))} placeholder="e.g. Marie Dupont" />
        </div>
        <div className="form-group">
          <label className="form-label">Email *</label>
          <input type="email" className="form-control" value={form.email || ''} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="name@hec.edu" />
        </div>
        {activeTab === 'committee' && (
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-control" value={form.role || 'Admin'} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
              <option>Admin</option>
            </select>
          </div>
        )}
        {activeTab === 'alumni' && (
          <div className="form-group">
            <label className="form-label">Cohort Year</label>
            <input type="number" className="form-control" value={form.cohort || 2024} onChange={e => setForm(p => ({ ...p, cohort: +e.target.value }))} />
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => handleDelete(deleteId)}
        title="Delete User"
        message="Are you sure you want to remove this user?"
        danger
      />
    </div>
  );
};
