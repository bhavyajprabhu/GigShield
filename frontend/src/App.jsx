import React, { useState, useEffect, useMemo, useRef } from 'react';
import { auth, googleProvider } from './firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import Chart from 'chart.js/auto';



const CHART_COLORS = ["#FFB020", "#33D6A6", "#4C8DFF", "#FF5C63", "#9C7BFF"];
function ChartBox({ type, data, options, height = 220, ariaLabel }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    const cfg = { type, data, options: Object.assign({ responsive: true, maintainAspectRatio: false }, options || {}) };
    chartRef.current = new Chart(canvasRef.current, cfg);
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [JSON.stringify(data), JSON.stringify(options), type]);
  return (
    <div style={{ position: "relative", height }}>
      <canvas ref={canvasRef} role="img" aria-label={ariaLabel || "chart"}></canvas>
    </div>
  );
}
const gridColor = () => getComputedStyle(document.documentElement).getPropertyValue('--line') || 'rgba(255,255,255,0.08)';
const dimColor = () => (document.documentElement.getAttribute('data-theme') === 'light') ? '#5B6270' : '#8B93A6';

/* ================= ICONS (inline svg, stroke-based, no external icon font needed) ================= */
const Icon = ({ d, size = 18, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>{d}</svg>
);
const IconShield = (p) => <Icon {...p} d={<path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z" />} />;
const IconHome = (p) => <Icon {...p} d={<><path d="M4 11l8-7 8 7" /><path d="M6 10v9h12v-9" /></>} />;
const IconPlus = (p) => <Icon {...p} d={<><path d="M12 5v14M5 12h14" /></>} />;
const IconCamera = (p) => <Icon {...p} d={<><path d="M4 8h3l2-3h6l2 3h3v11H4V8z" /><circle cx="12" cy="13" r="3.5" /></>} />;
const IconScale = (p) => <Icon {...p} d={<><path d="M12 3v18M6 8l-3 6a3 3 0 006 0l-3-6zM18 8l-3 6a3 3 0 006 0l-3-6zM6 8h12M9 21h6" /></>} />;
const IconChat = (p) => <Icon {...p} d={<path d="M4 5h16v11H8l-4 4V5z" />} />;
const IconChart = (p) => <Icon {...p} d={<><path d="M4 20V10M11 20V4M18 20v-7" /><path d="M3 20h18" /></>} />;
const IconBulb = (p) => <Icon {...p} d={<><path d="M9 18h6M10 21h4M7 10a5 5 0 1110 0c0 2-1.5 3-2 4.5H9C8.5 13 7 12 7 10z" /></>} />;
const IconHeart = (p) => <Icon {...p} d={<path d="M12 21s-7-4.5-9.5-9C1 8 2.5 4 6.5 4c2 0 3.5 1.2 4.5 2.8C12 5.2 13.5 4 15.5 4 19.5 4 21 8 19.5 12c-2.5 4.5-7.5 9-7.5 9z" />} />;
const IconAlert = (p) => <Icon {...p} d={<><path d="M12 3l10 18H2L12 3z" /><path d="M12 10v4M12 17h.01" /></>} />;
const IconBattery = (p) => <Icon {...p} d={<><rect x="2" y="7" width="17" height="10" rx="2" /><path d="M21 10v4M6 10v4M9 10v4" /></>} />;
const IconTarget = (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r=".5" /></>} />;
const IconUsers = (p) => <Icon {...p} d={<><circle cx="9" cy="8" r="3" /><path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6" /><circle cx="18" cy="9" r="2.5" /><path d="M16 20c0-2.5 1.5-4.5 3.5-5.3" /></>} />;
const IconFile = (p) => <Icon {...p} d={<><path d="M6 2h9l5 5v15H6V2z" /><path d="M15 2v5h5" /></>} />;
const IconBell = (p) => <Icon {...p} d={<><path d="M6 10a6 6 0 0112 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10z" /><path d="M10 19a2 2 0 004 0" /></>} />;
const IconUser = (p) => <Icon {...p} d={<><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.9 3.1-6 7-6s7 2.1 7 6" /></>} />;
const IconGrid = (p) => <Icon {...p} d={<><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>} />;
const IconArrowR = (p) => <Icon {...p} d={<><path d="M5 12h14M13 6l6 6-6 6" /></>} />;
const IconMoon = (p) => <Icon {...p} d={<path d="M20 14.5A8.5 8.5 0 119.5 4a7 7 0 0010.5 10.5z" />} />;
const IconSun = (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></>} />;
const IconCopy = (p) => <Icon {...p} d={<><rect x="8" y="8" width="12" height="12" rx="1.5" /><path d="M5 16H4a1 1 0 01-1-1V4a1 1 0 011-1h11a1 1 0 011 1v1" /></>} />;
const IconDownload = (p) => <Icon {...p} d={<><path d="M12 3v12M7 10l5 5 5-5" /><path d="M4 20h16" /></>} />;
const IconSend = (p) => <Icon {...p} d={<path d="M4 12l16-8-6 16-3-6-7-2z" />} />;
const IconCheck = (p) => <Icon {...p} d={<path d="M4 12l6 6 10-12" />} />;
const IconX = (p) => <Icon {...p} d={<path d="M6 6l12 12M18 6L6 18" />} />;
const IconMic = (p) => <Icon {...p} d={<><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0014 0M12 18v3" /></>} />;
const IconMapPin = (p) => <Icon {...p} d={<><path d="M12 21s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></>} />;
const IconTrend = (p) => <Icon {...p} d={<><path d="M3 17l6-6 4 4 8-9" /><path d="M15 6h6v6" /></>} />;
const IconClock = (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>} />;
const IconGlobe = (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.7 4 6 4 9s-1.5 6.3-4 9c-2.5-2.7-4-6-4-9s1.5-6.3 4-9z" /></>} />;
const IconLogout = (p) => <Icon {...p} d={<><path d="M9 21H4V3h5" /><path d="M16 17l5-5-5-5M21 12H9" /></>} />;

/* ================= MOCK DATA ENGINE ================= */
const PLATFORMS = ["Uber", "Ola", "Namma Yatri", "Rapido", "Swiggy", "Zomato", "Zepto", "Blinkit"];
const AREAS = ["Downtown Core", "Riverside District", "North Terminal", "Old Market", "Tech Park", "Harbor Row"];
const rng = (seed => () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; })(42);
function pick(arr) { return arr[Math.floor(rng() * arr.length)]; }
function round2(n) { return Math.round(n * 100) / 100; }

const RATE_CARD = {
  base: 45, perKm: 12, perMin: 2.2, nightBonusPct: 0.12
};
function expectedFare(distanceKm, durationMin, isNight) {
  let e = RATE_CARD.base + distanceKm * RATE_CARD.perKm + durationMin * RATE_CARD.perMin;
  if (isNight) e *= (1 + RATE_CARD.nightBonusPct);
  return round2(e);
}
function fairnessOf(actual, expected) {
  const pct = Math.round((actual / expected) * 100);
  let status = "fair";
  if (pct < 80) status = "underpaid";
  else if (pct < 95) status = "borderline";
  return { pct, status };
}

function genMockJobs(n = 42) {
  const jobs = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const daysAgo = Math.floor(rng() * 28);
    const hour = Math.floor(rng() * 24);
    const d = new Date(now); d.setDate(d.getDate() - daysAgo); d.setHours(hour, Math.floor(rng() * 60), 0, 0);
    const isNight = hour >= 21 || hour < 5;
    const distanceKm = round2(2 + rng() * 13);
    const durationMin = Math.round(distanceKm * 3.1 + rng() * 10);
    const exp = expectedFare(distanceKm, durationMin, isNight);
    const underpayChance = rng();
    let actual;
    if (underpayChance < 0.22) actual = round2(exp * (0.55 + rng() * 0.24));
    else if (underpayChance < 0.4) actual = round2(exp * (0.82 + rng() * 0.12));
    else actual = round2(exp * (0.96 + rng() * 0.22));
    const platform = pick(PLATFORMS);
    const fairness = fairnessOf(actual, exp);
    jobs.push({
      id: "job_" + i + "_" + Math.floor(rng() * 99999),
      platform, date: d, distanceKm, durationMin, isNight,
      area: pick(AREAS), pickup: pick(AREAS), drop: pick(AREAS),
      expected: exp, actual, fairness, notes: ""
    });
  }
  return jobs.sort((a, b) => b.date - a.date);
}

function fmtCur(n) { return "₹" + Math.round(n).toLocaleString("en-IN"); }
function fmtDate(d) { return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }); }
function fmtDateTime(d) { return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + ", " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }); }
function daysSince(d) { return (Date.now() - d.getTime()) / 86400000; }

/* ============== SIMULATED "AI" LAYER ==============
   The chatbot and weekly-insight generator below are rule-based simulations
   that mirror what a real LLM API call would return — swap in a real call
   without changing any UI code, see callAIChat below. OCR is real (Tesseract.js
   running client-side) — see parseOCRText and the OCRUpload component. */
function callAIChat(question, ctx) {
  const q = question.toLowerCase();
  const flagged = ctx.jobs.filter(j => j.fairness.status === "underpaid").length;
  if (q.includes("fair") && (q.includes("this") || q.includes("fare"))) {
    return `Looking at your most recent job on ${ctx.lastJob.platform}: expected fare for ${ctx.lastJob.distanceKm}km was ${fmtCur(ctx.lastJob.expected)}, you were paid ${fmtCur(ctx.lastJob.actual)} — that's ${ctx.lastJob.fairness.pct}% of the fair-rate benchmark. ${ctx.lastJob.fairness.status === "underpaid" ? "That falls below a fair threshold — you may want to raise a complaint." : "That's within a fair range."}`;
  }
  if (q.includes("right")) {
    return "As a gig worker you generally have the right to: see the fare breakdown before accepting a job, dispute a payout you believe is incorrect within the platform's stated window, work without discrimination, and access any accident/injury cover the platform provides. Rights vary by platform and region — I can help you draft a complaint if something looks off.";
  }
  if (q.includes("complaint") || q.includes("raise")) {
    return `You currently have ${flagged} flagged underpayment${flagged === 1 ? "" : "s"}. Open the Complaints tab and I'll auto-draft a message with the job details filled in — you can edit it before sending it to the platform's support channel.`;
  }
  if (q.includes("explain") && q.includes("earn")) {
    return `Over the period shown, your average fairness score is ${ctx.avgFairness}%. ${ctx.nightShare}% of your underpaid jobs happened during night shifts, which is usually where fair-rate calculations get missed by platforms because night bonuses aren't applied consistently.`;
  }
  if (q.includes("accept")) {
    return "As a rule of thumb: if the offered fare is under 80% of what distance + time would normally pay (check the Fairness tab), it's usually not worth accepting unless you need the trip to reposition. I can't see live incoming offers in this demo, but you can paste the fare and distance into Job Logging to check instantly.";
  }
  if (q.includes("increase") || q.includes("income") || q.includes("more money")) {
    return "Three patterns from your data: 1) your highest fairness scores cluster on UrbanRide evening shifts — prioritise those when available, 2) you have unclaimed potential during weekend afternoons where community benchmark fares run higher, 3) reducing very long shifts (9+ hrs) slightly raises your effective hourly rate by cutting late-shift underpayment risk.";
  }
  return "I can help with fairness checks, your rights, drafting complaints, explaining your earnings, whether to accept a fare, or how to earn more. Try asking one of those, or open the relevant tab and ask about what you see there.";
}

/* ============== REAL OCR PARSING ==============
   Runs Tesseract.js (client-side OCR, no API key / backend needed) on the
   uploaded screenshot, then regex-parses the recognized text for fare,
   distance and duration. This is a real read of the actual image — not a
   simulation. Numbers are always shown for user review/edit before saving,
   since OCR on small app-UI text can still misread digits. */
function parseAddressBlock(raw) {
  // Cuts off at the first UI/footer element (payment method, action buttons)
  // so those don't get swept into the address, and drops symbol-only lines
  // that are usually OCR misreads of icons.
  const stop = /^(cash(\s+(on\s+delivery|payment))?|card payment|online payment|pay online|match|confirm|accept|decline|call|message|chat|share trip|rate|tip|swipe|slide to|go online)\b/i;
  const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
  const kept = [];
  for (const l of lines) {
    if (stop.test(l)) break;
    if (!/[a-zA-Z]/.test(l)) continue;
    kept.push(l.replace(/,\s*$/, ""));
  }
  return kept.join(", ");
}

function parseOCRText(text) {
  const clean = text.replace(/\r/g, "");
  const lines = clean.split("\n").map(l => l.trim()).filter(Boolean);

  // --- Fare: prefer a currency-marked number near words like fare/total/earn/pay ---
  const currencyNum = /(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d{1,2})?)/i;
  let fare = null;
  const fareKeywordLine = lines.find(l => /(fare|total|earning|earn|payout|amount|you\s*earned)/i.test(l));
  if (fareKeywordLine) {
    const m = fareKeywordLine.match(currencyNum) || fareKeywordLine.match(/([\d,]+(?:\.\d{1,2})?)/);
    if (m) fare = parseFloat(m[1].replace(/,/g, ""));
  }
  if (fare == null) {
    // fall back: largest currency-marked number anywhere in the text
    const all = [...clean.matchAll(new RegExp(currencyNum, "gi"))].map(m => parseFloat(m[1].replace(/,/g, "")));
    if (all.length) fare = Math.max(...all);
  }
  if (fare == null) {
    // OCR frequently mangles the ₹/Rs symbol rather than cleanly dropping it —
    // it often turns into a stray digit glued directly onto the front of the
    // real number (e.g. "₹193.24" → "7193.24"). A single-trip local fare is
    // realistically always under 1000, so a 4+ digit bare number is far more
    // likely a misread symbol than a genuine 4-digit fare — strip the leading
    // digit and prefer that reading. Always left editable before saving.
    const bare = [...clean.matchAll(/\b([\d,]{1,5})\.(\d{2})\b/g)].map(m => ({ intPart: m[1].replace(/,/g, ""), dec: m[2] }));
    for (const c of bare) {
      let val = parseFloat(c.intPart + "." + c.dec);
      // Only trim the first digit if it's 4+ digits long and the fare is excessively high, or starts with 7 (common ₹ misread)
      if (c.intPart.length >= 4 && (c.intPart.startsWith("7") || val > 3000)) {
        const trimmed = parseFloat(c.intPart.slice(1) + "." + c.dec);
        if (trimmed >= 10) val = trimmed;
      }
      if (val >= 10) { fare = val; break; }
    }
  }

  // --- Distance, duration & addresses: some ride-request cards show TWO legs
  // — the driver's distance to reach pickup, then the actual trip. Always
  // take the LAST "X min (Y km)" pair for distance/duration (the fare should
  // be checked against the actual trip, not the pickup approach), and use
  // the text between/after the leg markers to pull the pickup and drop
  // addresses that ride/delivery apps print right below each leg. ---
  let distanceKm = null, durationMin = null, pickup = "", drop = "";
  const legs = [...clean.matchAll(/(?:(\d+)\s*(?:hr|hour)s?\s*)?(\d+(?:\.\d+)?)\s*mins?\s*\(([\d.]+)\s*km\)/gi)];
  if (legs.length) {
    const last = legs[legs.length - 1];
    const hrs = last[1] ? parseInt(last[1], 10) : 0;
    durationMin = hrs * 60 + parseFloat(last[2]);
    distanceKm = parseFloat(last[3]);
    if (legs.length >= 2) {
      const leg0 = legs[0], leg1 = legs[1];
      pickup = parseAddressBlock(clean.slice(leg0.index + leg0[0].length, leg1.index));
      drop = parseAddressBlock(clean.slice(leg1.index + leg1[0].length));
    } else {
      drop = parseAddressBlock(clean.slice(legs[0].index + legs[0][0].length));
    }
  } else {
    const distMatch = clean.match(/([\d]+(?:\.\d+)?)\s*(?:km|kilomet)/i);
    if (distMatch) distanceKm = parseFloat(distMatch[1]);
    const hrMin = clean.match(/(\d+)\s*(?:hr|hour)s?\s*(\d+)?\s*(?:min)?/i);
    const minOnly = clean.match(/(\d+)\s*min/i);
    if (hrMin) { durationMin = parseInt(hrMin[1], 10) * 60 + (hrMin[2] ? parseInt(hrMin[2], 10) : 0); }
    else if (minOnly) { durationMin = parseInt(minOnly[1], 10); }
  }

  // --- Night shift: look for a time with AM/PM ---
  let isNight = false;
  const timeMatch = clean.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
  if (timeMatch) {
    let hr = parseInt(timeMatch[1], 10);
    if (/pm/i.test(timeMatch[3]) && hr !== 12) hr += 12;
    if (/am/i.test(timeMatch[3]) && hr === 12) hr = 0;
    isNight = hr >= 21 || hr < 5;
  }

  // --- Platform: only claim a match against this app's known platform list.
  // Real-world apps (Uber, Ola, Zomato, etc.) aren't in that list, and
  // guessing one of the mock names would be silently wrong — so leave it
  // unset (null) rather than defaulting, and let the UI flag it clearly. ---
  const platformAliases = {
    "Uber": ["uber", "uher", "lber", "jber"],
    "Ola": ["ola", "oia", "0la"],
    "Namma Yatri": ["namma", "yatri"],
    "Rapido": ["rapido", "rapid"],
    "Swiggy": ["swiggy", "swigy"],
    "Zomato": ["zomato", "zomatoo"],
    "Zepto": ["zepto"],
    "Blinkit": ["blinkit", "blink"]
  };
  const platformMatch = PLATFORMS.find(p => {
    const aliases = platformAliases[p] || [p];
    return aliases.some(alias => new RegExp(alias, "i").test(clean.replace(/\s+/g, "")));
  });

  return {
    rawText: text,
    platform: platformMatch || null,
    platformDetected: !!platformMatch,
    fare: fare != null ? fare : "",
    distanceKm: distanceKm != null ? distanceKm : "",
    durationMin: durationMin != null ? durationMin : "",
    pickup, drop,
    isNight,
    confidence: [fare, distanceKm, durationMin].filter(v => v != null).length
  };
}

