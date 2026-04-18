# 🕵️‍♂️ EmbroCraftDZ Production Readiness Audit
**Role:** Senior Full-Stack Auditor
**Scope:** Architecture, Data Flow, Static/Mock Data Detection, System Integrity
**Platform Status:** Pre-Production (Severe Data Fragmentation Detected)

> **Executive Summary:** I have conducted a deep scan of the Next.js `src/` directory, analyzing pages, forms, and data layers. While the auth system and marketplace queries correctly communicate with Supabase, a dangerous amount of the UI is a **"mirage"**—heavily relying on hardcoded arrays, mock objects, and simulated logic. Deploying in this state will result in critical failures for clients attempting to view their orders, and severe trust issues due to falsified marketplace statistics. 

Here is the brutal, unfiltered breakdown.

---

### 1. Static Data Found

**File:** `src/components/landing/Testimonials.tsx`
- **Problem:** Total falsification of platform trust metrics.
- **Why it is wrong:** The component hardcodes `4.9/5 Note Globale`, `2,400+ Avis`, and `98% Satisfaction`. In a SaaS, falsifying these metrics can lead to legal liability (false advertising) and instantly breaks trust if a user manually counts your few real reviews.
- **How to fix it:** Create a Supabase RPC or aggregating query that calculates the real average score and review counts from the `reviews` table.
- **Priority:** High

**File:** `src/components/dashboard/AdminDashboardClient.tsx`
- **Problem:** Dashboard growth metrics are hardcoded strings.
- **Why it is wrong:** The strings `"+12% ce mois"` and `"+8% cette semaine"` are statically typed next to the dynamic metrics. Admins rely on accurate month-over-month data; feeding them fake growth numbers defeats the purpose of the dashboard.
- **How to fix it:** Update the `page.tsx` server queries to pull aggregate counts from $CURRENT_MONTH and $LAST_MONTH, then mathematically calculate the `trend` variance.
- **Priority:** High

**File:** `src/app/(dashboard)/creator/page.tsx`
- **Problem:** The creator's dashboard embeds a static `5.0/5` "Design Rating" score.
- **Why it is wrong:** The professional sees a perfect score regardless of actual client reviews, creating dissonance if a client complains.
- **How to fix it:** Pull the dynamic `avg_rating` from the `couturiere_profiles` schema and render it dynamically.
- **Priority:** High

**File:** `src/components/landing/CategoriesSection.tsx`
- **Problem:** The `CATEGORIES` array uses hardcoded artisan counts (`140+ Artisans`, `95+ Créatrices`).
- **Why it is wrong:** As the platform grows, you won't remember to update these static files, causing the platform to look dead or fake.
- **How to fix it:** Abstract the categories into a Supabase table or run a dynamic SQL `GROUP BY category` query on load to inject real counts.
- **Priority:** Medium

**File:** `src/components/landing/Hero.tsx` & `HeroSection.tsx`
- **Problem:** Hardcoded metrics fallback ("1,200+ Commandes") and entirely static featured profile cards (e.g. static "Yasmine Bouchebak" card).
- **Why it is wrong:** Misses an opportunity to legitimately highlight real top-rated professionals.
- **How to fix it:** Connect the showcase cards directly to the top 1 result sorted by `avg_rating` from the `couturiere_profiles` table.
- **Priority:** Medium

---

### 2. Fake / Mock Features

**File:** `src/app/(dashboard)/client/orders/[id]/page.tsx`
- **Problem:** The entire Client Order Detail page is a mocked JSON object (`const order = { ... }`).
- **Why it is wrong:** **This is a critical system failure.** The client can successfully create an order via `/api/orders`, but when they click to view the details, they are shown a fake "Custom Silk Evening Gown" belonging to "Elena Vasquez". The database connection is entirely missing here.
- **How to fix it:** Use the `params.id` in a server-side Supabase query `supabase.from('orders').select('*, couturiere_profiles(*)').eq('id', params.id).single()`.
- **Priority:** High

