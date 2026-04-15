const CREDENTIALS = {
  "admin.xhec":                  "promotion2027",
  "zoe.lechevalier":   "alumni2027",
  "guillaume.ledieudeville":        "promotion2027",
  "bruno.martinaud":       "promotion2027",
  "mathias.bejean":        "promotion2027"
};

function Login({ onLogin }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  function handleSubmit() {
    setError("");
    setLoading(true);
    setTimeout(() => {
      if (CREDENTIALS[email.trim().toLowerCase()] === password) {
        onLogin(email.trim().toLowerCase());
      } else {
        setError("Invalid email or password.");
      }
      setLoading(false);
    }, 600);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSubmit();
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#f0f6fa"
    }}>
      <div style={{
        background: "#fff", borderRadius: 12, padding: "48px 40px",
        width: 380, boxShadow: "0 4px 24px rgba(0,58,112,0.10)"
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 22, fontWeight: 700, color: "#003a70",
            letterSpacing: 1, textTransform: "uppercase"
          }}>
            MSc X-HEC Entrepreneurs
          </div>
          <div style={{ color: "#888", fontSize: 13, marginTop: 4 }}>
            Admissions Platform
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#003a70",
            textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="you@xhec.fr"
            style={{
              display: "block", width: "100%", padding: "10px 12px",
              border: "1.5px solid #d0dbe8", borderRadius: 7, fontSize: 14,
              outline: "none", boxSizing: "border-box",
              fontFamily: "'Barlow', sans-serif"
            }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#003a70",
            textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="••••••••"
            style={{
              display: "block", width: "100%", padding: "10px 12px",
              border: "1.5px solid #d0dbe8", borderRadius: 7, fontSize: 14,
              outline: "none", boxSizing: "border-box",
              fontFamily: "'Barlow', sans-serif"
            }}
          />
        </div>

        {error && (
          <div style={{
            background: "#fff0f0", border: "1px solid #ffcccc",
            borderRadius: 6, padding: "8px 12px", color: "#c0392b",
            fontSize: 13, marginBottom: 16
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%", padding: "11px 0",
            background: loading ? "#7aafd4" : "#003a70",
            color: "#fff", border: "none", borderRadius: 7,
            fontSize: 15, fontWeight: 600, cursor: loading ? "default" : "pointer",
            fontFamily: "'Barlow Condensed', sans-serif",
            letterSpacing: 0.5, textTransform: "uppercase",
            transition: "background 0.2s"
          }}
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </div>
    </div>
  );
}