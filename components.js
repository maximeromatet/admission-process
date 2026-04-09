// ── Modal ────────────────────────────────────────────────────
window.Modal = function({ open, onClose, title, children, footer, size }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={"modal " + (size === 'lg' ? 'modal-lg' : size === 'sm' ? 'modal-sm' : '')}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

// ── StatusBadge ───────────────────────────────────────────────
window.StatusBadge = function({ status }) {
  const label = Utils.STATUS_LABELS[status] || status;
  return <span className={"badge badge-" + status}>{label}</span>;
};

window.BatchStatusChip = function({ status }) {
  const cls = status === 'Completed' ? 'completed'
    : status === 'Confirming Enrollment' ? 'confirming'
    : status === 'Interview Phase' ? 'interview'
    : status === 'Open' ? 'open'
    : status === 'Reviewing' ? 's2_review'
    : 'upcoming';
  return <span className={"badge badge-" + cls}>{status}</span>;
};

// ── ScoreSelector ─────────────────────────────────────────────
window.ScoreSelector = function({ value, onChange, disabled }) {
  const steps = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
  return (
    <div className="score-selector">
      {steps.map(s => (
        <button
          key={s}
          className={"score-pill " + (value === s ? 'selected' : '')}
          onClick={() => !disabled && onChange(s)}
          disabled={disabled}
          type="button"
        >
          {s % 1 === 0 ? s : s.toFixed(1)}
        </button>
      ))}
    </div>
  );
};

// ── ScoreChip (for tables) ────────────────────────────────────
window.ScoreChip = function({ value }) {
  const cls = Utils.scoreClass(value);
  return <span className={"score-chip " + cls}>{Utils.fmtScore(value)}</span>;
};

// ── EmptyState ────────────────────────────────────────────────
window.EmptyState = function({ icon, title, text, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon || '📭'}</div>
      <div className="empty-state-title">{title || 'Nothing here yet'}</div>
      {text && <div className="empty-state-text">{text}</div>}
      {action && <div style={{marginTop: 14}}>{action}</div>}
    </div>
  );
};

// ── ProgressBar ───────────────────────────────────────────────
window.ProgressBar = function({ value, max, variant }) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="progress-bar">
      <div className={"progress-fill " + (variant || '')} style={{width: pct + '%'}} />
    </div>
  );
};

// ── QuotaRow ──────────────────────────────────────────────────
window.QuotaRow = function({ label, current, target, pct }) {
  const reached = pct ? Math.min(100, Math.round((current / (pct / 100 * target)) * 100))
                       : (target ? Math.min(100, Math.round((current / target) * 100)) : 0);
  const targetVal = pct ? Math.round(pct / 100 * target) : target;
  const variant = reached >= 100 ? 'success' : reached >= 70 ? '' : 'warning';
  return (
    <div className="quota-row">
      <div className="quota-row-header">
        <span className="quota-row-label">{label}</span>
        <span className="quota-row-values">
          <strong>{current}</strong> / {targetVal}
          {pct !== undefined && <span style={{marginLeft: 4, color: 'var(--text-light)'}}>({pct}%)</span>}
        </span>
      </div>
      <ProgressBar value={current} max={targetVal} variant={variant} />
    </div>
  );
};

// ── FieldRow ──────────────────────────────────────────────────
window.FieldRow = function({ label, value }) {
  return (
    <div className="field-row">
      <span className="field-key">{label}</span>
      <span className="field-val">{value || '—'}</span>
    </div>
  );
};

// ── ActivityLog ───────────────────────────────────────────────
window.ActivityLog = function({ log }) {
  if (!log || !log.length) return <EmptyState icon="📋" title="No activity yet" />;
  const sorted = [...log].sort((a, b) => new Date(b.time) - new Date(a.time));
  return (
    <div>
      {sorted.map((item, i) => (
        <div key={i} className="activity-item">
          <div className="activity-dot" />
          <div className="activity-content">
            <div className="activity-action">{item.action}</div>
            <div className="activity-time">{Utils.fmtDateTime(item.time)}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Confirm modal ─────────────────────────────────────────────
window.ConfirmModal = function({ open, onClose, onConfirm, title, message, danger }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title || 'Confirm'}
      size="sm"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className={"btn " + (danger ? 'btn-danger' : 'btn-primary')} onClick={onConfirm}>
            Confirm
          </button>
        </>
      }
    >
      <p style={{color: 'var(--text)', fontSize: 14}}>{message}</p>
    </Modal>
  );
};
