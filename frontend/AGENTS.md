# AGENTS — Repo Instructions for AI Coding Agents

Purpose: concise, actionable guidance for AI coding agents to be productive in this repository.

Quick start
- Install: `pnpm install` (pnpm preferred; lockfile present: `pnpm-lock.yaml`).
- Dev: `pnpm dev` — runs Next.js in development.
- Build: `pnpm build` then `pnpm start` for production.
- Lint: `pnpm lint` (runs ESLint).

Key assumptions
- Node: use Node 18+ (no `.nvmrc` or `engines` specified). Prefer pnpm v8–9.
- TypeScript: project uses TypeScript (see `tsconfig.json`).
- Framework: Next.js App Router (`app/` directory).

Important entrypoints (edit/view)
- `app/layout.tsx` — root layout, metadata, global providers.
- `app/page.tsx` — landing page composition.
- `components/theme-provider.tsx` — theme and provider setup.
- `components/ui/` — UI primitives and shadcn-style components.
- `components/landing/` — marketing sections and animated components.

Files to reference (links)
- [package.json](package.json) — scripts, dependencies.
- [pnpm-lock.yaml](pnpm-lock.yaml) — lockfile.
- [next.config.mjs](next.config.mjs) — Next runtime options.
- [tsconfig.json](tsconfig.json) — TypeScript configuration and path aliases.
- [postcss.config.mjs](postcss.config.mjs) — PostCSS/Tailwind config.
- [app/globals.css](app/globals.css) and [styles/globals.css](styles/globals.css) — Tailwind and global styles.
- [components.json](components.json) — shadcn config and component wiring.
- [README.md](README.md) — project overview and onboarding notes.

Agent guidance and gotchas
- Next config sets `typescript.ignoreBuildErrors: true`; CI should avoid ignoring build-time type errors.
- `images.unoptimized: true` in `next.config.mjs` affects image optimization in production — be aware during performance changes.
- README mentions an `.env.example` but none exists; do not assume environment variables beyond those in README.
- There are `expo` / `react-native` dependencies in `package.json` that may be unnecessary for web-only tasks; be cautious when changing or removing them.

Suggested next customizations
- Add a small `.github/copilot-instructions.md` or expand this `AGENTS.md` with per-area instructions (frontend, animations, design tokens).
- Add `.env.example` with any required env vars mentioned in `README.md`.
- Optionally add `engines.node` to `package.json` to record Node version requirement.

If you want, I can create the `.github/copilot-instructions.md` variant, add an `.env.example` stub, or add an `engines` field to `package.json`. Reply with which action to take next.
