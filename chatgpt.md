# eehu! — Full Project Brief for ChatGPT

## What you are helping with

I am building a SaaS product called **eehu!**. The positioning is:

> **eehu! — Your Website's 24/7 Enquiry and Lead Assistant.**
> Your website should not just display information. It should help interested visitors take the next step.
> eehu! helps businesses answer common customer questions, capture interested prospects, and send qualified enquiries to their sales team through WhatsApp.

The target customer is a non-technical small business owner who has a website but loses potential customers because nobody answers their questions in real time — and because enquiries that do come in are unstructured, easy to miss, and hard to follow up on.

I need you to help me think through this product across multiple dimensions: product-market fit, competitive positioning, pricing strategy, feature roadmap, and go-to-market. Below is everything currently built and everything that could be built.

---

## The product in plain English

A business owner signs up for eehu!. We build a branded chat widget and drop it into their existing website — WordPress, Wix, Squarespace, custom HTML, anything. Visitors can type questions any time. Gemini AI answers them instantly based on a trained context about the business. When a visitor is ready to buy or needs a human, they go through a lead capture form (name, contact, what they need), and a qualified pre-filled message is sent to the business owner's WhatsApp. Every conversation is saved and visible in an admin dashboard.

The business owner does not write code. They do not rebuild their site. They do not hire a developer. They just talk to more qualified customers.

---

## Critical insight on target market — be disciplined about this

The original target market was too broad: salons, schools, logistics companies, local retailers.

A salon with 10 website visitors per month does not have the same problem as a private school receiving 200 admissions enquiries. The chatbot only creates value when enough relevant visitors interact with the website.

**The right first customers have all three of these:**
1. An existing website with meaningful traffic (100+ visitors per month minimum)
2. A high-enquiry product or service (people naturally have questions before buying)
3. A business owner or team who responds when a lead arrives on WhatsApp

**The strongest entry verticals in Nigeria right now:**
- Private schools and universities during admissions season — high volume, repetitive questions, anxious parents, predictable timing, clear ROI story
- Private hospitals and clinics — people research before booking, reluctant to call, want to ask quietly
- Real estate agents and developers — every listing generates price, location, availability questions
- Event centres and wedding halls — pricing, capacity, availability queries are constant
- Travel and visa consultants — high-anxiety customers who ask detailed questions before committing

**The first sales campaign should pick one vertical, not five.**
Private schools during admissions season is the strongest entry point: acute pain, predictable timing, accessible decision maker, clear before-and-after story.

---

## Current features (already built and working)

### Landing page
- Dark canvas with emerald dot-grid background pattern
- Sticky nav with frosted glass blur on scroll
- Full-screen immersive mobile navigation menu with editorial layout
- Hero section: headline, subheadline, two CTAs
- Animated hero mock: slides in from right, floats continuously, auto-plays a simulated chat conversation
- Staggered fade-up animations on hero text elements
- Three asymmetric feature cards (different widths, heights, padding, vertical offsets)
- Benefits section with four asymmetric cards and custom SVG blob icons
- Dark-themed CTA section
- All copy written in plain human language for non-tech business owners
- No AI-generic patterns (no three-column checkmark rows, no pill badges, no Lucide icons as section decoration)

### Typography and branding
- Baloo 2 for the eehu! wordmark (warm, rounded, distinctive)
- Nunito for body and UI
- Emerald green brand palette
- eehu! logo served locally (no external CDN dependency)

### Chat widget
- Floating chat button with pulse animation, positioned bottom-right
- Full panel on desktop (420px wide, 660px tall). Fullscreen on mobile.
- Mobile: chat opens fullscreen and hides the nav to prevent overlap
- Chat header: eehu! wordmark in Baloo 2, online indicator, three-dot menu
- Three-dot menu: Start a new chat, Copy chat link
- Message bubbles: user (emerald), agent (light grey), timestamps, read receipts
- Typing indicator with three bouncing dots
- Quick reply chips: 6 pre-written questions, removed individually as used
- Sound toggle in the header (send and receive sounds)
- Message input: auto-resize textarea, send button
- Powered by eehu! footer watermark in Baloo 2 green

