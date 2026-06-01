import { useState } from "react";
import { X, ShieldCheck, Copy, Check, ExternalLink } from "lucide-react";
import { API } from "../../constants";

function hashSeedClient(seed) {
  return crypto.subtle
    .digest("SHA-256", new TextEncoder().encode(seed))
    .then(buf =>
      Array.from(new Uint8Array(buf))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("")
    );
}

function crashFromSeed(seed) {
  return crypto.subtle
    .importKey("raw", new TextEncoder().encode(seed), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
    .then(key => crypto.subtle.sign("HMAC", key, new TextEncoder().encode("aviator")))
    .then(buf => {
      const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
      const h = parseInt(hex.slice(0, 8), 16);
      const e = Math.pow(2, 32);
      const raw = (100 * e - h) / (e - h);
      return Math.max(1.0, parseFloat((raw / 100).toFixed(2)));
    });
}

export default function ProvablyFairModal({ onClose, hash, roundId }) {
  const [copied, setCopied]           = useState(false);
  const [lookupId, setLookupId]       = useState(roundId ? String(roundId) : "");
  const [result, setResult]           = useState(null);
  const [verifying, setVerifying]     = useState(false);
  const [verifyErr, setVerifyErr]     = useState("");
  const [clientCheck, setClientCheck] = useState(null);

  const copy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const verify = async () => {
    setVerifying(true); setVerifyErr(""); setResult(null); setClientCheck(null);
    try {
      const res = await fetch(`${API}/game/verify/${lookupId}`);
      if (!res.ok) { setVerifyErr("Round not found."); setVerifying(false); return; }
      const data = await res.json();
      setResult(data);
      if (data.serverSeed) {
        const [computedHash, computedCrash] = await Promise.all([
          hashSeedClient(data.serverSeed),
          crashFromSeed(data.serverSeed),
        ]);
        setClientCheck({
          hashMatch: computedHash === data.serverSeedHash,
          crashMatch: computedCrash === data.crashPoint,
          computedHash,
          computedCrash,
        });
      }
    } catch {
      setVerifyErr("Verification failed. Try again.");
    }
    setVerifying(false);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-drag" />

        <div className="mhead">
          <div>
            <div className="mtitle" style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <ShieldCheck size={16} style={{ color: "var(--green)" }} /> Provably Fair
            </div>
            <div className="msub">Verify any round's crash point independently</div>
          </div>
          <button className="mclose" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="mbody" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* How it works */}
          <div style={{
            background: "var(--surface)", borderRadius: 8, padding: "12px 14px",
            fontSize: 12, color: "var(--text2)", lineHeight: 1.7,
            border: "1px solid var(--border)"
          }}>
            <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>How it works</div>
            Before each round starts, the server generates a random seed and publishes its
            SHA-256 hash. After the round ends the actual seed is revealed. You can then
            independently confirm that the hash matches the seed, and that the crash point
            was computed from that seed — proving the result was not manipulated.
          </div>

          {/* Current round hash */}
          {hash && (
            <div>
              <div style={{
                fontSize: 11, fontWeight: 700, color: "var(--text2)",
                marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.6px"
              }}>
                Current Round Hash (committed before round)
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  flex: 1, background: "var(--surface)", borderRadius: 6,
                  padding: "8px 10px", fontFamily: "monospace", fontSize: 11,
                  color: "var(--text)", wordBreak: "break-all", lineHeight: 1.5,
                  border: "1px solid var(--border)"
                }}>
                  {hash}
                </div>
                <button
                  style={{
                    background: "var(--surface)", border: "1px solid var(--border-md)",
                    borderRadius: 6, padding: "8px 10px", cursor: "pointer",
                    color: "var(--text)", flexShrink: 0
                  }}
                  onClick={() => copy(hash)}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </div>
            </div>
          )}

          {/* Lookup form */}
          <div>
            <div style={{
              fontSize: 11, fontWeight: 700, color: "var(--text2)",
              marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.6px"
            }}>
              Verify a Round
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="finput"
                style={{ flex: 1 }}
                placeholder="Round ID e.g. 42"
                value={lookupId}
                onChange={e => setLookupId(e.target.value)}
                onKeyDown={e => e.key === "Enter" && verify()}
              />
              <button
                className="btn-primary"
                style={{ flexShrink: 0, fontSize: 13 }}
                onClick={verify}
                disabled={verifying || !lookupId}
              >
                {verifying ? "Checking..." : "Verify"}
              </button>
            </div>
            {verifyErr && (
              <div style={{ fontSize: 12, color: "var(--red)", marginTop: 6 }}>{verifyErr}</div>
            )}
          </div>

          {/* Result */}
          {result && (
            <div style={{
              background: "var(--surface)", borderRadius: 8, padding: "12px 14px",
              display: "flex", flexDirection: "column", gap: 10,
              border: "1px solid var(--border)"
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>
                Round #{result.roundId}
              </div>
              <Row label="Crash Point" value={`${result.crashPoint}×`} />
              <Row label="Server Seed Hash" value={result.serverSeedHash} mono />
              <Row label="Server Seed" value={result.serverSeed || "Not yet revealed"} mono />

              {clientCheck && (
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, marginTop: 2 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: "var(--text2)",
                    marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.6px"
                  }}>
                    Client Verification
                  </div>
                  <StatusRow
                    label="SHA-256(seed) = hash"
                    ok={clientCheck.hashMatch}
                    detail={clientCheck.hashMatch
                      ? "Hash matches ✓"
                      : `Computed: ${clientCheck.computedHash?.slice(0, 20)}...`}
                  />
                  <StatusRow
                    label={`Crash from seed = ${result.crashPoint}×`}
                    ok={clientCheck.crashMatch}
                    detail={clientCheck.crashMatch
                      ? "Crash point verified ✓"
                      : `Computed: ${clientCheck.computedCrash}×`}
                  />
                </div>
              )}
            </div>
          )}

          {/* External verify link */}
          <a
            href="https://emn178.github.io/online-tools/sha256.html"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 12, color: "var(--blue)",
              display: "flex", alignItems: "center", gap: 5, textDecoration: "none"
            }}
          >
            <ExternalLink size={12} /> Verify SHA-256 independently in your browser
          </a>

        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <div style={{
        fontSize: 10, color: "var(--text2)",
        textTransform: "uppercase", letterSpacing: "0.5px"
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 11, color: "var(--text)",
        fontFamily: mono ? "monospace" : "inherit", wordBreak: "break-all"
      }}>
        {value}
      </div>
    </div>
  );
}

function StatusRow({ label, ok, detail }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
      <div style={{ fontSize: 13, color: ok ? "var(--green)" : "var(--red)", flexShrink: 0, marginTop: 1 }}>
        {ok ? "✓" : "✗"}
      </div>
      <div>
        <div style={{ fontSize: 11, color: "var(--text)" }}>{label}</div>
        <div style={{ fontSize: 10, color: ok ? "var(--green)" : "var(--red)" }}>{detail}</div>
      </div>
    </div>
  );
}