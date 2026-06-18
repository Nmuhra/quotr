# Quotr — Quote Generation App

## Dev Commands

```bash
# Start dev server
npm run dev

# Build for production (always before syncing to native)
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

**Known Gaps (not blocking auth, fix in next iteration):**
- Supabase DB trigger must create `businesses` record with `subscription_status='trial'` on signup
- Dashboard page not yet implemented (shows "coming soon")
- All /app sub-routes show "coming soon" placeholders