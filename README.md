# MALIXA 🧵

A modern marketplace platform connecting clients with Algerian couturières and embroidery artisans.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19 |
| Styling | Tailwind CSS 4, Framer Motion |
| Backend | Next.js API Routes (Serverless) |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth + SSR Middleware |
| Storage / CDN | Cloudinary |
| i18n | next-intl (FR / AR / EN) |
| UI Components | Radix UI, Lucide React, shadcn/ui |

## User Roles
- **Client** — browses marketplace, places custom orders, messages creators
- **Créatrice / Creator** — manages portfolio, accepts orders, communicates with clients
- **Admin** — manages all users, monitors platform statistics

## Features
- ✅ Supabase Auth with role-based route protection
- ✅ Marketplace with search and filtering
- ✅ Real-time messaging (Supabase postgres_changes)
- ✅ Cloudinary image uploads (portfolio, avatar, reference)
- ✅ Order lifecycle management (pending → in_progress → completed)
- ✅ Reviews system with business validation
- ✅ Admin analytics dashboard (live trends)
- ✅ Multilingual (French, Arabic, English)
- 🔜 Payment gateway (planned: Chargily Pay / CCP)
- 🔜 AI-powered style assistant

## Getting Started

1. Clone the repo
2. Copy `.env.local.example` to `.env.local` and fill in your keys
3. Run `npm install`
4. Run `npm run dev`

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_key
```
