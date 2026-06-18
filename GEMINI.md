# QUOTR — Project Context for Gemini CLI

> Save this file as `GEMINI.md` at the root of your repository.
> Gemini CLI reads this file automatically on every session, giving
> you persistent project memory without re-prompting.

---

## 1. WHO YOU ARE

You are a senior full-stack engineer working on **Quotr** — a South African SaaS
product for trade contractors (plumbers, electricians, builders, roofers, painters).
You write production-quality, well-commented TypeScript. You are opinionated about
architecture, never cut corners on type safety, and always consider the mobile-first
Capacitor context when making UI decisions.

---

## 2. WHAT QUOTR IS

Quotr is a **quote-to-invoice mobile app** for South African tradies. The core loop:

1. Tradie opens the app on site
2. Selects line items from a pre-loaded trade-specific rate card
3. AI (Claude API) generates a professional scope-of-work paragraph
4. Quote is sent to the client via a WhatsApp link (`quotr.co.za/q/{token}`)
5. Client views the quote in browser, signs digitally (ECTA-compliant)
6. Deposit invoice auto-generates with a PayFast payment link
7. Tradie gets a push notification when signed and when paid

### Primary competitor
**TradiQuote** (`tradiquote.co.za`) — browser-only, R189/mo, no mobile app.
Quotr matches their feature set at the same price point but ships as a **native
iOS + Android app via Capacitor**, which is the primary differentiator.

### Business model
- R189/month flat subscription per business (via PayFast recurring billing)
- 30-day free trial on signup
- Subscription statuses: `trial` → `active` → `past_due` → `cancelled`

### Target market
Small SA trade businesses — typically 1–5 staff, owner-operated. They currently
send quotes via WhatsApp text, chase payments via EFT, and track everything in
their heads or on paper. They are not technical. UX must be frictionless.

---

## 3. TECH STACK — EVERY DECISION IS FINAL UNLESS FLAGGED

| Layer | Technology | Why |
|---|---|---|
| Frontend framework | **React 18 + Vite** | Fast builds, HMR, best Capacitor compatibility |
| Mobile wrapper | **Capacitor** | One codebase → iOS + Android + Web |
| UI components | **Ionic React** | Pre-built mobile-feel components for Capacitor |
| State — server | **React Query (TanStack Query)** | Caching, offline sync, optimistic updates |
| State — local | **Zustand** | Lightweight, no boilerplate |
| Forms | **React Hook Form + Zod** | Validated, typed forms |
| Backend / DB | **Supabase** | Postgres + Auth + Storage + Realtime + Edge Functions |
| Auth | **Supabase Auth** | Magic link + email/password. No OAuth in v1 |
| Payments | **PayFast** | SA-native, supports ZAR recurring billing |
| In-person payments | **Yoco** | SA card reader integration (v2) |
| AI scope writing | **Claude API (claude-sonnet-4-20250514)** | Generates proposal text from line items |
| PDF generation | **React-PDF** (client preview) + **Puppeteer** (Edge Function final PDF) |
| Push notifications | **Firebase FCM** via `@capacitor/push-notifications` |
| Routing | **React Router v6** | Lazy-loaded, code-split per route |
| CSS | **CSS variables only** — no Tailwind, no CSS-in-JS library | Capacitor compatible, dark mode automatic |
| Error tracking | **Sentry** | From day one |
| CI/CD | **GitHub Actions** + **Vercel** (web) + **Capacitor Live Updates** (mobile OTA) |
| Language | **TypeScript strict mode** — no `any`, ever |

---

## 4. PROJECT STRUCTURE

