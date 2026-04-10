# First Line

**A cold DM generator that sounds like a real human wrote it.**

Drop your resume. Pick a company. Tell it who you're messaging. Get a LinkedIn DM under 200 characters, personalized to both you and them, in about 10 seconds.

→ **Live demo:** [firstline.vercel.app](https://firstline.vercel.app) _(update with your URL)_

---

## Why I built this

Cold outreach on LinkedIn has two problems. Either people don't do it at all because staring at a blank message box is paralyzing, or they do it and the result is so generic the recipient deletes it in two seconds.

The people who actually land clients, jobs, and intros are the ones willing to spend 60 seconds researching a company before sending. Almost nobody does. So I built a tool that makes the work effortless: drop your resume, paste a company, hit generate. The research and the personalization happen automatically.

The goal isn't to replace writing. It's to get you to an 80% draft instantly so you can personalize the last 20% and actually send it.

## What makes it different from "ask ChatGPT"

Three things:

1. **It does the research you wouldn't.** The app scrapes the target company's website server-side and feeds the content into the prompt. You never have to copy-paste anything.
2. **Recipient-type tone locking.** A cold DM to a CEO should sound completely different from a cold DM to a recruiter. Five recipient profiles, each with its own tone and CTA style baked into the prompt.
3. **Hardcoded anti-hallucination.** The biggest failure mode of AI outreach tools is making up credentials. The prompts have an explicit rule: use only facts from the actual resume, never invent numbers or prior clients.

## How it works

```
Resume upload → PDF.js parses client-side (no server upload)
    ↓
Company URL → server-side scrape extracts site text
    ↓
Recipient type + why-this-company → prompt personalization
    ↓
Claude Sonnet 4.6 → generates a DM under 200 chars
    ↓
Copy to clipboard, generate another, start over
```

## Tech

- **Frontend:** Next.js 14 (App Router), React, single-page stateless UI
- **AI:** Claude Sonnet 4.6 via the Anthropic Messages API
- **PDF parsing:** pdfjs-dist (client-side, no upload required)
- **Scraping:** server-side fetch in a Next.js API route
- **Hosting:** Vercel (free tier)
- **Persistence:** none by design. Stateless, no accounts, no cookies, no analytics beyond Vercel's defaults

## Run it locally

```bash
git clone https://github.com/ameliemissig/firstline.git
cd firstline
npm install
cp .env.local.example .env.local
# Add your Anthropic API key to .env.local
npm run dev
```

You'll need an API key from [console.anthropic.com](https://console.anthropic.com). A few dollars of credits goes a long way, each generation costs about a penny.

## What's intentionally missing

This is a proof of concept, not a product. I built it lean on purpose:

- No accounts, no saved history, no user tracking
- No rate limiting (yet)
- One output type only (LinkedIn DMs). No cold emails, no cover letters, no interview prep
- No DOCX support (PDF + paste covers 99% of resumes)
- No voice input

If this gets traction, some of those come back. For now, the goal was to prove the concept works well enough to share.

## Feedback welcome

This is a first draft. If you try it and it writes something that sounds off, tells a lie about your background, or just misses the mark, I'd love to hear about it. DM me on LinkedIn.

---

Built by Amelie Missig. Made in Los Angeles.