### Lead capture and escalation flow
- When visitor asks for a human, Gemini detects it and triggers a lead qualification step
- Lead form collects: visitor name, WhatsApp number or email, what they need help with
- Lead details are saved to Supabase before WhatsApp is opened
- A pre-filled WhatsApp message is generated with all lead details
- WhatsApp button opens directly to the business owner's number
- Three-step escalation state machine: none, form, whatsapp

### AI backend
- Next.js API route at /api/chat (server-side only, key never exposed to browser)
- Gemini AI using new AQ. auth key format (x-goog-api-key header, not ?key= query param)
- Model fallback chain: gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-flash, gemini-1.5-flash-8b
- Working model cached in memory to skip fallback on subsequent requests
- Thought token filtering (strips reasoning tokens from gemini-2.5-flash)
- Full conversation history passed on every request
- Strict topic scoping: only answers questions about eehu! and its service
- Human escalation detection triggers the lead capture flow
- Session ID generated per browser tab (crypto.randomUUID)
- Supabase writes are non-blocking (never slow the AI response)

### Database (Supabase)
- Tables: conversations, messages, leads
- Row Level Security on all tables
- Anon key: insert only
- Service role key: read access for admin only
- Schema in supabase/schema.sql

### Admin dashboard (/admin)
- Password-protected login
- Stats: total sessions, total messages, visitor messages, WhatsApp escalations, leads captured
- Expandable conversation list with full chat thread view
- WhatsApp escalation badge
- Lead details visible per conversation
- Refresh button

---

## What is NOT built yet (potential roadmap)

### Core product gaps (blockers to first client)
- No client onboarding flow — eehu! is a demo of itself, not a deployable product for other businesses
- No white-label configuration — no way for a client to provide their business name, FAQs, products, tone of voice
- No per-client Gemini system prompt
- No embed snippet generator — clients need a copy-paste script tag
- No multi-tenant architecture

### Authentication
- Admin uses a shared password, not proper auth
- No client-facing login or portal
- No role separation between eehu! admin and client

### Conversation management
- No reply to visitor from dashboard
- No email or SMS notification when a new lead arrives
- No conversation status (open, closed, resolved)
- No search or tagging

### Analytics
- No question frequency analysis
- No conversion tracking
- No weekly summary for clients

### Integrations
- No CRM (HubSpot, Zoho)
- No email transcript after each conversation
- No WhatsApp Business API for two-way chat in dashboard
- No Zapier/Make webhooks

### Monetisation
- No pricing page
- No billing (Stripe or Paystack)
- No free trial or onboarding wizard

---

## Business context

- Positioning: done-for-you live enquiry and lead assistant for business websites
- Target market: high-enquiry SMBs in Nigeria and West Africa with existing websites and real traffic
- Primary pain: visitors leave without converting because nobody answers in real time
- Secondary pain: enquiries that do come in are unstructured and get lost
- Core differentiator: eehu! captures, qualifies, and routes leads — not just answers questions
- Revenue model: setup fee plus monthly retainer per client
- Current stage: working demo and landing page. No paying clients yet.
- Stack: Next.js 16, Tailwind CSS 4, Supabase, Gemini AI, Vercel
- Developer: solo, based in Nigeria

---

## What I need from you

Please work through each of these in order. Be direct and challenge weak assumptions.

1. **Product-market fit analysis** — does this solve a real, urgent, recurring problem for the target verticals in Nigeria? What does the customer actually lose without it? What are the strongest signals for and against PMF?

2. **Competitive landscape** — Tidio, Intercom, Crisp, Tawk.to, WhatsApp Business, local alternatives. How does eehu! differentiate? Is the done-for-you + lead qualification angle strong enough? What would make a school admissions officer choose eehu! over just using WhatsApp Business directly?

