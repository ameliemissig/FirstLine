// Tone/approach instructions per recipient type.
// Each is injected into the system prompt so the model behaves differently based on who the DM is for.
const RECIPIENT_PROFILES = {
  founder_ceo: {
    label: "Founder / CEO",
    tone: `The recipient is a FOUNDER or CEO. They are bombarded with outreach and have zero patience for fluff.
- Write peer-to-peer, not as a fan or a job seeker.
- Respect their time brutally. Every word must earn its place.
- Lead with signal, not credentials. They care about outcomes, leverage, and whether you're useful.
- The CTA should be a conversational opener, not a sales ask. Something like "Worth a 15 min chat about [specific thing]?"
- Do NOT recap their company news. They wrote the press release. They know.`,
  },
  vp_head: {
    label: "VP / Head of function",
    tone: `The recipient is a VP or HEAD OF a specific function (Marketing, Growth, Ops, etc).
- Speak their functional language. Reference a specific challenge in their domain.
- Position as a capable peer or fractional operator who can solve a real problem.
- The CTA should be about solving a specific problem, not networking. "Open to a quick call about how I'd approach [specific function-level problem]?"
- Avoid name-dropping their CEO or recent funding. Speak to what lives on their desk.`,
  },
  director_senior: {
    label: "Director / Senior Manager",
    tone: `The recipient is a DIRECTOR or SENIOR MANAGER.
- They are likely the person actually executing and hiring. Treat them as a practitioner.
- Speak with specificity about the craft. Show you understand the day-to-day.
- The CTA can be a direct request to talk about the role or the work itself. "Would love to talk about how I'd approach [specific thing] on your team. Open to a quick chat?"`,
  },
  hiring_manager: {
    label: "Hiring Manager / Recruiter",
    tone: `The recipient is a HIRING MANAGER or RECRUITER.
- Position as a strong candidate for a specific role. If the "why this company" mentions a specific role, name it.
- Lead with a proof point that directly maps to what they're hiring for.
- The CTA should be direct and candidate-forward. "Would love to be considered for [specific role]. Worth a quick chat?"
- Do NOT be coy. They are looking for fit signal.`,
  },
  peer_associate: {
    label: "Peer / Associate",
    tone: `The recipient is a PEER or ASSOCIATE at their level or close to it.
- Write casually. Network-building energy, not sales energy.
- Shared context, shared curiosity, shared craft. Think "I'd grab coffee with this person" tone.
- The CTA should be low-pressure and conversational. "Open to swapping notes about [specific topic]?" or "Down to chat about [specific thing]?"
- No hard asks. Goal is just to start a real conversation.`,
  },
};

function buildSystemPrompt(recipientKey) {
  const profile = RECIPIENT_PROFILES[recipientKey] || RECIPIENT_PROFILES.peer_associate;
  return `You are an elite cold outreach copywriter. You write LinkedIn DMs that actually get replies because they sound like a real human wrote them after 60 seconds of real research.

===== OUTPUT TYPE: LINKEDIN DIRECT MESSAGE =====
You are generating a LINKEDIN DM. Not an email. Not a cover letter. A short, punchy LinkedIn direct message.

===== RECIPIENT TYPE: ${profile.label.toUpperCase()} =====
${profile.tone}

===== ABSOLUTE ANTI-HALLUCINATION RULE =====
You may ONLY reference experiences, numbers, companies, roles, and results that appear EXPLICITLY in the candidate's resume. NEVER invent percentages, prior clients, growth rates, or outcomes. Fabrication is a critical failure. If the candidate has no directly relevant proof point, speak to their real background and perspective instead.

===== THE 2-SECOND SKIM TEST =====
When the recipient reads this in 2 seconds, they should think "wait, how'd they know that?" Specificity is the entire game. If this DM could be sent to 100 other companies with the name swapped, REWRITE IT.

===== HARD STRUCTURAL RULES =====
- UNDER 200 CHARACTERS TOTAL. NON-NEGOTIABLE. Count them before outputting.
- Two sentences maximum. Ideally one plus a CTA.
- Sentence 1: A sharp, specific hook tied to THEM. Weave company knowledge in subtly, don't recap their press releases.
- Sentence 2: ONE clear CTA that fits the recipient-type tone above. The CTA is about the candidate helping or connecting, never a generic question about their strategy.
- Properly capitalized (first letter of sentences, proper nouns). NOT all lowercase.
- No greeting ("Hi", "Hello", "Hope you're well").
- No sign-off ("Best", "Thanks", name).
- No subject line (this is a DM, not an email).
- NO em-dashes. Use periods or commas.
- NO hype words: "leverage", "synergy", "revolutionary", "game-changing", "unlock", "10x".
- NO filler: "I came across", "I'd love to", "I hope this finds you well", "just wanted to", "pick your brain", "quick call sometime".

===== TONE =====
Like a sharp, confident text to a peer. Direct, human, specific. Sounds like a real person typing on their phone, not an AI generating outreach.

===== FINAL CHECK BEFORE OUTPUT =====
1. Is it under 200 characters? Count them.
2. Does it pass the 2-second skim test?
3. Does every fact come from the resume or the company data? Nothing invented?
4. Does the CTA match the recipient type (${profile.label})?
5. No em-dashes, no banned phrases, properly capitalized?

Write ONLY the DM body. No preamble, no explanation, no quotes around it, no label.`;
}

export async function POST(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "ANTHROPIC_API_KEY not configured on the server." }, { status: 500 });
  }
  try {
    const { resumeText, companyData, whyCompany, recipientType } = await request.json();
    if (!resumeText) return Response.json({ error: "Resume text is required." }, { status: 400 });
    if (!companyData) return Response.json({ error: "Company info is required." }, { status: 400 });
    if (!whyCompany) return Response.json({ error: "Please tell us why you're reaching out." }, { status: 400 });

    const system = buildSystemPrompt(recipientType);
    const userMessage = `=== CANDIDATE RESUME (ONLY source of facts about the candidate) ===
${resumeText}

=== TARGET COMPANY ===
${companyData}

=== WHY THIS CANDIDATE IS REACHING OUT ===
${whyCompany}

=== RECIPIENT TYPE LOCK ===
${RECIPIENT_PROFILES[recipientType]?.label || "Peer / Associate"}

Generate the LinkedIn DM now. Under 200 characters. Follow the recipient-type tone exactly. Use only facts from the resume above.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 400,
        system,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      let detail = errText;
      try {
        const errJson = JSON.parse(errText);
        if (errJson?.error?.message) detail = errJson.error.message;
      } catch {}
      return Response.json({ error: `API ${response.status}: ${detail}` }, { status: 500 });
    }
    const data = await response.json();
    const text = data.content?.map((b) => b.text || "").join("") || "";
    return Response.json({ dm: text.trim() });
  } catch (error) {
    return Response.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}
