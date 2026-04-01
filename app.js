// ============================================================
//  MSc X-HEC Entrepreneurs — Main App
// ============================================================

const { useState, createContext, useContext } = React;

// ── Global state context ──────────────────────────────────────
window.AppStateContext = createContext(null);

function AppStateProvider({ children }) {
  const [state, setState] = useState({
    candidates: window.CANDIDATES_SEED,
    batches: window.BATCHES_SEED,
    users: window.COMMITTEE_USERS_SEED,
    alumni: window.ALUMNI_SEED,
    alumniAvail: window.ALUMNI_AVAIL_SEED,
    interviews: window.INTERVIEWS_SEED,
    settings: window.SETTINGS_SEED,
  });

  return (
    <AppStateContext.Provider value={[state, setState]}>
      {children}
    </AppStateContext.Provider>
  );
}

// ── Nav items ─────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard',  icon: '⬡',  label: 'Dashboard' },
  { id: 'candidates', icon: '👤', label: 'Applications' },
  { id: 'schedule',   icon: '📅', label: 'Interview Schedule' },
  { id: 'export',     icon: '⬇',  label: 'Export' },
  { id: 'settings',   icon: '⚙',  label: 'Settings' },
];

const PAGE_TITLES = {
  dashboard:          'Dashboard',
  candidates:         'Applications',
  'candidate-detail': 'Candidate Profile',
  schedule:           'Interview Schedule',
  export:             'Export',
  settings:           'Settings',
};

// ── App shell ─────────────────────────────────────────────────
function AppShell({ currentUser, onLogout }) {
  const [page, setPage] = useState('dashboard');
  const [pageParams, setPageParams] = useState({});
  const [appState] = useContext(AppStateContext);

  function navigate(target, params) {
    setPage(target);
    setPageParams(params || {});
  }

  function renderPage() {
    switch (page) {
      case 'dashboard':        return <DashboardPage navigate={navigate} />;
      case 'candidates':       return <CandidatesPage navigate={navigate} initialFilter={pageParams} />;
      case 'candidate-detail': return <CandidateDetailPage candidateId={pageParams.candidateId} navigate={navigate} />;
      case 'schedule':         return <SchedulePage navigate={navigate} />;
      case 'export':           return <ExportPage />;
      case 'settings':         return <SettingsPage />;
      default:                 return <DashboardPage navigate={navigate} />;
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-title">MSc X-HEC<br/>Entrepreneurs</div>
          <div className="sidebar-logo-sub">Admissions Portal</div>
          <div className="sidebar-logo-bar" />
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {NAV_ITEMS.map(item => (
            <div
              key={item.id}
              className={"nav-item " + (page === item.id || (item.id === 'candidates' && page === 'candidate-detail') ? 'active' : '')}
              onClick={() => navigate(item.id)}
            >
              <span className="nav-item-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {currentUser.slice(0, 2).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{currentUser.split("@")[0]}</div>
              <div className="sidebar-user-role">Committee</div>
            </div>
            <button className="sidebar-logout" onClick={onLogout} title="Sign out">⏏</button>
          </div>
        </div>
      </aside>

      <div className="main-area">
        <div className="top-bar">
          <div>
            <span className="top-bar-title">{PAGE_TITLES[page] || page}</span>
            {page === 'candidate-detail' && pageParams.candidateId && (() => {
              const c = appState.candidates.find(x => x.id === pageParams.candidateId);
              return c ? <span className="top-bar-breadcrumb">— {c.name}</span> : null;
            })()}
          </div>
          <div className="top-bar-right">
            <span style={{fontSize:12, color:'var(--text-light)'}}>Today · 1 Apr 2026</span>
            <button onClick={onLogout} style={{
              background:"none", border:"1.5px solid #d0dbe8", borderRadius:6,
              padding:"5px 14px", fontSize:13, color:"#003a70", cursor:"pointer",
              fontWeight:600, fontFamily:"'Barlow Condensed', sans-serif"
            }}>Sign out</button>
          </div>
        </div>
        <div className="page-content">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────
function App() {
  const stored = sessionStorage.getItem("xhec_user");
  const [currentUser, setCurrentUser] = React.useState(stored || null);

  function handleLogin(email) {
    sessionStorage.setItem("xhec_user", email);
    setCurrentUser(email);
  }

  function handleLogout() {
    sessionStorage.removeItem("xhec_user");
    setCurrentUser(null);
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  if (currentUser === "alumni@xhec.fr") {
    return (
      <AppStateProvider>
        <AlumniPortalPage onLogout={handleLogout} />
      </AppStateProvider>
    );
  }

  return (
    <AppStateProvider>
      <AppShell currentUser={currentUser} onLogout={handleLogout} />
    </AppStateProvider>
  );
}

// ── Mount ─────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')).render(<App />);