3. **Feature prioritisation** — given what is already built, which missing features are actual blockers to deploying for a first paying client? What is the true MVP for a private school admissions use case?

4. **Pricing strategy** — what is a defensible pricing model for the Nigerian SMB market? What framing makes the price feel obvious rather than expensive? Setup fee vs monthly vs per-lead?

5. **Go-to-market** — how to find the first 10 clients in private schools and clinics? What outreach approach works for non-tech decision makers in Nigeria? What proof points close the deal?

6. **Stress test** — argue against this business. Where does the model break? What assumptions are unverified and dangerous? What is the hardest objection and the honest answer to it?

7. **90-day roadmap** — solo developer, limited budget, Nigerian SMB market. What gets built, what gets skipped, what gets sold before it is finished?


### Landing page
- Dark canvas with emerald dot-grid background pattern
- Sticky nav that picks up a frosted glass blur on scroll
- Hero section: headline, subheadline, CTAs
- Animated hero mock (slides in, floats, auto-plays a simulated conversation with message-pop animations)
- Staggered hero text fade-up animations on load
- Three asymmetric feature cards with vertical offsets (different sizes, padding, heights)
- Benefits section with four asymmetric cards and custom SVG blob icons (numbered 01-04)
- Dark-themed CTA section
- All copy written in plain human language for non-tech business owners
- No AI-generic patterns (no checkmark rows, no pill badges, no generic icons)

### Typography and branding
- Baloo 2 font for the eehu! wordmark (warm, rounded, distinctive)
- Nunito for body and UI (rounded, friendly, readable)
- Emerald green brand palette throughout
- eehu! logo served locally (no external CDN dependency)

### Chat widget
- Floating chat button (bottom-right, with pulse animation)
- Opens as a full panel (420px wide, 660px tall on desktop; fullscreen on mobile)
- Chat header: eehu! wordmark in Baloo 2, online status indicator
- Message bubbles: user (emerald), agent (light grey), timestamps, read receipts
- Typing indicator with three bouncing dots
- Quick reply chips: 6 pre-written questions that disappear after first use
- Message input with auto-resize textarea and send button
- Powered by eehu! footer watermark in Baloo 2 green
- Three-dot menu: Start a new chat, Copy chat link
- On mobile: chat opens fullscreen and hides the nav bar to prevent visual overlap
- Chat state lifted to page level so nav and widget coordinate correctly

### AI backend
- Next.js API route at /api/chat (server-side only, key never exposed to browser)
- Gemini AI integration using the new AQ. auth key format (x-goog-api-key header)
- Model fallback chain: gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-flash, gemini-1.5-flash-8b
- Cached working model in memory to skip fallback on subsequent requests
- Thought token filtering (strips internal reasoning tokens from gemini-2.5-flash output)
- Full conversation history passed on every request (Gemini has context across the whole thread)
- Strict topic scoping: Gemini only answers questions about eehu! and its service
- Off-topic questions are politely declined and redirected
- Human escalation detection: if visitor asks for a real person, system triggers WhatsApp redirect
- WhatsApp button appears in chat with pre-filled message to the business WhatsApp number
- Session ID generated per browser tab (crypto.randomUUID)
- Supabase writes are non-blocking (fire and forget) so they never slow the AI response

### Database (Supabase)
- Two tables: conversations (session_id, created_at) and messages (session_id, role, text, created_at)
- Row Level Security enabled on both tables
- Anon key: insert only (chat widget saves messages without exposing read access)
- Service role key: read access for admin dashboard only
- Lazy Supabase client instantiation (build-safe without env vars present)
- Schema stored in supabase/schema.sql for reproducibility

### Admin dashboard (/admin)
- Password-protected login screen (ADMIN_SECRET env var)
- Stats row: total sessions, total messages, visitor messages, WhatsApp escalation count
- Expandable conversation list with session ID, timestamp, message count
- WhatsApp escalation badge on conversations where visitor requested a human
- Full chat thread view inside each card (user and agent bubbles)
- Refresh button to pull latest data
- Built with Supabase service role key (never exposes data to the browser)

