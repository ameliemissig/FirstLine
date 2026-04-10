"use client";
import { useState, useRef } from "react";
import "./globals.css";

const c = {
  bg: "#F5EFE6",
  surface: "#FFFFFF",
  text: "#1A1613",
  muted: "#8A8075",
  border: "#E5DDD0",
  accent: "#C14E2A",
  accentDark: "#9E3F1F",
  accentSoft: "#F5E4D8",
};

const RECIPIENTS = [
  { value: "founder_ceo", label: "Founder / CEO" },
  { value: "vp_head", label: "VP / Head of function" },
  { value: "director_senior", label: "Director / Senior Manager" },
  { value: "hiring_manager", label: "Hiring Manager / Recruiter" },
  { value: "peer_associate", label: "Peer / Associate" },
];

const WHY_PLACEHOLDER = `A few good examples to steal:
• I noticed you're expanding retail in LA and I ran retail marketing for a DTC wellness brand
• Looking for fractional brand strategy work in wellness tech
• Your CEO just posted about scaling ops, that's exactly my background
• Applying for your Head of Brand role, want to skip the portal`;

export default function Page() {
  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [company, setCompany] = useState("");
  const [recipient, setRecipient] = useState("founder_ceo");
  const [why, setWhy] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showPaste, setShowPaste] = useState(false);
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setError("");
    setResumeFileName(file.name);
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      try {
        const pdfjs = await import("pdfjs-dist/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.mjs`;
        const buf = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: buf }).promise;
        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((it) => it.str).join(" ") + "\n";
        }
        setResumeText(text.trim());
      } catch (e) {
        setError("Could not read that PDF. Try pasting the text instead.");
        setShowPaste(true);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (e) => setResumeText(e.target.result);
      reader.readAsText(file);
    }
  };

  const generate = async () => {
    setError("");
    if (!resumeText.trim()) return setError("Upload or paste your resume first.");
    if (!company.trim()) return setError("Add a company URL or name.");
    if (!why.trim()) return setError("Tell us why you're reaching out.");
    setLoading(true);
    setResult("");
    try {
      let companyData = company;
      try {
        const sr = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: company }),
        });
        const sd = await sr.json();
        if (sd.text) companyData = sd.text;
      } catch {}
      const r = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, companyData, whyCompany: why, recipientType: recipient }),
      });
      const d = await r.json();
      if (d.error) setError(d.error);
      else setResult(d.dm || "");
    } catch (e) {
      setError(`Something went wrong: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const tryAnother = () => {
    setCompany("");
    setWhy("");
    setRecipient("founder_ceo");
    setResult("");
    setError("");
    setCopied(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startOver = () => {
    setResumeText("");
    setResumeFileName("");
    setShowPaste(false);
    tryAnother();
  };

  const copy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const charCount = result.length;

  const btn = { background: c.accent, color: c.bg, padding: "16px 28px", borderRadius: 10, fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em", transition: "background 0.15s" };
  const btnSecondary = { background: "transparent", color: c.accent, padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600, border: `1.5px solid ${c.accent}` };
  const input = { width: "100%", padding: "14px 16px", borderRadius: 10, border: `1.5px solid ${c.border}`, background: c.surface, fontSize: 15, outline: "none", color: c.text };
  const label = { display: "block", fontSize: 13, fontWeight: 700, color: c.text, marginBottom: 8, letterSpacing: "0.02em", textTransform: "uppercase" };
  const sub = { fontSize: 13, color: c.muted, marginTop: 6, marginBottom: 0 };

  return (
    <div style={{ minHeight: "100vh", background: c.bg, padding: "40px 20px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "inline-block", padding: "6px 14px", borderRadius: 999, background: c.accentSoft, color: c.accentDark, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 20, textTransform: "uppercase" }}>Free · No signup</div>
          <h1 style={{ fontSize: 56, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 16, color: c.text, fontFamily: "'Playfair Display', Georgia, serif" }}>First Line</h1>
          <p style={{ fontSize: 18, color: c.muted, lineHeight: 1.5, maxWidth: 480, margin: "0 auto" }}>Drop your resume, pick a company, get a LinkedIn DM that sounds like a real human wrote it.</p>
        </div>

        {/* Form */}
        <div style={{ background: c.surface, borderRadius: 16, padding: 32, border: `1px solid ${c.border}`, boxShadow: "0 1px 3px rgba(26,22,19,0.04)" }}>
          {/* Resume */}
          <div style={{ marginBottom: 28 }}>
            <div style={label}>1. Your resume</div>
            {resumeText ? (
              <div style={{ padding: 14, borderRadius: 10, background: c.accentSoft, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14, color: c.accentDark, fontWeight: 600 }}>✓ {resumeFileName || "Resume loaded"} ({resumeText.length.toLocaleString()} chars)</span>
                <button onClick={() => { setResumeText(""); setResumeFileName(""); setShowPaste(false); }} style={{ color: c.accentDark, fontSize: 13, fontWeight: 600, textDecoration: "underline" }}>Remove</button>
              </div>
            ) : (
              <>
                <input ref={fileRef} type="file" accept=".pdf,.txt" onChange={(e) => handleFile(e.target.files?.[0])} style={{ display: "none" }} />
                <button onClick={() => fileRef.current?.click()} style={{ ...input, textAlign: "left", cursor: "pointer", color: c.muted, display: "block" }}>📄 Click to upload PDF or TXT</button>
                <button onClick={() => setShowPaste(!showPaste)} style={{ ...sub, color: c.accent, textDecoration: "underline", marginTop: 10, cursor: "pointer", display: "block" }}>or paste your resume text instead</button>
                {showPaste && (
                  <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} placeholder="Paste your resume here..." rows={8} style={{ ...input, marginTop: 10, fontFamily: "inherit" }} />
                )}
              </>
            )}
          </div>

          {/* Company */}
          <div style={{ marginBottom: 28 }}>
            <div style={label}>2. Target company</div>
            <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="https://ouraring.com or just 'Oura'" style={input} />
            <p style={sub}>Paste a URL to pull real context from their site, or just type the company name.</p>
          </div>

          {/* Recipient */}
          <div style={{ marginBottom: 28 }}>
            <div style={label}>3. Who are you planning to message?</div>
            <p style={{ ...sub, marginTop: 0, marginBottom: 10 }}>Choose based on who you're actually messaging. The DM tone changes completely for a CEO vs. a recruiter.</p>
            <select value={recipient} onChange={(e) => setRecipient(e.target.value)} style={{ ...input, cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%238A8075' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center", paddingRight: 40 }}>
              {RECIPIENTS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          {/* Why */}
          <div style={{ marginBottom: 28 }}>
            <div style={label}>4. Why this company?</div>
            <textarea value={why} onChange={(e) => setWhy(e.target.value)} placeholder={WHY_PLACEHOLDER} rows={6} style={{ ...input, fontFamily: "inherit", whiteSpace: "pre-wrap" }} />
          </div>

          {error && <div style={{ padding: 12, borderRadius: 10, background: "#FEE", color: "#933", fontSize: 14, marginBottom: 16 }}>{error}</div>}

          <button onClick={generate} disabled={loading} style={{ ...btn, width: "100%", opacity: loading ? 0.6 : 1, cursor: loading ? "wait" : "pointer" }}>
            {loading ? "Writing your DM..." : "Generate DM →"}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div style={{ marginTop: 32, background: c.surface, borderRadius: 16, padding: 32, border: `2px solid ${c.accent}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ ...label, marginBottom: 0 }}>Your DM</div>
              <span style={{ fontSize: 12, color: charCount > 200 ? "#C04" : c.muted, fontWeight: 600 }}>{charCount} / 200 chars</span>
            </div>
            <div style={{ padding: 20, background: c.bg, borderRadius: 10, fontSize: 16, lineHeight: 1.6, color: c.text, whiteSpace: "pre-wrap", marginBottom: 20 }}>{result}</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={copy} style={{ ...btn, flex: 1, minWidth: 140 }}>{copied ? "✓ Copied!" : "Copy DM"}</button>
              <button onClick={tryAnother} style={btnSecondary}>Try another company</button>
              <button onClick={startOver} style={{ ...btnSecondary, borderColor: c.border, color: c.muted }}>Start over</button>
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 48, fontSize: 13, color: c.muted }}>
          Built by Amelie · <a href="https://github.com/ameliemissig/firstline" style={{ color: c.accent, textDecoration: "underline" }}>View source</a>
        </div>
      </div>
    </div>
  );
}