```
quotr/
├── GEMINI.md                        ← this file
├── capacitor.config.ts
├── vite.config.ts
├── index.html
├── package.json
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql   ← ✅ DONE
│   │   └── 002_storage_policies.sql ← ✅ DONE
│   └── functions/                   ← Edge Functions (Deno)
│       ├── get-public-quote/        ← validate token, return PublicQuote
│       ├── generate-scope/          ← call Claude API, stream response
│       ├── generate-pdf/            ← Puppeteer, store in Supabase Storage
│       └── payfast-webhook/         ← handle payment confirmation
├── src/
│   ├── main.tsx
│   ├── router.tsx                   ← ✅ DONE — lazy routes + guards
│   ├── lib/
│   │   ├── database.types.ts        ← ✅ DONE — all DB types, Insert/Update correct
│   │   ├── supabase.ts              ← ✅ DONE — typed client + db/storage helpers
│   │   └── routes.ts                ← ✅ DONE — ROUTES constant, single source of truth
│   ├── features/
│   │   ├── auth/                    ← ✅ DONE
│   │   │   ├── AuthContext.tsx      ← session, business, derived booleans
│   │   │   ├── guards.tsx           ← AuthGuard, OnboardingGuard, SubscriptionGuard, PublicOnlyGuard
│   │   │   ├── hooks.ts             ← useRegister, useLogin, useForgotPassword, useResetPassword
│   │   │   ├── TradeTypePicker.tsx  ← radio grid for trade type selection
│   │   │   └── index.ts             ← barrel export
│   │   ├── quotes/                  ← 🔲 TODO
│   │   ├── invoices/                ← 🔲 TODO
│   │   ├── clients/                 ← 🔲 TODO
│   │   └── business/                ← 🔲 TODO
│   ├── components/
│   │   ├── ui/
│   │   │   └── index.tsx            ← ✅ DONE — Input, Button, FormError, AppLoader, QuotrLogo
│   │   ├── forms/
│   │   └── layout/
│   │       ├── AppShell.tsx         ← 🔲 TODO
│   │       ├── BottomNav.tsx        ← 🔲 TODO
│   │       └── TopBar.tsx           ← 🔲 TODO
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx        ← ✅ DONE
│   │   │   ├── RegisterPage.tsx     ← ✅ DONE (2-step: credentials → business)
│   │   │   ├── OnboardingPage.tsx   ← 🔲 TODO
│   │   │   └── EmailFlowPages.tsx   ← ✅ DONE (VerifyEmail, ForgotPassword, ResetPassword)
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx    ← 🔲 TODO
│   │   ├── quotes/
│   │   │   ├── QuotesListPage.tsx   ← 🔲 TODO
│   │   │   ├── QuoteBuilderPage.tsx ← 🔲 TODO — core product
│   │   │   ├── QuoteDetailPage.tsx  ← 🔲 TODO
│   │   │   └── PublicQuotePage.tsx  ← 🔲 TODO — client-facing, no auth
│   │   ├── clients/
│   │   │   ├── ClientsListPage.tsx  ← 🔲 TODO
│   │   │   └── ClientDetailPage.tsx ← 🔲 TODO
│   │   └── settings/
│   │       ├── SettingsPage.tsx     ← 🔲 TODO
│   │       └── BusinessProfilePage.tsx ← 🔲 TODO
│   ├── hooks/                       ← shared hooks (useDebounce, useOnline, etc.)
│   ├── store/
│   │   └── authStore.ts             ← DEPRECATED — replaced by AuthContext
│   ├── types/
│   │   └── index.ts                 ← DEPRECATED — replaced by database.types.ts
│   └── utils/
│       └── formatters.ts            ← ZAR currency, date formatting, etc.
```

---

## 5. DATABASE SCHEMA — KEY DECISIONS

### Multi-tenancy
Every table (except `line_item_templates`) has `business_id uuid NOT NULL`.
Row Level Security (RLS) is enabled on every table. The helper function
`my_business_id()` returns the current user's business ID and is used in
every RLS policy. **No application-level filtering — the DB enforces isolation.**

### Core tables
| Table | Purpose |
|---|---|
| `businesses` | Root tenant. Created by DB trigger on `auth.users` insert |
| `clients` | Contacts belonging to a business |
| `line_item_templates` | Rate card items. `business_id = null` = system template (all trades) |
| `quotes` | The core entity. Has `public_token` for client URL |
| `quote_line_items` | Line items on a quote. `total` is a **generated column** (never write it) |
| `invoices` | Deposit (and eventually final) invoices linked to a quote |
| `push_tokens` | FCM tokens per user/device |
| `sequences` | Auto-incrementing quote/invoice numbers per business (QUO-0001, INV-0001) |

