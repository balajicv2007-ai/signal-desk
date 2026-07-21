// ⚠️ Set your Anthropic API key here before deploying.
// For a hackathon demo, set a low spend limit on this key in console.anthropic.com,
// and rotate/delete it after judging since it's visible in this file's source.
const ANTHROPIC_API_KEY = "PASTE_YOUR_API_KEY_HERE";

const SAMPLES = [
  "SHOCKING: Scientists Confirm Drinking Bleach Cures All Diseases, Government Hiding Truth From Public!!!",
  "The Reserve Bank of India kept its repo rate unchanged at 6.5% on Wednesday, citing steady inflation and the need to support economic growth, according to the RBI's monetary policy statement.",
  "Local farmers claim a new fertilizer blend doubled their crop yield this season, though agricultural officials say they have not yet reviewed the data."
];

const VERDICT_STYLES = {
  real: { label: "VERIFIED", color: "#4C7A63", rotate: "-6deg" },
  fake: { label: "FLAGGED", color: "#C1443C", rotate: "-4deg" },
  uncertain: { label: "UNVERIFIED", color: "#C99A44", rotate: "-7deg" }
};

document.getElementById("dateline").textContent = new Date().toLocaleDateString("en-US", {
  weekday: "long", year: "numeric", month: "long", day: "numeric"
}).toUpperCase();

const textarea = document.getElementById("article-input");
const charcount = document.getElementById("charcount");
const runBtn = document.getElementById("runBtn");
const errorBox = document.getElementById("errorBox");
const resultCard = document.getElementById("resultCard");

textarea.addEventListener("input", () => {
  charcount.textContent = textarea.value.length + " / 4000 characters";
  runBtn.disabled = !textarea.value.trim();
});

document.querySelectorAll(".sample-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    textarea.value = SAMPLES[btn.dataset.sample];
    textarea.dispatchEvent(new Event("input"));
  });
});

runBtn.addEventListener("click", analyze);

const systemPrompt = `You are a fake-news / misinformation triage assistant for a hackathon demo. Analyze the headline or article text a user submits.

Respond with ONLY valid JSON, no markdown fences, no preamble, matching exactly this shape:
{
  "verdict": "real" | "fake" | "uncertain",
  "confidence": <integer 0-100>,
  "summary": "<1-2 sentence plain-language summary of your assessment>",
  "signals": [
    {"label": "<short signal name, 2-4 words>", "detected": <true|false>, "note": "<one short sentence explaining this specific signal for this text>"}
  ]
}

Include exactly 5 signals, chosen from things like: sensational or emotionally charged language, unverifiable or absent sources, extraordinary claims without evidence, clickbait framing, internal inconsistency, presence of specific verifiable facts (named sources, dates, figures), neutral/measured tone, alignment with known reliable reporting patterns. "detected": true means the signal is a red flag present in the text; false means that concern is NOT present (i.e. text passes on that signal). Keep notes concrete and specific to the submitted text, not generic.`;

async function analyze() {
  const text = textarea.value.trim();
  if (!text) return;

  runBtn.disabled = true;
  runBtn.textContent = "TRANSMITTING…";
  errorBox.style.display = "none";
  resultCard.style.display = "none";

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: text.slice(0, 4000) }]
      })
    });
    const data = await response.json();
    const raw = (data.content || []).map(b => b.type === "text" ? b.text : "").join("").trim();
    const clean = raw.replace(/^```json\s*|```$/g, "").trim();
    const parsed = JSON.parse(clean);
    renderResult(parsed);
  } catch (e) {
    errorBox.textContent = "The wire dropped the signal. Check your API key, or try again.";
    errorBox.style.display = "block";
  } finally {
    runBtn.disabled = !textarea.value.trim();
    runBtn.textContent = "RUN ANALYSIS";
  }
}

function renderResult(result) {
  const s = VERDICT_STYLES[result.verdict] || VERDICT_STYLES.uncertain;
  const stamp = document.getElementById("stamp");
  stamp.textContent = s.label;
  stamp.style.border = `4px solid ${s.color}`;
  stamp.style.color = s.color;
  stamp.style.transform = `rotate(${s.rotate})`;

  document.getElementById("confValue").textContent = result.confidence + "%";
  document.getElementById("summaryText").textContent = result.summary;

  const list = document.getElementById("signalsList");
  list.innerHTML = "";
  (result.signals || []).forEach(sig => {
    const row = document.createElement("div");
    row.className = "signal-row";
    row.innerHTML = `
      <div class="dot" style="background:${sig.detected ? '#C1443C' : '#4C7A63'}"></div>
      <div>
        <div class="signal-label">${sig.label}</div>
        <div class="signal-note">${sig.note}</div>
      </div>
    `;
    list.appendChild(row);
  });

  resultCard.style.display = "block";
  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
}