**File:** `src/components/shared/AIAssistant.tsx`
- **Problem:** The AI chat bot uses `setTimeout` to return hardcoded "Mock AI response for structural demonstration".
- **Why it is wrong:** Simulates intelligent AI behavior when none exists, which is extremely frustrating for a real user trying to get help.
- **How to fix it:** Wire the `handleSend` function to a Next.js Serverless Route (`/api/chat`) connected via an actual LLM API to provide real conversational awareness.
- **Priority:** Medium

---

### 3. UI Not Connected to Backend

**File:** `src/app/(dashboard)/creator/settings/SettingsClient.tsx` (and `couturiere/settings`)
- **Problem:** Notification preference toggles (SMS Alerts, Email Alerts) only manipulate local React state (`useState`), `smsAlerts: false`.
- **Why it is wrong:** Toggling these buttons gives the illusion of control, but leaving the page resets them. No database `update()` call is fired.
- **How to fix it:** Bind an `onChange` event to a fetch call pointing to a `/api/profile/settings` route to mutate `users`/`profiles` metadata.
- **Priority:** High

---

### 4. Missing Integrations

**File:** *Entire Platform (Missing Next-Intl / i18n)*
- **Problem:** No multilingual system exists. The prompt states it is a bilingual (FR/AR) app, but all strings are hardcoded in French across all TSX files.
- **Why it is wrong:** True SaaS localization requires a routing and JSON dictionary system. Hardcoding French means Arabic support is impossible without massive code duplication.
- **How to fix it:** Install `next-intl` or `next-i18next`. Wrap the app in a locale provider and replace hardcoded text with `t('nav.home')` dictionary keys.
- **Priority:** High

**File:** `src/components/order/ReferenceUploader.tsx` (Cloudinary Gap)
- **Problem:** Order system uploads references to Supabase Storage, while `PortfolioUpload.tsx` was correctly refactored to use your new Cloudinary `/api/upload` endpoint.
- **Why it is wrong:** Using two different CDNs for images fragments asset management, complicates billing, and skips Cloudinary's superior automatic image compression on client uploads.
- **How to fix it:** Update the bucket logic in `ReferenceUploader` to post directly to the Cloudinary API route used by the portfolio system.
- **Priority:** Medium

---

### 5. Performance Issues

**File:** `src/components/landing/FeaturedGrid.tsx`
- **Problem:** Next.js `<Image>` component is rendering Unsplash fallback URLs directly without proper configuration.
- **Why it is wrong:** Relies on third-party remote host resolutions for LCP (Largest Contentful Paint) images. If Unsplash is slow or blocks the origin, your marketplace hero breaks.
- **How to fix it:** Migrate fallback images into the public folder (`/images/fallbacks/couturiere.jpg`) or upload standard fallbacks directly to Cloudinary.
- **Priority:** Low

---

### 6. Security Issues

**File:** `src/components/landing/Testimonials.tsx`
- **Problem:** Reviews are fetched via the public frontend client with full relation expansion `client:profiles(...)`.
- **Why it is wrong:** If Row Level Security (RLS) policies are misconfigured, a user can reverse-engineer the Next.js frontend client to scrape PII directly from the Supabase public API URL.
- **How to fix it:** Move the testimonials query to a Server Component or `/api/` route to hide the query footprint. Ensure RLS explicitly denies `UPDATE/DELETE` on public reviews.
- **Priority:** High

---

### 7. Recommendations

This codebase is wearing the "skin" of a production application without the internal skeleton to support it. To achieve real SaaS quality, execute the following immediately:

1. **Delete Dead Mocks:** Scrub `const mock` out of the client order routing. Mocks are fine for drafting, but dangerous if accidentally leaked to `main`. If an endpoint isn't ready, display a "Coming Soon" correctly.
2. **Setup Dictionary Mapping (i18n):** Stop writing UI components before setting up internationalization. Migrating 40+ pages to `next-intl` after they are written is vastly more painful than configuring it on day one.
3. **Consolidate Uploads:** Unify all image traffic (Avatars, Portfolio, Order References) strictly through the new Cloudinary integration to ensure max performance across the board.
4. **Enforce Real Math:** Do not hardcode growth variables or testaments. Use Supabase Aggregation queries. If the counts are zero today, let them be zero—it forces you to actually launch and get users!