/* ================= GAUGE (signature visual element) ================= */
function FairnessGauge({ pct, size = 120 }) {
  const clamped = Math.max(0, Math.min(130, pct));
  const angle = -90 + (clamped / 130) * 180;
  const color = pct < 80 ? "var(--red)" : pct < 95 ? "var(--amber)" : "var(--green)";
  const r = size / 2 - 10;
  const cx = size / 2, cy = size / 2;
  const arcPath = (startDeg, endDeg) => {
    const toXY = d => [cx + r * Math.cos((Math.PI / 180) * d), cy + r * Math.sin((Math.PI / 180) * d)];
    const [x1, y1] = toXY(startDeg), [x2, y2] = toXY(endDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };
  return (
    <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`}>
      <path d={arcPath(180, 270)} stroke="var(--red)" strokeWidth="9" fill="none" strokeLinecap="round" opacity="0.35" />
      <path d={arcPath(270, 315)} stroke="var(--amber)" strokeWidth="9" fill="none" strokeLinecap="round" opacity="0.35" />
      <path d={arcPath(315, 360)} stroke="var(--green)" strokeWidth="9" fill="none" strokeLinecap="round" opacity="0.35" />
      <line x1={cx} y1={cy} x2={cx + (r - 14) * Math.cos((Math.PI / 180) * angle)} y2={cy + (r - 14) * Math.sin((Math.PI / 180) * angle)} stroke={color} strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="5" fill={color} />
      <text x={cx} y={cy + size * 0.24} textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--text)" fontFamily="Space Grotesk">{pct}%</text>
    </svg>
  );
}

/* ================= SHARED UI BITS ================= */
function StatCard({ label, value, sub, icon, accent }) {
  return (
    <div className="card fade-up" style={{ padding: "18px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="field-label" style={{ marginBottom: 8 }}>{label}</div>
          <div className="disp mono" style={{ fontSize: 26, fontWeight: 700 }}>{value}</div>
          {sub && <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginTop: 6 }}>{sub}</div>}
        </div>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: accent || "rgba(255,176,32,0.12)", color: accent ? "#fff" : "var(--amber)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </div>
      </div>
    </div>
  );
}
function SectionHead({ eyebrow, title, right }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
      <div>
        <div className="mono" style={{ fontSize: 11, color: "var(--amber)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 4 }}>{eyebrow}</div>
        <div className="disp" style={{ fontSize: 22, fontWeight: 600 }}>{title}</div>
      </div>
      {right}
    </div>
  );
}
function Toast({ items }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 200, display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map(t => (
        <div key={t.id} className="card fade-up" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, minWidth: 260, borderColor: t.tone === "red" ? "var(--red)" : t.tone === "green" ? "var(--green)" : "var(--line)" }}>
          <div className="tick" style={{ background: t.tone === "red" ? "var(--red)" : t.tone === "green" ? "var(--green)" : "var(--amber)" }} />
          <div style={{ fontSize: 13.5 }}>{t.msg}</div>
        </div>
      ))}
    </div>
  );
}

/* ================= LANDING PAGE ================= */
function Landing({ onEnter }) {
  const features = [
    { icon: <IconScale />, title: "Fairness checker", body: "Every job is compared against a live fair-rate benchmark for its distance and time — instantly flagged if you're underpaid." },
    { icon: <IconCamera />, title: "Screenshot scan", body: "Snap your delivery or ride app screen and let OCR pull the fare, distance and time automatically." },
    { icon: <IconChat />, title: "AI rights advisor", body: "Ask in plain language: is this fare fair, what are my rights, how do I complain — get a straight answer." },
    { icon: <IconHeart />, title: "Safety &amp; burnout watch", body: "A route-and-hours safety score, an unsafe-trip alert button, and gentle nudges before you burn out." },
    { icon: <IconUsers />, title: "Community benchmark", body: "See how your average fare stacks up against other riders on the same platforms nearby." },
    { icon: <IconTarget />, title: "Savings coach", body: "Set a goal and the assistant recalculates your daily target as your real earnings move." },
  ];
  const steps = [
    { n: "01", t: "Log every job", d: "Add manually or scan a screenshot — earnings from every platform land in one place." },
    { n: "02", t: "Get an instant fairness read", d: "Each job is scored against a fair-rate benchmark, in seconds." },
    { n: "03", t: "Act on it", d: "Draft a complaint, ask the AI advisor, or just watch your weekly trend improve." },
  ];
  return (
    <div style={{ minHeight: "100vh" }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 6vw", position: "sticky", top: 0, background: "rgba(10,13,20,0.85)", backdropFilter: "blur(10px)", zIndex: 50, borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--amber)", display: "flex", alignItems: "center", justifyContent: "center", color: "#1A1200" }}><IconShield size={19} /></div>
          <span className="disp" style={{ fontSize: 18, fontWeight: 700 }}>GigShield</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => onEnter("login")}>Log in</button>
          <button className="btn btn-primary" onClick={() => onEnter("register")}>Get started</button>
        </div>
      </nav>

      <section style={{ padding: "9vh 6vw 8vh", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "6vw", alignItems: "center" }}>
        <div className="fade-up">
          <div className="pill pill-amber" style={{ marginBottom: 20 }}><span className="tick" style={{ background: "var(--amber)" }} />Built for riders, not platforms</div>
          <h1 className="disp" style={{ fontSize: "clamp(34px,4.6vw,58px)", lineHeight: 1.06, fontWeight: 700, letterSpacing: "-0.01em" }}>
            Know if today's fare was actually <span style={{ color: "var(--amber)" }}>fair</span>.
          </h1>
          <p style={{ fontSize: 17, color: "var(--text-dim)", maxWidth: 520, marginTop: 20, lineHeight: 1.6 }}>
            GigShield checks every delivery and ride against a fair-rate benchmark, watches your hours for burnout, and gives you one tap to alert someone if a route feels unsafe — all in a companion built for the person doing the work.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
            <button className="btn btn-primary" style={{ padding: "13px 26px" }} onClick={() => onEnter("register")}>Get started <IconArrowR size={16} /></button>
            <button className="btn btn-ghost" style={{ padding: "13px 26px" }} onClick={() => onEnter("demo")}>See a live demo</button>
          </div>
          <div style={{ display: "flex", gap: 28, marginTop: 44 }}>
            {[["4", "platforms unified"], ["24/7", "AI advisor"], ["1 tap", "unsafe-trip alert"]].map(([a, b]) => (
              <div key={b}><div className="disp mono" style={{ fontSize: 22, fontWeight: 700 }}>{a}</div><div style={{ fontSize: 12.5, color: "var(--text-dim)" }}>{b}</div></div>
            ))}
          </div>
        </div>
        <div className="fade-up float" style={{ animationDelay: ".1s" }}>
          <div className="card" style={{ padding: 24, position: "relative" }}>
            <div className="corner-tag mono" style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 16 }}>Job just logged</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>UrbanRide · Riverside District</div>
                <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginTop: 4 }}>7.4km · 22 min · Night shift</div>
              </div>
              <span className="pill pill-red"><IconAlert size={12} />Underpaid</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
              <div>
                <div style={{ fontSize: 12, color: "var(--text-dim)" }}>Expected vs actual</div>
                <div className="mono" style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>₹186 <span style={{ color: "var(--text-faint)", fontWeight: 400 }}>vs</span> <span style={{ color: "var(--red)" }}>₹109</span></div>
              </div>
              <FairnessGauge pct={59} size={100} />
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "6vh 6vw" }} id="features">
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div className="mono" style={{ color: "var(--amber)", fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase" }}>What's inside</div>
          <h2 className="disp" style={{ fontSize: "clamp(26px,3vw,36px)", fontWeight: 700, marginTop: 8 }}>One companion, six jobs</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 18 }}>
          {features.map((f, i) => (
            <div className="card fade-up" key={i} style={{ padding: 24, animationDelay: (i * 0.05) + "s" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--panel-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--amber)", marginBottom: 16 }}>{f.icon}</div>
              <div className="disp" style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6 }}>{f.body}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "6vh 6vw", background: "var(--bg-soft)" }} id="how">
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div className="mono" style={{ color: "var(--amber)", fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase" }}>How it works</div>
          <h2 className="disp" style={{ fontSize: "clamp(26px,3vw,36px)", fontWeight: 700, marginTop: 8 }}>Three steps, every shift</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 24, maxWidth: 1000, margin: "0 auto" }}>
          {steps.map((s, i) => (
            <div key={i} className="fade-up" style={{ animationDelay: (i * 0.08) + "s" }}>
              <div className="mono" style={{ fontSize: 34, fontWeight: 700, color: "var(--amber-dim)" }}>{s.n}</div>
              <div className="disp" style={{ fontSize: 18, fontWeight: 600, margin: "10px 0 8px" }}>{s.t}</div>
              <div style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6 }}>{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "7vh 6vw" }} id="testimonials">
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div className="mono" style={{ color: "var(--amber)", fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase" }}>From riders</div>
          <h2 className="disp" style={{ fontSize: "clamp(26px,3vw,36px)", fontWeight: 700, marginTop: 8 }}>Trusted on the road</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 18 }}>
          {[
            ["Farhan K.", "SwiftEats rider · 2 yrs", "I found out three fares last month were paid 30% under the going rate. Never would've caught that on my own."],
            ["Priya N.", "UrbanRide driver · 4 yrs", "The burnout nudge actually got me to stop a 11-hour shift. Small thing, mattered a lot."],
            ["Daniel O.", "QuickDash rider · 1 yr", "The complaint draft saved me the awkward part — I just had to hit send."]
          ].map(([n, r, q], i) => (
            <div className="card fade-up" key={i} style={{ padding: 22, animationDelay: (i * 0.06) + "s" }}>
              <div style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--text)" }}>&ldquo;{q}&rdquo;</div>
              <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--panel-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{n[0]}</div>
                <div><div style={{ fontSize: 13, fontWeight: 600 }}>{n}</div><div style={{ fontSize: 11.5, color: "var(--text-dim)" }}>{r}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "7vh 6vw", textAlign: "center" }}>
        <h2 className="disp" style={{ fontSize: "clamp(26px,3.4vw,40px)", fontWeight: 700 }}>Your next shift deserves a fair check.</h2>
        <button className="btn btn-primary" style={{ padding: "14px 30px", marginTop: 24 }} onClick={() => onEnter("register")}>Create your free account <IconArrowR size={16} /></button>
      </section>

      <footer className="hairline" style={{ padding: "32px 6vw", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16, color: "var(--text-dim)", fontSize: 13 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><IconShield size={16} /> GigShield — a prototype built for a hackathon brief.</div>
        <div>Not affiliated with any delivery or ride-hailing platform.</div>
      </footer>
    </div>
  );
}

/* ================= AUTH ================= */
function Auth({ mode, setMode, onAuth }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "login") {
        const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
        onAuth({ name: form.name || "Rider", email: userCredential.user.email });
      } else if (mode === "register") {
        const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
        onAuth({ name: form.name || "Rider", email: userCredential.user.email });
      }
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      onAuth({ name: userCredential.user.displayName || "Rider", email: userCredential.user.email });
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="card fade-up" style={{ width: 420, padding: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, justifyContent: "center" }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--amber)", display: "flex", alignItems: "center", justifyContent: "center", color: "#1A1200" }}><IconShield size={19} /></div>
          <span className="disp" style={{ fontSize: 18, fontWeight: 700 }}>GigShield</span>
        </div>
        <div style={{ display: "flex", background: "var(--panel-2)", borderRadius: 10, padding: 4, marginBottom: 24 }}>
          {["login", "register", "forgot"].map(m => (
            <button key={m} onClick={() => setMode(m)} className="btn-sm" style={{ flex: 1, border: "none", borderRadius: 7, background: mode === m ? "var(--amber)" : "transparent", color: mode === m ? "#1A1200" : "var(--text-dim)", fontWeight: 600, padding: "8px 0" }}>
              {m === "login" ? "Log in" : m === "register" ? "Register" : "Forgot"}
            </button>
          ))}
        </div>
        <form onSubmit={submit}>
          {error && <div style={{ padding: "10px", background: "rgba(255,0,0,0.1)", color: "#ff4d4d", borderRadius: 6, marginBottom: 14, fontSize: 13 }}>{error}</div>}
          {mode === "register" && (
            <div style={{ marginBottom: 14 }}>
              <label className="field-label">Full name</label>
              <input className="field" placeholder="Asha Verma" value={form.name} onChange={set("name")} required />
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <label className="field-label">Email</label>
            <input className="field" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} required />
          </div>
          {mode !== "forgot" && (
            <div style={{ marginBottom: 14 }}>
              <label className="field-label">Password</label>
              <input className="field" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} required />
            </div>
          )}
          {mode === "register" && (
            <div style={{ marginBottom: 14 }}>
              <label className="field-label">Phone</label>
              <input className="field" placeholder="+91 90000 00000" value={form.phone} onChange={set("phone")} />
            </div>
          )}
          <button className="btn btn-primary" style={{ width: "100%", marginTop: 8, padding: "12px" }} type="submit">
            {mode === "login" ? "Log in" : mode === "register" ? "Create account" : "Send reset link"}
          </button>
        </form>

        {mode !== "forgot" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
              <div style={{ flex: 1, height: 1, background: "var(--panel-2)" }} />
              <span style={{ fontSize: 12, color: "var(--text-faint)" }}>OR</span>
              <div style={{ flex: 1, height: 1, background: "var(--panel-2)" }} />
            </div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 8,
                border: "1px solid var(--panel-2)",
                background: "var(--panel-2)",
                color: "var(--text)",
                fontWeight: 600,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                cursor: "pointer"
              }}
            >
              <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
              </svg>
              Continue with Google
            </button>
          </>
        )}

        <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 18, textAlign: "center", lineHeight: 1.6 }}>
          Secured by Firebase Authentication.
        </div>
      </div>
    </div>
  );
}

/* ================= APP SHELL ================= */
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: <IconHome size={18} /> },
  { id: "jobs", label: "Log a job", icon: <IconPlus size={18} /> },
  { id: "ocr", label: "Scan screenshot", icon: <IconCamera size={18} /> },
  { id: "fairness", label: "Fairness checker", icon: <IconScale size={18} /> },
  { id: "chat", label: "AI advisor", icon: <IconChat size={18} /> },
  { id: "earnings", label: "Earnings analytics", icon: <IconChart size={18} /> },
  { id: "insights", label: "Weekly insights", icon: <IconBulb size={18} /> },
  { id: "safety", label: "Safety score", icon: <IconHeart size={18} /> },
  { id: "burnout", label: "Burnout watch", icon: <IconBattery size={18} /> },
  { id: "savings", label: "Savings goal", icon: <IconTarget size={18} /> },
  { id: "community", label: "Community benchmark", icon: <IconUsers size={18} /> },
  { id: "complaints", label: "Complaints", icon: <IconFile size={18} /> },
  { id: "profile", label: "Profile", icon: <IconUser size={18} /> }
];

function App() {
  const [screen, setScreen] = useState("landing"); // landing | auth | app
  const [authMode, setAuthMode] = useState("login");
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [page, setPage] = useState("dashboard");
  const [jobs, setJobs] = useState([]);
  useEffect(() => {
    fetch('http://localhost:5000/api/jobs')
      .then(r => r.json())
      .then(data => setJobs(data.map(j => ({ ...j, date: new Date(j.date) }))));
  }, []);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "3 underpaid jobs flagged this week", tone: "red", time: "2h ago" },
    { id: 2, text: "Weekly report is ready", tone: "amber", time: "1d ago" },
    { id: 3, text: "Savings goal 62% complete", tone: "green", time: "2d ago" },
  ]);
  const [toasts, setToasts] = useState([]);
  const [profile, setProfile] = useState({
    name: "", phone: "", language: "English", emergencyContact: "", emergencyPhone: "",
    notifyUnderpay: true, notifyBurnout: true, notifyGoal: true
  });
  const [savingsGoal, setSavingsGoal] = useState({ target: 25000, targetDate: (() => { const d = new Date(); d.setDate(d.getDate() + 45); return d.toISOString().slice(0, 10); })() });
  const [showEmergency, setShowEmergency] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);

  const pushToast = (msg, tone = "amber") => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4200);
  };
  const pushNotification = (text, tone) => {
    setNotifications(n => [{ id: Date.now(), text, tone, time: "just now" }, ...n].slice(0, 20));
  };

  const handleAuth = (u) => {
    setUser(u);
    setProfile(p => ({ ...p, name: u.name }));
    setScreen("app");
    pushToast("Welcome to GigShield, " + u.name.split(" ")[0] + ".", "green");
  };

  const addJob = (job) => {
    setJobs(j => [job, ...j]);
    if (job.fairness.status === "underpaid") {
      pushToast("Possible underpayment flagged on that job.", "red");
      pushNotification("Underpayment flagged: " + job.platform + " · " + fmtCur(job.actual), "red");
    } else {
      pushToast("Job logged — fairness score " + job.fairness.pct + "%.", "green");
    }
  };

  if (screen === "landing") return <Landing onEnter={(m) => { setAuthMode(m === "demo" ? "login" : m); setScreen("auth"); }} />;
  if (screen === "auth") return <Auth mode={authMode} setMode={setAuthMode} onAuth={handleAuth} />;

  const ctx = { jobs, savingsGoal, profile };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar page={page} setPage={setPage} onLogout={() => setScreen("landing")} navOpen={navOpen} setNavOpen={setNavOpen} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Topbar user={user} theme={theme} setTheme={setTheme} notifications={notifications} onMenu={() => setNavOpen(v => !v)} pushToast={pushToast} />
        <main style={{ padding: "28px 32px 90px", maxWidth: 1180, margin: "0 auto" }}>
          {page === "dashboard" && <Dashboard jobs={jobs} setPage={setPage} profile={profile} />}
          {page === "jobs" && <JobLogging addJob={addJob} />}
          {page === "ocr" && <OCRUpload addJob={addJob} pushToast={pushToast} />}
          {page === "fairness" && <FairnessChecker jobs={jobs} />}
          {page === "chat" && <AIChat jobs={jobs} />}
          {page === "earnings" && <EarningsAnalytics jobs={jobs} />}
          {page === "insights" && <WeeklyInsights jobs={jobs} />}
          {page === "safety" && <SafetyModule jobs={jobs} />}
          {page === "burnout" && <BurnoutWatch jobs={jobs} />}
          {page === "savings" && <SavingsGoal jobs={jobs} savingsGoal={savingsGoal} setSavingsGoal={setSavingsGoal} />}
          {page === "community" && <CommunityBenchmark jobs={jobs} />}
          {page === "complaints" && <Complaints jobs={jobs} pushToast={pushToast} />}
          {page === "profile" && <Profile profile={profile} setProfile={setProfile} pushToast={pushToast} />}
        </main>
      </div>
      <button onClick={() => setShowEmergency(true)} title="I feel unsafe" style={{ position: "fixed", right: 28, bottom: 28, width: 60, height: 60, borderRadius: "50%", background: "var(--red)", color: "#2B0708", border: "none", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(255,92,99,0.35)", zIndex: 120 }}>
        <IconAlert size={26} />
      </button>
      {showEmergency && <EmergencyModal profile={profile} onClose={() => setShowEmergency(false)} pushToast={pushToast} />}
      <Toast items={toasts} />
    </div>
  );
}

/* ================= SIDEBAR / TOPBAR ================= */
function Sidebar({ page, setPage, onLogout, navOpen, setNavOpen }) {
  const [isHovered, setIsHovered] = useState(false);
  const sidebarWidth = isHovered ? 246 : 68;

  return (
    <>
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ width: sidebarWidth, transition: "width 0.2s ease", flexShrink: 0, borderRight: "1px solid var(--line)", background: "var(--bg-soft)", position: "sticky", top: 0, height: "100vh", overflowY: "auto", overflowX: "hidden", display: navOpen ? "block" : undefined }}
        className="scroll-fade">
        <div style={{ padding: isHovered ? "22px 20px" : "22px 17px", display: "flex", alignItems: "center", gap: 10, transition: "padding 0.2s" }}>
          <div style={{ minWidth: 32, width: 32, height: 32, borderRadius: 8, background: "var(--amber)", display: "flex", alignItems: "center", justifyContent: "center", color: "#1A1200" }}><IconShield size={18} /></div>
          <span className="disp" style={{ fontSize: 16, fontWeight: 700, opacity: isHovered ? 1 : 0, transition: "opacity 0.2s", whiteSpace: "nowrap" }}>GigShield</span>
        </div>
        <nav style={{ padding: "6px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => { setPage(n.id); setNavOpen(false); }}
              title={!isHovered ? n.label : undefined}
              style={{
                display: "flex", alignItems: "center", gap: 11, padding: "10px 11px", borderRadius: 9, border: "none",
                background: page === n.id ? "rgba(255,176,32,0.12)" : "transparent",
                color: page === n.id ? "var(--amber)" : "var(--text-dim)", fontSize: 13.5, fontWeight: 600, textAlign: "left",
                whiteSpace: "nowrap"
              }}>
              <div style={{ minWidth: 18, display: "flex", justifyContent: "center" }}>{n.icon}</div>
              <span style={{ opacity: isHovered ? 1 : 0, transition: "opacity 0.2s" }}>{n.label}</span>
            </button>
          ))}
        </nav>
        <div style={{ padding: "16px 12px", marginTop: 8 }}>
          <button className="btn btn-ghost btn-sm" style={{ width: "100%", display: "flex", alignItems: "center", gap: 11, padding: "10px 11px" }} onClick={onLogout} title={!isHovered ? "Log out" : undefined}>
            <div style={{ minWidth: 18, display: "flex", justifyContent: "center" }}><IconLogout size={15} /></div>
            <span style={{ opacity: isHovered ? 1 : 0, transition: "opacity 0.2s", whiteSpace: "nowrap" }}>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
function Topbar({ user, theme, setTheme, notifications, onMenu, pushToast }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="hairline" style={{ position: "sticky", top: 0, zIndex: 40, background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 32px" }}>
      <div style={{ fontSize: 14, color: "var(--text-dim)" }}>Signed in as <span style={{ color: "var(--text)", fontWeight: 600 }}>{user?.name}</span></div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}</button>
        <button className="btn btn-ghost btn-sm" onClick={() => setOpen(o => !o)} style={{ position: "relative" }}>
          <IconBell size={16} />
          {notifications.length > 0 && <span style={{ position: "absolute", top: 2, right: 2, width: 7, height: 7, borderRadius: "50%", background: "var(--red)" }} />}
        </button>
        {open && (
          <div className="card" style={{ position: "absolute", top: 44, right: 0, width: 300, padding: 8, maxHeight: 340, overflowY: "auto" }}>
            {notifications.map(n => (
              <div key={n.id} style={{ padding: "10px 10px", borderRadius: 8, display: "flex", gap: 9 }}>
                <span className="tick" style={{ marginTop: 5, background: n.tone === "red" ? "var(--red)" : n.tone === "green" ? "var(--green)" : "var(--amber)" }} />
                <div><div style={{ fontSize: 13 }}>{n.text}</div><div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>{n.time}</div></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= DASHBOARD ================= */
function Dashboard({ jobs, setPage, profile }) {
  const now = Date.now();
  const weekJobs = jobs.filter(j => daysSince(j.date) <= 7);
  const monthJobs = jobs.filter(j => daysSince(j.date) <= 30);
  const todayJobs = jobs.filter(j => daysSince(j.date) < 1);
  const sum = (arr, f) => arr.reduce((a, j) => a + f(j), 0);
  const totalHoursWeek = round2(sum(weekJobs, j => j.durationMin) / 60);
  const avgEarn = weekJobs.length ? round2(sum(weekJobs, j => j.actual) / weekJobs.length) : 0;

  const trend = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
      const label = d.toLocaleDateString(undefined, { weekday: "short" });
      const dayJobs = jobs.filter(j => j.date.toDateString() === d.toDateString());
      days.push({ day: label, earnings: Math.round(sum(dayJobs, j => j.actual)), expected: Math.round(sum(dayJobs, j => j.expected)) });
    }
    return days;
  }, [jobs]);

  const platformSplit = useMemo(() => {
    const m = {};
    monthJobs.forEach(j => { m[j.platform] = (m[j.platform] || 0) + j.actual; });
    return Object.entries(m).map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [monthJobs]);
  const COLORS = ["#FFB020", "#33D6A6", "#4C8DFF", "#FF5C63"];

  return (
    <div className="fade-up">
      <SectionHead eyebrow="Overview" title={"Welcome back" + (profile.name ? ", " + profile.name.split(" ")[0] : "")} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 14, marginBottom: 22 }}>
        <StatCard label="Today's earnings" value={fmtCur(sum(todayJobs, j => j.actual))} sub={todayJobs.length + " jobs"} icon={<IconTrend size={17} />} />
        <StatCard label="Weekly earnings" value={fmtCur(sum(weekJobs, j => j.actual))} sub={weekJobs.length + " jobs"} icon={<IconChart size={17} />} />
        <StatCard label="Monthly earnings" value={fmtCur(sum(monthJobs, j => j.actual))} sub={monthJobs.length + " jobs"} icon={<IconTarget size={17} />} />
        <StatCard label="Hours worked (7d)" value={totalHoursWeek + "h"} sub={round2(totalHoursWeek / 7) + "h/day avg"} icon={<IconClock size={17} />} />
        <StatCard label="Jobs (7d)" value={weekJobs.length} sub={monthJobs.length + " this month"} icon={<IconGrid size={17} />} />
        <StatCard label="Avg earning / job" value={fmtCur(avgEarn)} sub="last 7 days" icon={<IconScale size={17} />} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, marginBottom: 22 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <div className="disp" style={{ fontWeight: 600 }}>Actual vs expected, last 7 days</div>
          </div>
          <ChartBox height={230} ariaLabel="Actual versus expected earnings over the last 7 days"
            type="line"
            data={{
              labels: trend.map(t => t.day),
              datasets: [
                { label: "Expected", data: trend.map(t => t.expected), borderColor: "#8B93A6", borderDash: [4, 4], backgroundColor: "transparent", tension: .3, pointRadius: 2 },
                { label: "Earned", data: trend.map(t => t.earnings), borderColor: "#FFB020", backgroundColor: "rgba(255,176,32,0.22)", fill: true, tension: .3, pointRadius: 3 }
              ]
            }}
            options={{
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { display: false }, ticks: { color: dimColor() } },
                y: { grid: { color: gridColor() }, ticks: { color: dimColor() } }
              }
            }}
          />
          <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 11.5, color: "var(--text-dim)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "#FFB020" }} />Earned</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "#8B93A6" }} />Expected</div>
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div className="disp" style={{ fontWeight: 600, marginBottom: 14 }}>Earnings by platform (30d)</div>
          <ChartBox height={200} ariaLabel="Earnings split by platform over the last 30 days"
            type="doughnut"
            data={{ labels: platformSplit.map(e => e.name), datasets: [{ data: platformSplit.map(e => e.value), backgroundColor: COLORS, borderColor: "var(--panel)", borderWidth: 2 }] }}
            options={{ plugins: { legend: { display: false } }, cutout: "58%" }}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
            {platformSplit.map((e, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--text-dim)" }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i % COLORS.length] }} />{e.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <div className="disp" style={{ fontWeight: 600, marginBottom: 12 }}>Recent activity</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {jobs.slice(0, 6).map(j => (
              <div key={j.id} className="hairline" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0" }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{j.platform} · {j.pickup}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-dim)" }}>{fmtDateTime(j.date)} · {j.distanceKm}km</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="mono" style={{ fontSize: 13.5, fontWeight: 700 }}>{fmtCur(j.actual)}</div>
                  <span className={"pill " + (j.fairness.status === "fair" ? "pill-green" : j.fairness.status === "borderline" ? "pill-amber" : "pill-red")} style={{ marginTop: 3 }}>{j.fairness.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div className="disp" style={{ fontWeight: 600, marginBottom: 14 }}>Quick actions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button className="btn" style={{ justifyContent: "flex-start" }} onClick={() => setPage("jobs")}><IconPlus size={16} /> Log a job manually</button>
            <button className="btn" style={{ justifyContent: "flex-start" }} onClick={() => setPage("ocr")}><IconCamera size={16} /> Scan a screenshot</button>
            <button className="btn" style={{ justifyContent: "flex-start" }} onClick={() => setPage("chat")}><IconChat size={16} /> Ask the AI advisor</button>
            <button className="btn" style={{ justifyContent: "flex-start" }} onClick={() => setPage("complaints")}><IconFile size={16} /> Draft a complaint</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= JOB LOGGING ================= */
function JobLogging({ addJob }) {
  const [f, setF] = useState({ platform: PLATFORMS[0], fare: "", distance: "", timeHour: "18:00", duration: "", pickup: "", drop: "", notes: "" });
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    const distanceKm = parseFloat(f.distance) || 0;
    const durationMin = parseFloat(f.duration) || 0;
    const actual = parseFloat(f.fare) || 0;
    const isNight = parseInt(f.timeHour) >= 21 || parseInt(f.timeHour) < 5;
    const exp = expectedFare(distanceKm, durationMin, isNight);
    const job = {
      id: "job_" + Date.now(), platform: f.platform, date: new Date(), distanceKm, durationMin, isNight,
      area: f.pickup, pickup: f.pickup, drop: f.drop, expected: exp, actual, fairness: fairnessOf(actual, exp), notes: f.notes
    };
    addJob(job);
    setF({ ...f, fare: "", distance: "", duration: "", notes: "" });
  };
  return (
    <div className="fade-up">
      <SectionHead eyebrow="Log job" title="Add a job manually" />
      <form onSubmit={submit} className="card" style={{ padding: 24, maxWidth: 640 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div><label className="field-label">Platform</label>
            <select className="field" value={f.platform} onChange={set("platform")}>{PLATFORMS.map(p => <option key={p}>{p}</option>)}</select>
          </div>
          <div><label className="field-label">Fare paid (₹)</label>
            <input className="field" type="number" step="0.01" required placeholder="220" value={f.fare} onChange={set("fare")} />
          </div>
          <div><label className="field-label">Distance (km)</label>
            <input className="field" type="number" step="0.1" required placeholder="6.5" value={f.distance} onChange={set("distance")} />
          </div>
          <div><label className="field-label">Duration (minutes)</label>
            <input className="field" type="number" required placeholder="24" value={f.duration} onChange={set("duration")} />
          </div>
          <div><label className="field-label">Time</label>
            <input className="field" type="time" required value={f.timeHour} onChange={set("timeHour")} />
          </div>
          <div><label className="field-label">Pickup area</label>
            <input className="field" type="text" placeholder="e.g. Downtown Core" required value={f.pickup} onChange={set("pickup")} />
          </div>
          <div><label className="field-label">Drop area</label>
            <input className="field" type="text" placeholder="e.g. Riverside District" required value={f.drop} onChange={set("drop")} />
          </div>
          <div style={{ gridColumn: "1/-1" }}><label className="field-label">Notes (optional)</label>
            <textarea className="field" rows="2" value={f.notes} onChange={set("notes")} />
          </div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 20 }} type="submit"><IconPlus size={16} /> Save job &amp; run fairness check</button>
      </form>
    </div>
  );
}

/* ================= OCR UPLOAD ================= */
function OCRUpload({ addJob, pushToast }) {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extracted, setExtracted] = useState(null);
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [ocrError, setOcrError] = useState(null);
  const [showRaw, setShowRaw] = useState(false);

  const onFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
    setScanning(true);
    setProgress(0);
    setExtracted(null);
    setOcrError(null);
    try {
      if (!window.Tesseract) throw new Error("OCR engine failed to load (check your internet connection) — you can still fill in the fields manually below.");
      const result = await window.Tesseract.recognize(file, "eng", {
        logger: m => { if (m.status === "recognizing text" && m.progress != null) setProgress(Math.round(m.progress * 100)); }
      });
      const text = result?.data?.text || "";
      const parsed = parseOCRText(text);
      if (parsed.confidence === 0) {
        setOcrError("Couldn't confidently read fare/distance/time from this image. The text below is what OCR detected — please fill the fields in manually.");
      }
      setExtracted(parsed);
    } catch (err) {
      setOcrError(err.message || "OCR failed on this image — please fill the fields in manually.");
      setExtracted({ rawText: "", platform: PLATFORMS[0], fare: "", distanceKm: "", durationMin: "", pickup: AREAS[0], drop: AREAS[1], isNight: false, confidence: 0 });
    } finally {
      setScanning(false);
    }
  };
  const set = k => e => setExtracted({ ...extracted, [k]: e.target.value });
  const save = () => {
    const distanceKm = parseFloat(extracted.distanceKm) || 0;
    const durationMin = parseFloat(extracted.durationMin) || 0;
    const actual = parseFloat(extracted.fare) || 0;
    if (!extracted.platform) { pushToast("Please select a platform before saving.", "amber"); return; }
    const exp = expectedFare(distanceKm, durationMin, extracted.isNight);
    const job = {
      id: "job_" + Date.now(), platform: extracted.platform, date: new Date(), distanceKm, durationMin, isNight: extracted.isNight,
      area: extracted.pickup, pickup: extracted.pickup, drop: extracted.drop, expected: exp, actual, fairness: fairnessOf(actual, exp), notes: "Added via screenshot scan"
    };
    addJob(job);
    setExtracted(null); setFileName("");
    pushToast("Scanned job saved.", "green");
  };
  return (
    <div className="fade-up">
      <SectionHead eyebrow="OCR" title="Scan a delivery / ride screenshot" />
      <div className="card" style={{ padding: 24, maxWidth: 640 }}>
        <label style={{ display: "block", border: "1.5px dashed var(--line-strong)", borderRadius: 12, padding: "34px 20px", textAlign: "center", cursor: "pointer" }}>
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={onFile} />
          {previewUrl
            ? <img src={previewUrl} alt="Uploaded screenshot preview" style={{ maxHeight: 160, maxWidth: "100%", borderRadius: 8, marginBottom: 10 }} />
            : <IconCamera size={30} />}
          <div style={{ marginTop: 10, fontWeight: 600, fontSize: 14 }}>{fileName || "Click to upload a screenshot"}</div>
          <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>PNG or JPG of your delivery/ride app fare screen</div>
        </label>
        {scanning && (
          <div style={{ marginTop: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--amber)", marginBottom: 8 }}>
              <span className="tick pulse" style={{ background: "var(--amber)" }} /> Reading image with OCR… {progress}%
            </div>
            <div style={{ height: 6, borderRadius: 4, background: "var(--panel-2)" }}>
              <div style={{ height: "100%", width: progress + "%", borderRadius: 4, background: "var(--amber)", transition: "width .2s" }} />
            </div>
          </div>
        )}
        {ocrError && !scanning && (
          <div className="pill" style={{ marginTop: 18, background: "var(--red-dim)", color: "var(--red)", display: "block", padding: "10px 14px", lineHeight: 1.5 }}>
            {ocrError}
          </div>
        )}
        {extracted && (
          <div style={{ marginTop: 20 }}>
            <div className="pill pill-amber" style={{ marginBottom: 14 }}>
              {extracted.confidence >= 2 ? "OCR extraction — review before saving" : "OCR extraction incomplete — please check every field"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label className="field-label">Platform{!extracted.platformDetected && <span style={{ color: "var(--amber)", fontWeight: 400 }}> — not detected, please select</span>}</label>
                <select className="field" value={extracted.platform || ""} onChange={set("platform")}>
                  {!extracted.platform && <option value="" disabled>Select platform…</option>}
                  {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div><label className="field-label">Fare (₹)</label><input className="field" type="number" value={extracted.fare} onChange={set("fare")} placeholder="Not detected — enter manually" /></div>
              <div><label className="field-label">Distance (km)</label><input className="field" type="number" value={extracted.distanceKm} onChange={set("distanceKm")} placeholder="Not detected — enter manually" /></div>
              <div><label className="field-label">Duration (min)</label><input className="field" type="number" value={extracted.durationMin} onChange={set("durationMin")} placeholder="Not detected — enter manually" /></div>
              <div><label className="field-label">Pickup</label><input className="field" value={extracted.pickup} onChange={set("pickup")} placeholder="Not extracted — enter manually" /></div>
              <div><label className="field-label">Drop</label><input className="field" value={extracted.drop} onChange={set("drop")} placeholder="Not extracted — enter manually" /></div>
            </div>
            <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={save}><IconCheck size={16} /> Confirm &amp; save job</button>
            {extracted.rawText !== undefined && (
              <div style={{ marginTop: 14 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowRaw(s => !s)}>{showRaw ? "Hide" : "Show"} raw OCR text</button>
                {showRaw && <pre style={{ marginTop: 10, padding: 12, background: "var(--panel-2)", borderRadius: 8, fontSize: 11.5, whiteSpace: "pre-wrap", maxHeight: 180, overflow: "auto" }}>{extracted.rawText || "(no text detected in image)"}</pre>}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="card" style={{ padding: 18, maxWidth: 640, marginTop: 14, fontSize: 12.5, color: "var(--text-dim)", lineHeight: 1.6 }}>
        This runs Tesseract.js OCR directly in your browser on the image you upload — no server, no API key. It works best on clear, well-lit screenshots with readable text; low-res or heavily stylised app screens may need manual correction, which is why every field above stays editable before you save.
      </div>
    </div>
  );
}

/* ================= FAIRNESS CHECKER ================= */
function FairnessChecker({ jobs }) {
  const [filter, setFilter] = useState("all");
  const filtered = jobs.filter(j => filter === "all" ? true : j.fairness.status === filter);
  const flaggedCount = jobs.filter(j => j.fairness.status === "underpaid").length;
  return (
    <div className="fade-up">
      <SectionHead eyebrow="Fairness" title="Fairness checker" right={
        <div style={{ display: "flex", gap: 8 }}>
          {["all", "fair", "borderline", "underpaid"].map(f => (
            <button key={f} onClick={() => setFilter(f)} className="btn btn-sm" style={{ background: filter === f ? "var(--panel-2)" : "transparent", borderColor: filter === f ? "var(--amber)" : "var(--line-strong)", color: filter === f ? "var(--amber)" : "var(--text-dim)", textTransform: "capitalize" }}>{f}</button>
          ))}
        </div>
      } />
      <div className="card" style={{ padding: 20, marginBottom: 18, display: "flex", alignItems: "center", gap: 18 }}>
        <IconAlert size={22} style={{ color: "var(--red)" }} />
        <div style={{ fontSize: 14 }}>{flaggedCount} job{flaggedCount === 1 ? "" : "s"} flagged as possible underpayment out of {jobs.length} logged. Benchmark: ₹{RATE_CARD.base} base + ₹{RATE_CARD.perKm}/km + ₹{RATE_CARD.perMin}/min, +12% night bonus.</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 14 }}>
        {filtered.slice(0, 24).map(j => (
          <div key={j.id} className="card" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{j.platform}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-dim)", marginTop: 3 }}>{fmtDateTime(j.date)}{j.isNight ? " · Night" : ""}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-dim)" }}>{j.pickup} → {j.drop} · {j.distanceKm}km · {j.durationMin}min</div>
              </div>
              <FairnessGauge pct={j.fairness.pct} size={86} />
            </div>
            <div className="hairline" style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 12 }}>
              <div style={{ fontSize: 12.5, color: "var(--text-dim)" }}>Expected <span className="mono" style={{ color: "var(--text)" }}>{fmtCur(j.expected)}</span></div>
              <div style={{ fontSize: 12.5, color: "var(--text-dim)" }}>Paid <span className="mono" style={{ color: j.fairness.status === "underpaid" ? "var(--red)" : "var(--text)" }}>{fmtCur(j.actual)}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= AI CHAT ================= */
function AIChat({ jobs }) {
  const suggestions = ["Is this fare fair?", "What are my rights?", "How do I raise a complaint?", "Explain my earnings", "Should I accept this ride?", "How can I increase my income?"];
  const [messages, setMessages] = useState([{ role: "ai", text: "Hi, I'm your GigShield advisor. Ask me anything — a fare, your rights, your earnings, or anything else on your mind." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const ctx = useMemo(() => {
    const flagged = jobs.filter(j => j.fairness.status === "underpaid");
    const nightUnderpaid = flagged.filter(j => j.isNight).length;
    return {
      jobs, lastJob: jobs[0] || { platform: "—", distanceKm: 0, expected: 0, actual: 0, fairness: { pct: 0, status: "fair" } },
      avgFairness: jobs.length ? Math.round(jobs.reduce((a, j) => a + j.fairness.pct, 0) / jobs.length) : 0,
      nightShare: flagged.length ? Math.round((nightUnderpaid / flagged.length) * 100) : 0
    };
  }, [jobs]);

  const send = (text) => {
    if (!text.trim() || loading) return;
    setMessages(m => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: text, ctx })
    })
      .then(r => r.json())
      .then(data => setMessages(m => [...m, { role: "ai", text: data.response }]))
      .catch(() => setMessages(m => [...m, { role: "ai", text: "Sorry, I couldn't reach the advisor service. Please check that the backend server is running and try again." }]))
      .finally(() => setLoading(false));
  };

  return (
    <div className="fade-up">
      <SectionHead eyebrow="AI advisor" title="Ask GigShield" />
      <div className="card" style={{ padding: 0, maxWidth: 760, display: "flex", flexDirection: "column", height: 520 }}>
        <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ alignSelf: m.role === "ai" ? "flex-start" : "flex-end", maxWidth: "78%" }}>
              <div style={{
                padding: "11px 14px", borderRadius: 12, fontSize: 13.5, lineHeight: 1.55,
                background: m.role === "ai" ? "var(--panel-2)" : "var(--amber)",
                color: m.role === "ai" ? "var(--text)" : "#1A1200"
              }}>{m.text}</div>
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: "flex-start", maxWidth: "78%" }}>
              <div style={{ padding: "11px 14px", borderRadius: 12, fontSize: 13.5, background: "var(--panel-2)", color: "var(--text-dim)" }}>Thinking…</div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div style={{ padding: 14, borderTop: "1px solid var(--line)" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            {suggestions.map(s => <button key={s} onClick={() => send(s)} className="btn btn-sm btn-ghost" style={{ border: "1px solid var(--line-strong)" }}>{s}</button>)}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input className="field" placeholder="Type a question…" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send(input)} disabled={loading} />
            <button className="btn btn-primary btn-sm" onClick={() => send(input)} disabled={loading}><IconSend size={15} /></button>
          </div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 10, maxWidth: 760 }}>Powered by live AI, grounded in your logged job data — ask anything, not just the suggestions above.</div>
    </div>
  );
}

/* ================= EARNINGS ANALYTICS ================= */
function EarningsAnalytics({ jobs }) {
  const sum = (a, f) => a.reduce((s, j) => s + f(j), 0);
  const monthly = useMemo(() => {
    const weeks = [0, 0, 0, 0];
    jobs.forEach(j => { const d = daysSince(j.date); if (d < 28) { const w = Math.floor(d / 7); weeks[3 - w] += j.actual; } });
    return weeks.map((v, i) => ({ week: "Wk " + (i + 1), earnings: Math.round(v) }));
  }, [jobs]);
  const platformBar = useMemo(() => {
    const m = {};
    jobs.forEach(j => { m[j.platform] = m[j.platform] || { platform: j.platform, earnings: 0, jobs: 0 }; m[j.platform].earnings += j.actual; m[j.platform].jobs++; });
    return Object.values(m).map(x => ({ ...x, earnings: Math.round(x.earnings) }));
  }, [jobs]);
  const hourly = useMemo(() => {
    const buckets = {};
    jobs.forEach(j => { const h = j.date.getHours(); const b = Math.floor(h / 4) * 4; const key = b + "–" + (b + 4); buckets[key] = buckets[key] || { slot: key, earnings: 0, hours: 0 }; buckets[key].earnings += j.actual; buckets[key].hours += j.durationMin / 60; });
    return Object.values(buckets).map(x => ({ ...x, earnings: Math.round(x.earnings), avgHourly: x.hours ? Math.round(x.earnings / x.hours) : 0 }));
  }, [jobs]);
  const totalHours = round2(sum(jobs, j => j.durationMin) / 60);
  const avgHourly = totalHours ? Math.round(sum(jobs, j => j.actual) / totalHours) : 0;

  return (
    <div className="fade-up">
      <SectionHead eyebrow="Analytics" title="Earnings dashboard" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 14, marginBottom: 20 }}>
        <StatCard label="Total hours (4wk)" value={totalHours + "h"} icon={<IconClock size={17} />} />
        <StatCard label="Avg hourly income" value={fmtCur(avgHourly)} icon={<IconTrend size={17} />} />
        <StatCard label="Total jobs (4wk)" value={jobs.length} icon={<IconGrid size={17} />} />
        <StatCard label="Platforms used" value={new Set(jobs.map(j => j.platform)).size} icon={<IconGlobe size={17} />} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <div className="disp" style={{ fontWeight: 600, marginBottom: 14 }}>Weekly earnings trend</div>
          <ChartBox height={220} ariaLabel="Weekly earnings trend over the last four weeks"
            type="line"
            data={{ labels: monthly.map(m => m.week), datasets: [{ label: "Earnings", data: monthly.map(m => m.earnings), borderColor: "#33D6A6", backgroundColor: "rgba(51,214,166,0.18)", fill: true, tension: .3, pointRadius: 4 }] }}
            options={{ plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: dimColor() } }, y: { grid: { color: gridColor() }, ticks: { color: dimColor() } } } }}
          />
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div className="disp" style={{ fontWeight: 600, marginBottom: 14 }}>Platform-wise earnings</div>
          <ChartBox height={220} ariaLabel="Total earnings by platform"
            type="bar"
            data={{ labels: platformBar.map(p => p.platform), datasets: [{ label: "Earnings", data: platformBar.map(p => p.earnings), backgroundColor: "#FFB020", borderRadius: 6 }] }}
            options={{ plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: dimColor() } }, y: { grid: { color: gridColor() }, ticks: { color: dimColor() } } } }}
          />
        </div>
      </div>
      <div className="card" style={{ padding: 20 }}>
        <div className="disp" style={{ fontWeight: 600, marginBottom: 14 }}>Average hourly income by time slot</div>
        <ChartBox height={220} ariaLabel="Average hourly income across four-hour time slots"
          type="bar"
          data={{ labels: hourly.map(h => h.slot), datasets: [{ label: "Avg hourly income", data: hourly.map(h => h.avgHourly), backgroundColor: "#4C8DFF", borderRadius: 6 }] }}
          options={{ plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: dimColor() } }, y: { grid: { color: gridColor() }, ticks: { color: dimColor() } } } }}
        />
      </div>
    </div>
  );
}

/* ================= WEEKLY INSIGHTS ================= */
function WeeklyInsights({ jobs }) {
  const thisWeek = jobs.filter(j => daysSince(j.date) <= 7);
  const lastWeek = jobs.filter(j => daysSince(j.date) > 7 && daysSince(j.date) <= 14);
  const sum = (a, f) => a.reduce((s, j) => s + f(j), 0);
  const earnThis = sum(thisWeek, j => j.actual), earnLast = sum(lastWeek, j => j.actual);
  const pctChange = earnLast ? Math.round(((earnThis - earnLast) / earnLast) * 100) : 0;
  const flaggedThis = thisWeek.filter(j => j.fairness.status === "underpaid");
  const nightFlagged = flaggedThis.filter(j => j.isNight).length;
  const nightSharePct = flaggedThis.length ? Math.round((nightFlagged / flaggedThis.length) * 100) : 0;
  const hoursThis = round2(sum(thisWeek, j => j.durationMin) / 60);
  const bestPlatform = (() => {
    const m = {}; thisWeek.forEach(j => { m[j.platform] = (m[j.platform] || 0) + j.actual; });
    const entries = Object.entries(m).sort((a, b) => b[1] - a[1]);
    return entries[0]?.[0] || "—";
  })();

  const cards = [
    { icon: <IconTrend />, tone: pctChange >= 0 ? "green" : "red", title: (pctChange >= 0 ? "Earnings up" : "Earnings down") + " " + Math.abs(pctChange) + "% this week", body: `You earned ${fmtCur(earnThis)} vs ${fmtCur(earnLast)} last week across ${thisWeek.length} jobs.` },
    { icon: <IconAlert />, tone: "amber", title: nightSharePct + "% of underpayment happened at night", body: `${flaggedThis.length} job${flaggedThis.length === 1 ? "" : "s"} flagged this week — night shifts are where fair-rate bonuses are most often missed.` },
    { icon: <IconClock />, tone: "blue", title: hoursThis + " hours worked this week", body: hoursThis > 50 ? "That's a heavy week — check the Burnout Watch tab for a recovery suggestion." : "That's a manageable weekly load based on your recent pattern." },
    { icon: <IconTarget />, tone: "green", title: bestPlatform + " was your top earner", body: "Consider prioritising this platform's shifts next week if availability allows — its jobs cleared the fairness benchmark most consistently." },
  ];
  const toneColor = { green: "var(--green)", red: "var(--red)", amber: "var(--amber)", blue: "var(--blue)" };

  return (
    <div className="fade-up">
      <SectionHead eyebrow="AI insight" title="Weekly insight summary" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
        {cards.map((c, i) => (
          <div key={i} className="card" style={{ padding: 20, borderLeft: "3px solid " + toneColor[c.tone] }}>
            <div style={{ color: toneColor[c.tone], marginBottom: 10 }}>{c.icon}</div>
            <div className="disp" style={{ fontSize: 15.5, fontWeight: 600, marginBottom: 8 }}>{c.title}</div>
            <div style={{ fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.6 }}>{c.body}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 16 }}>Generated from your logged job data with a template-based summarizer in this demo — connect the Gemini API per the README for freeform natural-language insights.</div>
    </div>
  );
}

/* ================= SAFETY MODULE ================= */
function SafetyModule({ jobs }) {
  const week = jobs.filter(j => daysSince(j.date) <= 7);
  const nightPct = week.length ? Math.round((week.filter(j => j.isNight).length / week.length) * 100) : 0;
  const hours = round2(week.reduce((a, j) => a + j.durationMin, 0) / 60);
  const locationRisk = Math.round(30 + rng() * 30); // mock proxy score
  const riskScore = Math.min(100, Math.round(nightPct * 0.4 + Math.min(hours, 60) * 0.6 + locationRisk * 0.2));
  const level = riskScore < 40 ? "Low" : riskScore < 70 ? "Medium" : "High";
  const levelColor = level === "Low" ? "var(--green)" : level === "Medium" ? "var(--amber)" : "var(--red)";
  const areaRisk = AREAS.map(a => ({ area: a, score: Math.round(20 + rng() * 70) }));

  return (
    <div className="fade-up">
      <SectionHead eyebrow="Safety" title="Route &amp; safety score" />
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 18 }}>
        <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <FairnessGauge pct={100 - riskScore} size={160} />
          <span className="pill" style={{ background: levelColor + "22", color: levelColor, marginTop: 10 }}>{level} risk</span>
          <div style={{ fontSize: 12.5, color: "var(--text-dim)", textAlign: "center", marginTop: 14, lineHeight: 1.6 }}>
            Based on {nightPct}% night shifts, {hours}h worked this week, and area risk proxy data.
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div className="disp" style={{ fontWeight: 600, marginBottom: 14 }}>Area risk proxy (mock data)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {areaRisk.map(a => (
              <div key={a.area}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span>{a.area}</span><span className="mono" style={{ color: "var(--text-dim)" }}>{a.score}/100</span>
                </div>
                <div style={{ height: 6, borderRadius: 4, background: "var(--panel-2)" }}>
                  <div style={{ height: "100%", width: a.score + "%", borderRadius: 4, background: a.score > 70 ? "var(--red)" : a.score > 45 ? "var(--amber)" : "var(--green)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= EMERGENCY MODAL ================= */
function EmergencyModal({ profile, onClose, pushToast }) {
  const [sent, setSent] = useState(false);
  const msg = `I feel unsafe on my current shift. My last known location was near ${pick(AREAS)}. Please check in with me or call. — sent via GigShield`;
  const doSend = () => { setSent(true); pushToast("Emergency alert prepared (demo — not actually sent).", "red"); };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
      <div className="card fade-up" style={{ width: 420, padding: 26 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--red)" }}><IconAlert size={20} /><span className="disp" style={{ fontWeight: 700, fontSize: 17 }}>I feel unsafe</span></div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><IconX size={16} /></button>
        </div>
        <div className="field-label">Alert message</div>
        <div className="field" style={{ minHeight: 80, marginBottom: 14 }}>{msg}</div>
        <div className="field-label">Sharing location with</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: 14 }}>
          <IconMapPin size={16} /> {profile.emergencyContact || "No emergency contact set — add one in Profile"}
        </div>
        {!sent ? (
          <button className="btn btn-danger" style={{ width: "100%" }} onClick={doSend}><IconSend size={16} /> Send alert now</button>
        ) : (
          <div className="pill pill-green" style={{ width: "100%", justifyContent: "center", padding: "10px 0" }}><IconCheck size={14} /> Alert prepared and sent (demo)</div>
        )}
        <div style={{ fontSize: 11.5, color: "var(--text-faint)", marginTop: 12, lineHeight: 1.6 }}>In production this sends an SMS via Twilio with a live location link to the emergency contact on file.</div>
      </div>
    </div>
  );
}

/* ================= BURNOUT WATCH ================= */
function BurnoutWatch({ jobs }) {
  const week = jobs.filter(j => daysSince(j.date) <= 7).sort((a, b) => a.date - b.date);
  const totalHrs = round2(week.reduce((a, j) => a + j.durationMin, 0) / 60);
  const nightJobs = week.filter(j => j.isNight).length;
  const longestStreak = useMemo(() => {
    let maxStreak = 0, cur = 0, lastEnd = null;
    week.forEach(j => {
      if (lastEnd && (j.date - lastEnd) / 60000 < 90) { cur += j.durationMin; } else { cur = j.durationMin; }
      lastEnd = new Date(j.date.getTime() + j.durationMin * 60000);
      maxStreak = Math.max(maxStreak, cur);
    });
    return round2(maxStreak / 60);
  }, [week]);
  const burnoutRisk = totalHrs > 55 || longestStreak > 9 || nightJobs >= 5;
  const tips = [
    { icon: <IconClock />, t: "Take a break", d: "Step away for at least 20 minutes after any stretch over 4 hours." },
    { icon: <IconHeart />, t: "Hydrate", d: "Long shifts, especially at night, dehydrate faster than you'll notice." },
    { icon: <IconMoon />, t: "Sleep", d: "Aim to close out night shifts with a fixed wind-down window, not just 'whenever tired'." },
    { icon: <IconBattery />, t: "Reduce consecutive shifts", d: "Cap back-to-back shifts at 2 before taking a full day off." },
  ];
  return (
    <div className="fade-up">
      <SectionHead eyebrow="Wellbeing" title="Burnout watch" />
      <div className="card" style={{ padding: 20, marginBottom: 18, display: "flex", alignItems: "center", gap: 18, borderLeft: "3px solid " + (burnoutRisk ? "var(--red)" : "var(--green)") }}>
        {burnoutRisk ? <IconAlert size={26} style={{ color: "var(--red)" }} /> : <IconCheck size={26} style={{ color: "var(--green)" }} />}
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{burnoutRisk ? "Burnout risk detected this week" : "You're within a healthy range this week"}</div>
          <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 4 }}>{totalHrs}h worked · longest continuous stretch {longestStreak}h · {nightJobs} night jobs</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 14 }}>
        {tips.map((t, i) => (
          <div key={i} className="card" style={{ padding: 18 }}>
            <div style={{ color: "var(--amber)", marginBottom: 10 }}>{t.icon}</div>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{t.t}</div>
            <div style={{ fontSize: 12.5, color: "var(--text-dim)", lineHeight: 1.6 }}>{t.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= SAVINGS GOAL ================= */
function SavingsGoal({ jobs, savingsGoal, setSavingsGoal }) {
  const [edit, setEdit] = useState(false);
  const [target, setTarget] = useState(savingsGoal.target);
  const [date, setDate] = useState(savingsGoal.targetDate);
  const monthJobs = jobs.filter(j => daysSince(j.date) <= 30);
  const totalEarned = Math.round(monthJobs.reduce((a, j) => a + j.actual, 0));
  const saved = Math.round(totalEarned * 0.22); // assume ~22% of earnings routed to savings, illustrative
  const progressPct = Math.min(100, Math.round((saved / savingsGoal.target) * 100));
  const daysLeft = Math.max(1, Math.ceil((new Date(savingsGoal.targetDate) - new Date()) / 86400000));
  const remaining = Math.max(0, savingsGoal.target - saved);
  const dailyTarget = Math.round(remaining / daysLeft);
  const projectedDays = dailyTarget > 0 ? Math.ceil(remaining / Math.max(1, Math.round(totalEarned * 0.22 / 30))) : 0;

  const save = () => { setSavingsGoal({ target: Number(target), targetDate: date }); setEdit(false); };

  return (
    <div className="fade-up">
      <SectionHead eyebrow="Savings" title="Savings goal tracker" right={<button className="btn btn-sm" onClick={() => setEdit(e => !e)}>{edit ? "Cancel" : "Edit goal"}</button>} />
      {edit && (
        <div className="card" style={{ padding: 20, marginBottom: 16, maxWidth: 480, display: "flex", gap: 14 }}>
          <div style={{ flex: 1 }}><label className="field-label">Target amount (₹)</label><input className="field" type="number" value={target} onChange={e => setTarget(e.target.value)} /></div>
          <div style={{ flex: 1 }}><label className="field-label">Target date</label><input className="field" type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
          <button className="btn btn-primary" style={{ alignSelf: "flex-end" }} onClick={save}>Save</button>
        </div>
      )}
      <div className="card" style={{ padding: 24, maxWidth: 640 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <div className="disp mono" style={{ fontSize: 24, fontWeight: 700 }}>{fmtCur(saved)} <span style={{ color: "var(--text-faint)", fontSize: 15, fontWeight: 400 }}>/ {fmtCur(savingsGoal.target)}</span></div>
          <span className="pill pill-green">{progressPct}%</span>
        </div>
        <div style={{ height: 10, borderRadius: 6, background: "var(--panel-2)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: progressPct + "%", background: "linear-gradient(90deg, var(--amber), var(--green))" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 22 }}>
          <div><div className="field-label">Daily target</div><div className="mono" style={{ fontSize: 17, fontWeight: 700 }}>{fmtCur(dailyTarget)}</div></div>
          <div><div className="field-label">Still needed</div><div className="mono" style={{ fontSize: 17, fontWeight: 700 }}>{fmtCur(remaining)}</div></div>
          <div><div className="field-label">Target date</div><div className="mono" style={{ fontSize: 17, fontWeight: 700 }}>{new Date(savingsGoal.targetDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</div></div>
        </div>
        <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginTop: 18, lineHeight: 1.6 }}>
          At your recent earnings pace (~{fmtCur(Math.round(totalEarned * 0.22 / 30))}/day toward savings), you're on track to reach this goal in about {projectedDays} day{projectedDays === 1 ? "" : "s"}.
        </div>
      </div>
    </div>
  );
}

/* ================= COMMUNITY BENCHMARK ================= */
function CommunityBenchmark({ jobs }) {
  const communityData = useMemo(() => PLATFORMS.map(p => ({
    platform: p,
    community: round2(60 + rng() * 40),
    you: (() => { const pj = jobs.filter(j => j.platform === p); return pj.length ? round2(pj.reduce((a, j) => a + j.fairness.pct, 0) / pj.length) : 0; })()
  })), [jobs]);
  const overallYou = jobs.length ? Math.round(jobs.reduce((a, j) => a + j.fairness.pct, 0) / jobs.length) : 0;
  const percentile = Math.min(97, Math.max(5, Math.round(40 + (overallYou - 85) * 1.6)));

  return (
    <div className="fade-up">
      <SectionHead eyebrow="Community" title="Community fairness benchmark" />
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 18 }}>
        <div className="card" style={{ padding: 24, textAlign: "center" }}>
          <div className="field-label">Your fairness percentile</div>
          <div className="disp mono" style={{ fontSize: 40, fontWeight: 700, color: "var(--amber)", marginTop: 8 }}>{percentile}<span style={{ fontSize: 18 }}>th</span></div>
          <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginTop: 8, lineHeight: 1.6 }}>You score fairer-paid jobs than {percentile}% of a simulated peer group on the same platforms.</div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div className="disp" style={{ fontWeight: 600, marginBottom: 14 }}>Your average vs community average fairness score</div>
          <ChartBox height={220} ariaLabel="Your average fairness score versus community average, by platform"
            type="bar"
            data={{
              labels: communityData.map(c => c.platform),
              datasets: [
                { label: "Community avg", data: communityData.map(c => c.community), backgroundColor: "#8B93A6", borderRadius: 6 },
                { label: "You", data: communityData.map(c => c.you), backgroundColor: "#FFB020", borderRadius: 6 }
              ]
            }}
            options={{ plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: dimColor() } }, y: { grid: { color: gridColor() }, ticks: { color: dimColor() } } } }}
          />
          <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 11.5, color: "var(--text-dim)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, background: "var(--text-faint)", borderRadius: 2 }} />Community avg</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, background: "#FFB020", borderRadius: 2 }} />You</div>
          </div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 14 }}>Community figures are simulated for this demo. In production, connect an aggregation service that pools anonymised fare data across opted-in workers.</div>
    </div>
  );
}

/* ================= COMPLAINTS ================= */
function Complaints({ jobs, pushToast }) {
  const flagged = jobs.filter(j => j.fairness.status === "underpaid");
  const [selected, setSelected] = useState(flagged[0]?.id || null);
  const job = flagged.find(j => j.id === selected);
  const draft = job ? `Subject: Underpayment on ${job.platform} job dated ${fmtDateTime(job.date)}

To ${job.platform} Support,

I'm writing to flag a possible underpayment on a job completed on ${fmtDateTime(job.date)}, from ${job.pickup} to ${job.drop} (${job.distanceKm}km, ${job.durationMin} minutes).

Based on standard distance-and-time rates for this trip${job.isNight ? " including the applicable night bonus" : ""}, the expected fare was approximately ${fmtCur(job.expected)}. I was paid ${fmtCur(job.actual)}, which is ${job.fairness.pct}% of that benchmark.

Could you please review this job's payout and let me know if an adjustment is possible? Happy to share the trip ID if needed.

Thank you,
` : "";

  const copy = () => { navigator.clipboard?.writeText(draft); pushToast("Complaint copied to clipboard.", "green"); };
  const download = () => {
    const blob = new Blob([draft], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "complaint_" + (job?.id || "draft") + ".txt"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fade-up">
      <SectionHead eyebrow="Rights" title="Complaint generator" />
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 18 }}>
        <div className="card" style={{ padding: 14, maxHeight: 520, overflowY: "auto" }}>
          {flagged.length === 0 && <div style={{ fontSize: 13, color: "var(--text-dim)", padding: 10 }}>No underpaid jobs flagged right now.</div>}
          {flagged.map(j => (
            <button key={j.id} onClick={() => setSelected(j.id)} style={{
              display: "block", width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 9, border: "none", marginBottom: 4,
              background: selected === j.id ? "rgba(255,176,32,0.12)" : "transparent", color: selected === j.id ? "var(--amber)" : "var(--text)"
            }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{j.platform} · {fmtCur(j.actual)}</div>
              <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{fmtDate(j.date)} · {j.fairness.pct}%</div>
            </button>
          ))}
        </div>
        <div className="card" style={{ padding: 20 }}>
          {job ? (
            <>
              <textarea className="field mono" style={{ minHeight: 280, lineHeight: 1.6, fontSize: 13 }} value={draft} readOnly />
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <button className="btn btn-primary" onClick={copy}><IconCopy size={16} /> Copy</button>
                <button className="btn" onClick={download}><IconDownload size={16} /> Download</button>
              </div>
            </>
          ) : <div style={{ fontSize: 13, color: "var(--text-dim)" }}>Select a flagged job to generate a complaint draft.</div>}
        </div>
      </div>
    </div>
  );
}

/* ================= PROFILE ================= */
function Profile({ profile, setProfile, pushToast }) {
  const [f, setF] = useState(profile);
  const set = k => e => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const save = (e) => { e.preventDefault(); setProfile(f); pushToast("Profile updated.", "green"); };
  return (
    <div className="fade-up">
      <SectionHead eyebrow="Account" title="Profile" />
      <form onSubmit={save} className="card" style={{ padding: 24, maxWidth: 560 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--panel-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700 }}>{(f.name || "R")[0]}</div>
          <div style={{ fontSize: 13, color: "var(--text-dim)" }}>Profile photo — click avatar to change (demo)</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div><label className="field-label">Name</label><input className="field" value={f.name} onChange={set("name")} /></div>
          <div><label className="field-label">Phone</label><input className="field" value={f.phone} onChange={set("phone")} /></div>
          <div><label className="field-label">Preferred language</label>
            <select className="field" value={f.language} onChange={set("language")}>{["English", "Hindi", "Kannada", "Tamil", "Telugu", "Spanish", "French"].map(l => <option key={l}>{l}</option>)}</select>
          </div>
          <div><label className="field-label">Emergency contact name</label><input className="field" value={f.emergencyContact} onChange={set("emergencyContact")} /></div>
          <div style={{ gridColumn: "1/-1" }}><label className="field-label">Emergency contact phone</label><input className="field" value={f.emergencyPhone} onChange={set("emergencyPhone")} /></div>
        </div>
        <div className="hairline" style={{ margin: "20px 0" }} />
        <div className="field-label" style={{ marginBottom: 10 }}>Notification settings</div>
        {[["notifyUnderpay", "Underpayment alerts"], ["notifyBurnout", "Burnout warnings"], ["notifyGoal", "Savings goal milestones"]].map(([k, l]) => (
          <label key={k} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, fontSize: 13.5 }}>
            <input type="checkbox" checked={f[k]} onChange={set(k)} /> {l}
          </label>
        ))}
        <button className="btn btn-primary" style={{ marginTop: 12 }} type="submit">Save profile</button>
      </form>
    </div>
  );
}

/* ================= ADMIN PANEL ================= */
function AdminPanel({ jobs }) {
  const mockUsers = useMemo(() => {
    const names = ["Asha Verma", "Farhan Khan", "Priya Nair", "Daniel Ortiz", "Ravi Shankar", "Meena Iyer", "Sam Okafor", "Liu Wei"];
    return names.map((n, i) => ({
      name: n, platform: pick(PLATFORMS), jobsLogged: 8 + Math.floor(rng() * 40),
      avgFairness: 68 + Math.floor(rng() * 30), status: rng() > 0.85 ? "Flagged" : "Active"
    }));
  }, []);
  const totalUnderpaid = jobs.filter(j => j.fairness.status === "underpaid").length;
  const totalComplaints = Math.round(totalUnderpaid * 0.6);
  return (
    <div className="fade-up">
      <SectionHead eyebrow="Admin" title="Admin panel" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 14, marginBottom: 20 }}>
        <StatCard label="Registered users" value={mockUsers.length} icon={<IconUsers size={17} />} />
        <StatCard label="Reported underpayments" value={totalUnderpaid} icon={<IconAlert size={17} />} />
        <StatCard label="Complaints filed" value={totalComplaints} icon={<IconFile size={17} />} />
        <StatCard label="Platforms tracked" value={PLATFORMS.length} icon={<IconGlobe size={17} />} />
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr className="hairline" style={{ textAlign: "left" }}>
              {["Rider", "Primary platform", "Jobs logged", "Avg fairness", "Status"].map(h => (
                <th key={h} style={{ padding: "12px 16px", color: "var(--text-dim)", fontWeight: 600, fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".04em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((u, i) => (
              <tr key={i} className="hairline">
                <td style={{ padding: "12px 16px", fontWeight: 600 }}>{u.name}</td>
                <td style={{ padding: "12px 16px", color: "var(--text-dim)" }}>{u.platform}</td>
                <td style={{ padding: "12px 16px" }} className="mono">{u.jobsLogged}</td>
                <td style={{ padding: "12px 16px" }} className="mono">{u.avgFairness}%</td>
                <td style={{ padding: "12px 16px" }}><span className={"pill " + (u.status === "Flagged" ? "pill-red" : "pill-green")}>{u.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 14 }}>Mock roster for demo purposes — wire to Firestore's users collection for a live admin view.</div>
    </div>
  );
}



export default App;