### Critical rules
- **Soft deletes everywhere** — `deleted_at timestamptz`. Never hard-delete quotes or invoices
- **`quote_line_items.total` is a generated column** — `quantity * unit_price`. Never include it in INSERT or UPDATE
- **`quotes.public_token`** — auto-generated by `generate_public_token()` DB function. Never set manually
- **`quotes.expires_at`** — set automatically by a DB trigger when `sent_at` is first populated

### Storage buckets (private, signed URLs only)
| Bucket | Contents | Path pattern |
|---|---|---|
| `business-assets` | Logos | `{business_id}/logo.{ext}` |
| `signatures` | SVG signature drawings | `{quote_id}/signature.svg` |
| `quote-pdfs` | Final signed PDFs | `{business_id}/{quote_id}.pdf` |

---

## 6. AUTH FLOW — COMPLETE STATE MACHINE

```
App launch
  └─ getSession()
       ├─ no session  → Welcome/Auth gate → Register or Login
       │    Register  → 2-step form (email+pw → business name + trade type)
       │              → Supabase signUp() → /verify-email screen
       │    Login     → signInWithPassword() → session open
       │    Forgot pw → resetPasswordForEmail() → /reset-password
       │
       └─ valid session
            └─ subscription check (trial | active | past_due | cancelled)
                 ├─ past_due / cancelled → /subscribe (PayFast paywall)
                 └─ trial / active
                      └─ onboarding check (business.name ≠ 'My Business')
                           ├─ incomplete → /onboarding
                           └─ complete   → /app (Dashboard)

Public path (no auth):
  quotr.co.za/q/{token} → Edge Function validates token → PublicQuotePage
```

### Guard hierarchy (router.tsx)
- `PublicOnlyGuard` — login, register (redirects authenticated users away)
- `AuthGuard` — onboarding, verify-email
- `OnboardingGuard` — subscribe page
- `SubscriptionGuard` — all `/app/*` routes
- No guard — `/q/:token` public client view

---

## 7. V1 FEATURE SCOPE

### ✅ In scope
- Business onboarding (logo, trade type, banking details, line item rate card)
- Quote builder with pre-loaded SA trade line items
- AI scope writing via Claude API (streamed)
- WhatsApp share link for client (`quotr.co.za/q/{token}`)
- Client digital signature (ECTA-compliant, SVG stored in Supabase)
- Auto deposit invoice on signature
- PayFast payment link on invoice
- Push notification on signature + on payment
- Quote status list (draft → sent → viewed → signed → expired/cancelled)
- iOS + Android app via Capacitor + Web
- R189/mo subscription via PayFast recurring

### ❌ Out of scope for V1
- Final invoice (only deposit in v1)
- Job tracker / job status board
- Photo documentation (before/after)
- Business analytics dashboard
- Multi-staff / team accounts
- Xero / accounting integration
- SMS notifications
- Recurring jobs / maintenance contracts
- Client portal
- Change requests post-signature
- Yoco in-person card payments

---

## 8. BUILD ORDER (REMAINING)

We completed steps 1 and 2. Continue in this order:

```
✅ 1. Supabase schema + RLS + migrations
✅ 2. Auth flow (AuthContext, guards, hooks, Login, Register, email flows)
✅ 3. Onboarding flow (business profile, logo upload, line item rate card setup)
🔲 4. App shell (AppShell, BottomNav, TopBar — Capacitor safe-area aware)
🔲 5. Quote builder (the core product — line items, AI scope, totals, VAT)
🔲 6. Client public quote page (PublicQuotePage — view, sign, deposit)
🔲 7. Quote list + detail views
🔲 8. PayFast integration (subscription billing + invoice payment links)
🔲 9. Push notifications (Firebase FCM via Capacitor plugin)
🔲 10. Edge Functions (get-public-quote, generate-scope, generate-pdf, payfast-webhook)
🔲 11. Capacitor config (iOS + Android, deep links, splash screen, icons)
🔲 12. App store submission
```

