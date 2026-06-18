# Quotr — Quote Generation App

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5174

## Setup

### 1. Environment Variables

Create `.env` (already done):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Database Schema

**Important:** Apply the database migrations before testing auth.

See `supabase/SETUP.md` for detailed instructions:
```bash
# Option 1: Supabase Dashboard → SQL Editor
# Copy supabase/migrations/001_initial_schema.sql and run

# Option 2: CLI
npm install -g supabase
supabase link --project-ref <your-project-id>
supabase db push
```

After applying migrations:
1. Create these storage buckets in Supabase dashboard:
   - `business-assets` (logos)
   - `signatures` (client signatures)
   - `quote-pdfs` (generated PDFs)

2. Apply `supabase/migrations/002_storage_policies.sql`

## Dev Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Lint
npm lint
```

## Mobile Sync

```bash
# Sync web build into native projects
npx cap sync

# Open in Android Studio
npx cap open android

# Open in Xcode (Mac only)
npx cap open ios
```

## Auth Flow Status

**Implemented & Ready:**
- Login page (email + password)
- Register page (2-step: credentials → business details)
- Email verification screen
- Password reset flow
- Onboarding page (business name + trade type + logo + rate card setup)
- Route guards (auth, onboarding, subscription-based)
- Auth context with session + business profile management
- **Database trigger**: Auto-creates business record with 30-day trial on signup ✅

**Manual Testing Checklist:**
1. Visit http://localhost:5174 → redirects to /login ✓
2. Click "Sign up free" → RegisterPage appears ✓
3. Fill email + password + confirm → "Continue" button ✓
4. Fill business name + trade type → "Create account" submits ✓
5. Should redirect to /verify-email (check inbox message)
6. Click email link → redirects to /onboarding
7. Complete onboarding → redirects to /app/dashboard
8. Try /login while authenticated → redirects to dashboard
9. Password reset flow — forgot-password → reset-password

**Known Gaps (next iteration):**
- Dashboard page not yet implemented (shows "coming soon")
- All /app sub-routes show "coming soon" placeholders