---

## What is NOT built yet (potential roadmap)

### Core product gaps (most urgent)
- No client onboarding flow — eehu! is currently a demo of itself, not a deployable product for other businesses
- No white-label configuration — no way for a client to input their business name, FAQs, products, tone of voice
- No snippet/embed generator — clients need a copy-paste script tag to add the widget to their own site
- No per-client Gemini system prompt — every deployment uses the same eehu! context
- No multi-tenant architecture — all conversations go into one Supabase project

### Authentication and access control
- Admin dashboard uses a shared secret, not proper auth
- No client-facing login — business owners cannot log in to see their own conversations
- No role separation between eehu! admin and individual business client accounts

### Conversation and lead management
- No way to reply to a visitor from the dashboard
- No email or SMS notification when a new conversation starts
- No lead capture form inside the chat (name, phone, email before or during chat)
- No conversation status tracking (open, closed, escalated, resolved)
- No tagging or keyword search across conversations

### Analytics
- No question frequency analysis (what do visitors ask most)
- No conversion tracking (did the chat lead to a WhatsApp call or purchase)
- No drop-off detection (where do visitors stop responding)
- No weekly summary report for business owners

### Integrations
- No CRM integration (HubSpot, Zoho, Salesforce)
- No email integration (transcript to business owner after each conversation)
- No WhatsApp Business API for two-way chat inside the dashboard
- No Google Analytics or Meta Pixel event tracking
- No Zapier/Make webhook for sending leads to other tools

### Product and monetisation
- No pricing page
- No subscription or billing (Stripe or Paystack)
- No free trial or onboarding wizard for new clients
- No client portal

---

## Business context

- Target market: small and medium businesses in Nigeria and West Africa with existing websites but no live customer support
- Primary pain: website visitors leave without converting because nobody answers their questions in real time
- Secondary pain: business owners miss leads that came in overnight or over weekends
- Core differentiator: eehu! is a done-for-you service, not a DIY tool. The business owner does not configure anything.
- Revenue model: monthly retainer per client (setup fee + recurring monthly subscription)
- Current stage: working demo and landing page. No paying clients yet.
- Infrastructure: Next.js 16, Tailwind CSS 4, Supabase (PostgreSQL), Gemini AI (Google), Vercel
- Developer: solo, based in Nigeria

---

## What I need from you

Please work through each of these in order. Be direct, be specific, and challenge my assumptions where they are weak.

1. **Product-market fit analysis** — does this solve a real, urgent, and recurring problem for small business owners in West Africa? What are the strongest signals for and against PMF? What does the customer actually lose if this does not exist?

2. **Competitive landscape** — who are the real competitors (Tidio, Intercom, Crisp, Tawk.to, WhatsApp Business, local alternatives) and how does eehu! differentiate? Is the done-for-you angle strong enough? What would make a business owner choose eehu! over just using WhatsApp Business directly?

3. **Feature prioritisation** — given what is already built, which missing features are blockers to the first paying client? What is the true MVP for deploying eehu! for a real business?

4. **Pricing strategy** — what is a defensible pricing model for the Nigerian SMB market? What do comparable services charge globally and locally? What can the market actually bear, and what framing makes the price feel obvious rather than expensive?

5. **Go-to-market** — how should eehu! find its first 10 clients? What industries are lowest friction? What channels, what proof points, what outreach approach works for non-tech business owners in Nigeria?

6. **Stress test** — argue against this business. Where does the model break? What assumptions are unverified and dangerous? What would cause this to fail in 12 months? What is the hardest objection a potential client would raise and how should it be answered?

7. **90-day roadmap** — given a solo developer, limited budget, and a Nigerian SMB market, what is the realistic 90-day plan from working demo to first paying client? What gets built, what gets skipped, and what gets sold before it is finished?