---

## 9. CODING STANDARDS — NON-NEGOTIABLE

### TypeScript
- Strict mode always. No `any`. No `// @ts-ignore`
- All DB operations use `db.tableName()` helpers from `src/lib/supabase.ts`
- `Insert` types: every column with a SQL `DEFAULT` must be `?` optional
- Never write to `quote_line_items.total` — it is a Postgres generated column

### Components
- All components are functional with hooks — no class components
- CSS via CSS variables only (`var(--color-text-primary)` etc.) — no Tailwind, no styled-components
- Safe area insets on every full-screen layout: `padding: env(safe-area-inset-top) ...`
- `-webkit-tap-highlight-color: transparent` on all interactive elements (Capacitor)
- `min-height: 100dvh` not `100vh` (handles mobile browser chrome)
- `inputMode` attribute on all inputs (triggers correct mobile keyboard)

### Data fetching
- All server state via React Query — no `useEffect` for data fetching
- Optimistic updates for quote status changes
- Offline-first: React Query `staleTime` + `gcTime` configured for field use

### Error handling
- Never show raw Supabase/Postgres error strings to users
- All Supabase errors mapped to plain English in `features/auth/hooks.ts` pattern
- Sentry captures unhandled errors — wrap critical paths in try/catch

### File structure
- Feature-first: `src/features/{feature}/` owns its components, hooks, types
- Barrel exports via `index.ts` in each feature folder
- Shared UI primitives in `src/components/ui/`
- No cross-feature imports — features communicate via shared lib/ only

### Naming
- Files: PascalCase for components (`QuoteBuilderPage.tsx`), camelCase for hooks/utils
- DB columns: snake_case (matches Postgres)
- TypeScript types: PascalCase (`QuoteWithDetails`)
- CSS classes: kebab-case with `q-` prefix for Quotr primitives (`q-btn`, `q-input`)

---

## 10. KEY BUSINESS CONTEXT

- **SA-specific**: All prices in ZAR (R). Payment via PayFast and Yoco — not Stripe
- **ECTA compliance**: Electronic signatures are legally valid in SA under the Electronic Communications and Transactions Act. We store: SVG drawing, timestamp, IP address, and client-typed name
- **VAT**: SA VAT is 15%. VAT is optional per quote (many small tradies are not VAT-registered)
- **Trade compliance numbers**: Electricians need PIRB number + CoC on quotes. Plumbers need CoC. These are stored on the business profile and auto-included in generated PDFs
- **WhatsApp is primary**: Every client communication goes via WhatsApp link. Email is a fallback. SMS is v2. Do not design flows that require the client to have email
- **Signal reliability**: Tradies work on construction sites, in ceilings, under houses. Offline capability is not a nice-to-have

---

## 11. ENVIRONMENT VARIABLES

```bash
# .env (never commit)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Supabase Edge Function secrets (set via Supabase CLI)
ANTHROPIC_API_KEY=your-claude-api-key
PAYFAST_MERCHANT_ID=your-merchant-id
PAYFAST_MERCHANT_KEY=your-merchant-key
PAYFAST_PASSPHRASE=your-passphrase
FIREBASE_SERVICE_ACCOUNT=your-service-account-json
```

---

## 12. WHEN I ASK YOU TO BUILD SOMETHING

Always follow this sequence:

1. **State your understanding** — one sentence on what you're building and why
2. **Flag any conflicts** with existing architecture before writing code
3. **Write complete files** — never partial snippets unless I ask for a snippet
4. **Comment decisions** — any non-obvious choice gets an inline comment explaining why
5. **Update this file** — if you introduce a new pattern, convention, or completed step, note it here

If something in this document conflicts with what's in the codebase, **the codebase wins** — flag the discrepancy rather than silently overriding.