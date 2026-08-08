# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project state

This is a freshly bootstrapped `create-next-app` scaffold (no custom application code yet beyond the default
homepage). The repo name suggests the intended product is a LINE bot for salon bookings, but that integration
has not been built. Don't assume LINE Messaging API, booking, or database logic exists anywhere yet — check
before referencing it.

The Supabase MCP server is enabled in `.claude/settings.local.json`, indicating Supabase is the planned backend.
There is no `supabase/` directory or migrations yet — use the `mcp__supabase__*` tools (e.g. `list_projects`,
`list_tables`) to discover what, if anything, exists remotely before assuming schema.

## Commands

- `npm run dev` — start the dev server (Next.js 16, Turbopack by default) at http://localhost:3000
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint (flat config via `eslint.config.mjs`, extends `eslint-config-next`)

There is no test runner configured in `package.json` yet.

## Architecture

- **App Router** under `app/`: `app/layout.tsx` is the root layout, `app/page.tsx` is the homepage. Route
  segments follow the standard `app/<segment>/page.tsx` convention — there are none yet besides the root.
- **Styling**: Tailwind CSS v4 via `@tailwindcss/postcss` (see `postcss.config.mjs`); global styles in
  `app/globals.css`. There is no `tailwind.config.*` file — v4 is configured via CSS/PostCSS, not a JS config.
- **TypeScript**: path alias `@/*` maps to the repo root (`tsconfig.json`). `strict` mode is on.
- **Typed routes**: `app/layout.tsx` types its props as `LayoutProps<"/">`, a Next.js-generated type (from
  `.next/types`) tied to the literal route path — this is new App Router typing behavior, not a hand-written type.

Because this is Next.js 16, APIs and conventions may diverge from older Next.js knowledge — see the instructions
imported from `AGENTS.md` above about consulting `node_modules/next/dist/docs/` before writing routing, data
fetching, or config code.
