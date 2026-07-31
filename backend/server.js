const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

/* ================= MOCK DATA ENGINE ================= */
const PLATFORMS = ["Uber","Ola","Namma Yatri","Rapido","Swiggy","Zomato","Zepto","Blinkit"];
const AREAS = ["Downtown Core","Riverside District","North Terminal","Old Market","Tech Park","Harbor Row"];
const rng = (seed => () => { seed = (seed*9301+49297)%233280; return seed/233280; })(42);
function pick(arr){ return arr[Math.floor(rng()*arr.length)]; }
function round2(n){ return Math.round(n*100)/100; }

const RATE_CARD = { base:45, perKm:12, perMin:2.2, nightBonusPct:0.12 };

function expectedFare(distanceKm, durationMin, isNight){
  let e = RATE_CARD.base + distanceKm*RATE_CARD.perKm + durationMin*RATE_CARD.perMin;
  if(isNight) e *= (1+RATE_CARD.nightBonusPct);
  return round2(e);
}

function fairnessOf(actual, expected){
  const pct = Math.round((actual/expected)*100);
  let status = "fair";
  if(pct < 80) status = "underpaid";
  else if(pct < 95) status = "borderline";
  return {pct, status};
}

function genMockJobs(n=42){
  const jobs = [];
  const now = new Date();
  for(let i=0;i<n;i++){
    const daysAgo = Math.floor(rng()*28);
    const hour = Math.floor(rng()*24);
    const d = new Date(now); d.setDate(d.getDate()-daysAgo); d.setHours(hour, Math.floor(rng()*60),0,0);
    const isNight = hour>=21 || hour<5;
    const distanceKm = round2(2 + rng()*13);
    const durationMin = Math.round(distanceKm*3.1 + rng()*10);
    const exp = expectedFare(distanceKm, durationMin, isNight);
    const underpayChance = rng();
    let actual;
    if(underpayChance < 0.22) actual = round2(exp*(0.55+rng()*0.24));
    else if(underpayChance < 0.4) actual = round2(exp*(0.82+rng()*0.12));
    else actual = round2(exp*(0.96+rng()*0.22));
    const platform = pick(PLATFORMS);
    const fairness = fairnessOf(actual, exp);
    jobs.push({
      id: "job_"+i+"_"+Math.floor(rng()*99999),
      platform, date:d, distanceKm, durationMin, isNight,
      area: pick(AREAS), pickup: pick(AREAS), drop: pick(AREAS),
      expected: exp, actual, fairness, notes:""
    });
  }
  return jobs.sort((a,b)=>b.date-a.date);
}

let MOCK_JOBS = genMockJobs(42);

function fmtCur(n){ return "₹" + Math.round(n).toLocaleString("en-IN"); }

/* ============== RULE-BASED FALLBACK (used only if no API key is set, or the API call fails) ============== */
function ruleBasedChat(question, ctx){
  const q = question.toLowerCase();
  const flagged = ctx.jobs.filter(j=>j.fairness.status==="underpaid").length;
  if(q.includes("fair") && (q.includes("this") || q.includes("fare"))){
    return `Looking at your most recent job on ${ctx.lastJob.platform}: expected fare for ${ctx.lastJob.distanceKm}km was ${fmtCur(ctx.lastJob.expected)}, you were paid ${fmtCur(ctx.lastJob.actual)} — that's ${ctx.lastJob.fairness.pct}% of the fair-rate benchmark. ${ctx.lastJob.fairness.status==="underpaid" ? "That falls below a fair threshold — you may want to raise a complaint." : "That's within a fair range."}`;
  }
  if(q.includes("right")){
    return "As a gig worker you generally have the right to: see the fare breakdown before accepting a job, dispute a payout you believe is incorrect within the platform's stated window, work without discrimination, and access any accident/injury cover the platform provides. Rights vary by platform and region — I can help you draft a complaint if something looks off.";
  }
  if(q.includes("complaint") || q.includes("raise")){
    return `You currently have ${flagged} flagged underpayment${flagged===1?"":"s"}. Open the Complaints tab and I'll auto-draft a message with the job details filled in — you can edit it before sending it to the platform's support channel.`;
  }
  if(q.includes("explain") && q.includes("earn")){
    return `Over the period shown, your average fairness score is ${ctx.avgFairness}%. ${ctx.nightShare}% of your underpaid jobs happened during night shifts, which is usually where fair-rate calculations get missed by platforms because night bonuses aren't applied consistently.`;
  }
  if(q.includes("accept")){
    return "As a rule of thumb: if the offered fare is under 80% of what distance + time would normally pay (check the Fairness tab), it's usually not worth accepting unless you need the trip to reposition. I can't see live incoming offers in this demo, but you can paste the fare and distance into Job Logging to check instantly.";
  }
  if(q.includes("increase") || q.includes("income") || q.includes("more money")){
    return "Three patterns from your data: 1) your highest fairness scores cluster on UrbanRide evening shifts — prioritise those when available, 2) you have unclaimed potential during weekend afternoons where community benchmark fares run higher, 3) reducing very long shifts (9+ hrs) slightly raises your effective hourly rate by cutting late-shift underpayment risk.";
  }
  return "I can help with fairness checks, your rights, drafting complaints, explaining your earnings, whether to accept a fare, or how to earn more. Try asking one of those, or open the relevant tab and ask about what you see there. (Note: live AI is currently unavailable — set GROQ_API_KEY to enable open-ended answers.)";
}

/* ============== REAL AI LAYER (Groq — OpenAI-compatible endpoint) ============== */
async function callAIChat(question, ctx){
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn("GROQ_API_KEY not set — falling back to rule-based responses.");
    return ruleBasedChat(question, ctx);
  }

  const systemPrompt = `You are "GigShield Advisor", a helpful, concise AI assistant inside the GigShield app for gig workers (delivery/rideshare drivers). \
You can answer ANY question the worker asks — not just fixed topics — including general questions about gig work, labor rights, budgeting, negotiating, wellbeing, or anything unrelated. \
When relevant, ground your answer in this worker's real logged job data (JSON): ${JSON.stringify(ctx)}. \
Keep answers practical and warm, ideally under 120 words unless the question needs more detail.`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error("Groq API error:", data.error || data);
      return ruleBasedChat(question, ctx);
    }

    const text = data.choices?.[0]?.message?.content?.trim();

    return text || ruleBasedChat(question, ctx);
  } catch (err) {
    console.error("AI chat request failed:", err);
    return ruleBasedChat(question, ctx);
  }
}

// Routes
app.get('/api/jobs', (req, res) => {
  res.json(MOCK_JOBS);
});

app.post('/api/jobs', (req, res) => {
  const newJob = req.body;
  MOCK_JOBS.unshift(newJob);
  res.json({ message: "Job added successfully", job: newJob });
});

app.post('/api/chat', async (req, res) => {
  const { question, ctx } = req.body;
  // Overwrite jobs with server side jobs for context
  ctx.jobs = MOCK_JOBS; 
  ctx.lastJob = MOCK_JOBS[0];
  const response = await callAIChat(question, ctx);
  res.json({ response });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});