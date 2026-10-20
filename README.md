# West Quest Limited

A device financing storefront — smartphones and tablets on deposit, with daily
payments over 6, 9 or 12 months. Built with Next.js 16 (App Router), React 19
and Tailwind CSS v4. The Node.js + MariaDB backend is a separate project:
`West-Quest-backend` (a sibling folder / its own repo).

## Getting started

The storefront and admin dashboard read and write everything (products,
categories, payment plans, applications, banners, reviews, photos) through the
backend API, so start that first — see the `West-Quest-backend` README for
MariaDB setup, migrations, creating an admin and importing the catalogue.

```bash
# 1. backend (http://127.0.0.1:4000) — in the West-Quest-backend project
cd ../West-Quest-backend && npm install && npm run migrate && npm run create-admin -- --email you@example.com --name "Your Name"
npm run import-catalog
npm run dev

# 2. storefront (http://localhost:3000) — in this project
cd ../West-Quest
cp .env.local.example .env.local      # BACKEND_URL points at the backend
npm install
npm run dev
```

The browser only calls this site's own `/api/*`; `next.config.ts` forwards those
requests to `BACKEND_URL`, which keeps the admin session cookie same-origin.
`npm run build` also fetches the catalogue, so the backend must be running during a build.
If the backend is unreachable at runtime the storefront still renders (built-in
categories) but shows no products.

## Accounts, cart and checkout

There is **no payment gateway**. Shoppers add devices to a cart — each item
either on a plan (Retail or VIP tier, 6/9/12-month term) or paid in full — and
sign in (phone + password) at checkout. Checkout creates one financing
application per plan item plus one cash order for the rest; the team confirms
everything over WhatsApp (number in `src/lib/contact.ts`). Customers follow
their applications and orders under **My orders** (`/account`).

## Where things live

| Area | Path |
| --- | --- |
| Design tokens & component classes ("Terracotta Ledger" identity) | `src/app/globals.css` |
| Contact / WhatsApp details | `src/lib/contact.ts` |
| Plan-calculator math (deposit, daily rate, estimated total) | `src/lib/finance.ts` |
| Fallback categories | `src/lib/data/` |
| Storefront routes | `src/app/(site)/` |
| Admin dashboard | `src/app/admin/` |
| Backend API client | `src/lib/api/`, `src/services/` |
| Backend (Express + MariaDB): plans, applications, accounts, orders | separate repo: `West-Quest-backend` |

## Scripts

- `npm run dev` — dev server
- `npm run build` / `npm run start` — production build
- `npm run lint` — ESLint
# -West-Quest
