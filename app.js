// ============================================================
//  MSc X-HEC Entrepreneurs — Main App
// ============================================================

const { useState, createContext, useContext } = React;

// ── Global state context ──────────────────────────────────────
window.AppStateContext = createContext(null);

// Merge seed availabilities with anything alumni have saved in localStorage.
// For any alumni who has localStorage data, their localStorage entries win
// (the seed entries for that alumni are dropped). This ensures that when
// an admin opens the portal after an alumni has submitted their availability,
// the admin sees the real submitted slots rather than the seed placeholder.
function loadAlumniAvail() {
  const fromStorage = [];
  const alumniWithStorageData = new Set();

  window.ALUMNI_SEED.forEach(function(a) {
    try {
      const raw = localStorage.getItem('xhec_avail_' + a.id);
      if (raw) {
        const keys = JSON.parse(raw); // ["2026-02-05_AM", ...]
        if (Array.isArray(keys) && keys.length > 0) {
          alumniWithStorageData.add(a.id);
          keys.forEach(function(key) {
            const parts = key.split('_');
            if (parts.length === 2) {
              fromStorage.push({ alumniId: a.id, date: parts[0], period: parts[1] });
            }
          });
        }
      }
    } catch(e) {}
  });

  // Keep seed entries only for alumni who haven't submitted anything yet
  const seedEntries = window.ALUMNI_AVAIL_SEED.filter(function(av) {
    return !alumniWithStorageData.has(av.alumniId);
  });

  return seedEntries.concat(fromStorage);
}

// ── LocalStorage persistence ──────────────────────────────────
const LS_KEY = 'xhec_app_state_v1';

function loadPersistedState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.candidates)) {
        return parsed;
      }
    }
  } catch(e) {}
  return null;
}

function persistState(state) {
  try {
    // Strip blob: URLs — they're memory-only and cannot survive a page refresh.
    // Batches and users are NOT persisted — they always load fresh from the seed
    // so that date changes in data.js take effect immediately without clearing localStorage.
    const sanitized = {
      candidates: state.candidates.map(function(c) {
        return (c.pdfUrl && c.pdfUrl.startsWith('blob:'))
          ? { ...c, pdfUrl: null }
          : c;
      }),
      interviews: state.interviews,
      settings:   state.settings,
    };
    localStorage.setItem(LS_KEY, JSON.stringify(sanitized));
  } catch(e) {}
}

function AppStateProvider({ children }) {
  const [state, setStateRaw] = useState(function() {
    const persisted = loadPersistedState();
    // Batches and users always come from seed — never from localStorage —
    // so that any correction to data.js is reflected immediately.
    return {
      candidates: persisted ? persisted.candidates : window.CANDIDATES_SEED,
      batches:    window.BATCHES_SEED,
      users:      window.COMMITTEE_USERS_SEED,
      alumni:     window.ALUMNI_SEED,
      alumniAvail: loadAlumniAvail(),
      interviews: persisted ? persisted.interviews : window.INTERVIEWS_SEED,
      settings:   persisted ? persisted.settings   : window.SETTINGS_SEED,
    };
  });

  // Wrap setState so every update is automatically saved to localStorage
  function setState(updater) {
    setStateRaw(function(prev) {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      persistState(next);
      return next;
    });
  }

  return (
    <AppStateContext.Provider value={[state, setState]}>
      {children}
    </AppStateContext.Provider>
  );
}

// ── Nav items ─────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard',      icon: '⬡',  label: 'Dashboard' },
  { id: 'candidates',     icon: '👤', label: 'Applications' },
  { id: 'schedule',       icon: '📅', label: 'Interview Schedule' },
  { id: 'future-cohorts', icon: '🎓', label: 'Future Cohort' },
  { id: 'export',         icon: '⬇',  label: 'Export' },
];

const PAGE_TITLES = {
  dashboard:          'Dashboard',
  candidates:         'Applications',
  'candidate-detail': 'Candidate Profile',
  schedule:           'Interview Schedule',
  'future-cohorts':   'Future Cohort',
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
      case 'candidate-detail': return <CandidateDetailPage candidateId={pageParams.candidateId} mode={pageParams.mode} navigate={navigate} />;
      case 'future-cohorts':   return <FutureCohortsPage navigate={navigate} />;
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
            <button className="sidebar-logout" onClick={() => navigate('settings')} title="Settings" style={{marginLeft:2}}>⚙</button>
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
            <span style={{fontSize:12, color:'var(--text-light)'}}>
              Today · {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
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

  if (currentUser.endsWith('@alumni.hec.edu')) {
    return (
      <AppStateProvider>
        <AlumniPortalPage onLogout={handleLogout} alumniEmail={currentUser} />
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