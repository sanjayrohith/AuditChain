# ComplyTrace

**AI Compliance Intelligence for Modern Organizations**

ComplyTrace helps businesses understand which AI regulations apply to their systems, automatically generate compliance disclosures, and maintain tamper-evident audit trails — all powered by semantic law matching. No legal expertise required.

---

## Features

### Landing Page
- Animated hero section with typewriter word cycling and scroll-triggered stat counters
- Live metrics section displaying compliance coverage and audit statistics
- Four-feature grid: AI Use Case Analysis, Semantic Law Matching, Disclosure Generator, Tamper-Evident Audit Trail
- Three-step how-it-works walkthrough with syntax-highlighted code examples
- Testimonials marquee with infinite scroll animation
- Tiered pricing section (Free / Pro / Enterprise) with monthly/annual toggle
- Security & infrastructure overview sections
- Developer integrations highlight section
- Call-to-action section with dual CTAs
- Responsive navigation with mobile fullscreen menu and scroll-aware transparency
- Footer with site map

### Onboarding (`/onboarding`)
- Two-column layout: multi-step form + "What happens next?" sidebar
- Organization name, industry vertical, and primary use case inputs
- Multi-select US state jurisdiction cards (14 states)
- Form validation with disabled submit until all required fields are complete
- Routes to `/dashboard` on completion

### Dashboard (`/dashboard`)
- Summary stat cards: Regulations Matched, AI Systems, Compliance Score, Pending Actions
- US state compliance grid with per-state status badges (Compliant / Review / Pending)
- Recent activity table with event type, description, and timestamp
- Quick Actions grid: Add AI System, Generate Disclosure, Export Audit Log, View Law Matches
- Audit health status card

### AI Use Cases (`/use-cases`)
- Full CRUD interface: add, edit, and delete AI systems
- Per-system form: name, description, category, data types handled, affected users
- Category badges and risk-level indicators on each card
- Live empty state when the list is cleared
- "Analyze" button per card routes to `/law-matches`
- "Analyze All Systems" header CTA
- Summary counters: total systems, systems analyzed, pending review

### Law Matches (`/law-matches`)
- Matched regulation cards with jurisdiction badges, confidence percentages, and compliance status
- Expandable key requirements per regulation
- "How was this match determined?" explainer with semantic search methodology
- Regulation breakdown sidebar: jurisdiction coverage, category distribution
- Analyzed system recap card
- Next-steps grid: Generate Disclosure, Update Use Case, View Audit, Export Report

### Disclosures (`/disclosures`)
- Live editable disclosure document with file-chrome header
- Copy to clipboard with visual feedback state, Download PDF, Download DOCX, Regenerate (with spin animation) action buttons
- Accordion-style referenced regulations
- Document History timeline
- Next-steps grid routing to `/audit`, `/dashboard`, `/use-cases`, `/law-matches`
- Sidebar: About card, Document Summary with large numerals, Pre-flight checklist, Audit Trail card

### Audit Log (`/audit`)
- Filterable event table: search by keyword, filter by status (Verified / Pending / Failed) and system
- Click-to-select rows update a right-side Event Details panel
- Event Details: event type, actor, timestamp, target system, reason, and both content hash and chain hash in `code` blocks
- Summary cards: Total Events, Verified Events, Chain Integrity, Last Event timestamp
- Integrity verification badge
- Quick Actions sidebar: Export Full Log, Verify Chain, Generate Report, API Access

### Developer API (`/developers`)
- API key management with copy and regenerate (with spin animation) actions
- Quick Start code block with copy button
- Four endpoint cards with HTTP method badges and descriptions
- Formatted JSON response block with status badge
- SDK availability grid (Node.js, Python, Go, Java)
- Webhook events table
- Quick Actions grid: View Full Docs, Test in Sandbox, Webhook Setup, Rate Limits
- Sidebar: Need Help links, Base URL, Rate Limits, Authentication method, compliance note

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| [Next.js](https://nextjs.org) | 16.0.10 | React framework, App Router, file-based routing |
| [React](https://react.dev) | 19.2.0 | UI rendering |
| [TypeScript](https://typescriptlang.org) | ^5 | Static typing |
| [Tailwind CSS](https://tailwindcss.com) | ^4.1.9 | Utility-first styling (v4 with `@import "tailwindcss"`) |
| [shadcn/ui](https://ui.shadcn.com) | new-york | Accessible component primitives |
| [Radix UI](https://radix-ui.com) | various | Headless UI primitives underlying shadcn |
| [Lucide React](https://lucide.dev) | ^0.454.0 | Icon set |
| [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) | 9.5.0 | 3D animated shapes on the landing page |
| [Three.js](https://threejs.org) | 0.183.2 | 3D rendering engine |
| [Geist](https://vercel.com/font) | 1.7.0 | Font package |
| [Instrument Sans / Serif / JetBrains Mono](https://fonts.google.com) | via `next/font` | Primary type system |
| [Vercel Analytics](https://vercel.com/analytics) | 1.3.1 | Page view analytics |
| [Recharts](https://recharts.org) | 2.15.4 | Chart primitives |
| [Zod](https://zod.dev) | 3.25.76 | Schema validation |
| [React Hook Form](https://react-hook-form.com) | ^7.60.0 | Form state management |
| [date-fns](https://date-fns.org) | 4.1.0 | Date formatting |
| [Sonner](https://sonner.emilkowal.ski) | ^1.7.4 | Toast notifications |
| [Embla Carousel](https://www.embla-carousel.com) | 8.5.1 | Carousel primitives |
| [Vaul](https://vaul.emilkowal.ski) | ^1.1.2 | Drawer component |
| [cmdk](https://cmdk.paco.me) | 1.0.4 | Command palette |
| [tw-animate-css](https://github.com/Epictetus/tw-animate-css) | 1.3.3 | Animation utilities |

---

## Project Structure

```
complytrace/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout: fonts, metadata, Vercel Analytics
│   ├── globals.css               # Tailwind v4 theme, design tokens, custom utilities
│   ├── page.tsx                  # Landing page (assembles all landing sections)
│   ├── onboarding/
│   │   └── page.tsx              # Organization setup wizard
│   ├── dashboard/
│   │   └── page.tsx              # Main compliance dashboard
│   ├── use-cases/
│   │   └── page.tsx              # AI system CRUD management
│   ├── law-matches/
│   │   └── page.tsx              # Regulation matching results
│   ├── disclosures/
│   │   └── page.tsx              # Compliance disclosure editor & export
│   ├── audit/
│   │   └── page.tsx              # Tamper-evident audit log viewer
│   └── developers/
│       └── page.tsx              # API key management & developer docs
│
├── components/
│   ├── landing/                  # Landing page section components
│   │   ├── navigation.tsx        # Responsive nav with mobile menu
│   │   ├── hero-section.tsx      # Animated hero with typewriter and stats
│   │   ├── features-section.tsx  # Four-feature grid with visuals
│   │   ├── metrics-section.tsx   # Animated live metric counters
│   │   ├── how-it-works-section.tsx # Three-step code walkthrough
│   │   ├── testimonials-section.tsx # Marquee testimonial carousel
│   │   ├── pricing-section.tsx   # Tiered pricing with billing toggle
│   │   ├── security-section.tsx  # Security & trust signals
│   │   ├── infrastructure-section.tsx # Infrastructure highlights
│   │   ├── integrations-section.tsx  # Integration logos marquee
│   │   ├── developers-section.tsx    # Developer feature highlights
│   │   ├── cta-section.tsx       # Final call-to-action
│   │   ├── footer-section.tsx    # Site footer
│   │   ├── animated-sphere.tsx   # React Three Fiber 3D sphere
│   │   ├── animated-tetrahedron.tsx  # React Three Fiber 3D tetrahedron
│   │   └── animated-wave.tsx     # SVG animated wave
│   │
│   ├── ui/                       # shadcn/ui component library (new-york style)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── accordion.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   ├── tooltip.tsx
│   │   └── ...                   # 40+ additional primitives
│   │
│   └── theme-provider.tsx        # next-themes dark mode provider
│
├── hooks/
│   ├── use-mobile.ts             # Responsive breakpoint hook
│   └── use-toast.ts              # Toast notification hook
│
├── lib/
│   └── utils.ts                  # `cn()` class merge utility (clsx + tailwind-merge)
│
├── styles/
│   └── globals.css               # Alternate global styles entry
│
├── components.json               # shadcn/ui configuration
├── next.config.mjs               # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── postcss.config.mjs            # PostCSS configuration
└── package.json                  # Dependencies and scripts
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) >= 18.x
- [pnpm](https://pnpm.io) >= 8.x (recommended) — or npm / yarn / bun

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/complytrace.git
cd complytrace

# 2. Install dependencies
pnpm install

# 3. Start the development server
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
# Create an optimised production build
pnpm build

# Start the production server
pnpm start
```

### Lint

```bash
pnpm lint
```

---

## Environment Variables

The frontend currently uses no required environment variables. The table below documents variables that will be needed once the backend is integrated:

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string (AWS Aurora) | Backend |
| `BEDROCK_REGION` | AWS region for Amazon Bedrock inference | Backend |
| `BEDROCK_MODEL_ID` | Claude model identifier for law matching | Backend |
| `EMBEDDINGS_MODEL_ID` | Titan Embeddings model identifier for RAG | Backend |
| `PGVECTOR_SCHEMA` | PostgreSQL schema name for vector embeddings | Backend |
| `NEXTAUTH_SECRET` | Auth secret for session encryption | Backend |
| `NEXTAUTH_URL` | Canonical URL of the deployed app | Backend |

To configure environment variables locally, create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
# Fill in the values before running pnpm dev
```

---

## Available Pages

| Route | Page | Description |
|---|---|---|
| `/` | Landing Page | Marketing site with hero, features, metrics, testimonials, pricing, and CTA sections |
| `/onboarding` | Organization Setup | Multi-step form to capture org name, industry, use case, and target jurisdictions |
| `/dashboard` | Compliance Dashboard | Overview of matched regulations, AI systems, compliance score, activity feed, and quick actions |
| `/use-cases` | AI Use Cases | Full CRUD interface for registering and managing AI systems within the organization |
| `/law-matches` | Law Matches | Semantic regulation matching results with confidence scores and key requirements per regulation |
| `/disclosures` | Compliance Disclosures | Editable disclosure document with export actions (PDF / DOCX) and referenced regulation accordion |
| `/audit` | Audit Log | Filterable, searchable tamper-evident event log with click-to-inspect event details panel |
| `/developers` | Developer API | API key management, endpoint reference, SDK availability, webhook events, and Quick Start code |

---

## Components

### Landing Section Components

| Component | Description |
|---|---|
| `Navigation` | Sticky header with scroll-aware opacity, nav links, and full-screen mobile menu |
| `HeroSection` | Typewriter word animation, animated 3D sphere, scroll-triggered stat counters |
| `FeaturesSection` | Four-panel feature grid with number labels and visual mock-ups |
| `MetricsSection` | Scroll-triggered animated number counters for compliance metrics |
| `HowItWorksSection` | Three-step walkthrough with syntax-highlighted code blocks |
| `TestimonialsSection` | Infinite marquee testimonial cards with customer quotes |
| `PricingSection` | Three-tier pricing cards with monthly/annual billing toggle |
| `SecuritySection` | Trust & security feature highlights |
| `InfrastructureSection` | Infrastructure and scalability highlights |
| `IntegrationsSection` | Scrolling marquee of integration logos |
| `DeveloperSection` | Developer tooling and API feature highlights |
| `CTASection` | Final conversion section with primary and secondary CTAs |
| `FooterSection` | Multi-column site footer with navigation links |
| `AnimatedSphere` | React Three Fiber wireframe sphere with rotation animation |
| `AnimatedTetrahedron` | React Three Fiber animated tetrahedron |
| `AnimatedWave` | SVG-based animated wave separator |

### shadcn/ui Primitives (selected)

| Component | Usage |
|---|---|
| `Button` | Primary actions, pill CTAs, icon buttons |
| `Input` / `Textarea` | Form fields throughout onboarding and use-case forms |
| `Badge` | Status labels, jurisdiction tags, HTTP method chips |
| `Card` | Content containers across all dashboard pages |
| `Table` | Activity log, audit log, webhook events |
| `Tabs` | Billing toggle on pricing, tab navigation |
| `Accordion` | Referenced regulations in disclosures, collapsible sections |
| `Dialog` | Modal overlays |
| `Select` | Dropdown selectors in forms |
| `Tooltip` | Hover hints on icons and truncated content |
| `Spinner` | Loading states on async actions (regenerate, export) |

---

## Design System

ComplyTrace uses a single, consistent design language across every page — no page-specific overrides or one-off styles.

### Typography

Three Google Fonts loaded via `next/font/google` with CSS variable binding:

| Role | Font | Class |
|---|---|---|
| Body / UI | Instrument Sans | `font-sans` |
| Display / Headings | Instrument Serif | `font-display` |
| Code / Mono labels | JetBrains Mono | `font-mono` |

### Color Tokens (light mode, OKLCH)

All colors are defined as CSS custom properties in `app/globals.css` and mapped through the `@theme inline` block for Tailwind consumption. No raw color values appear in component code — only semantic token classes (`bg-background`, `text-foreground`, `border-foreground/10`, etc.).

| Token | Value | Usage |
|---|---|---|
| `--background` | `oklch(0.985 0.002 90)` | Page background (warm off-white) |
| `--foreground` | `oklch(0.12 0.01 60)` | Primary text and interactive elements |
| `--muted-foreground` | `oklch(0.45 0.02 60)` | Secondary / helper text |
| `--border` | `oklch(0.88 0.01 90)` | Default borders |
| `--radius` | `0.25rem` | Global border radius (intentionally sharp) |

### Layout

- **Two-column sidebar layout** (`lg:grid-cols-[1fr_340px]` or `[1fr_360px]`) used consistently across all dashboard pages
- **Flexbox-first** — CSS Grid only where a true two-dimensional layout is needed
- **Mobile-first** responsive prefixes (`md:`, `lg:`)
- **Background pattern** — `noise-overlay` pseudo-element with SVG fractal noise at 3% opacity gives all pages a subtle tactile texture

### Custom Utilities

| Class | Effect |
|---|---|
| `.font-display` | Applies Instrument Serif |
| `.text-stroke` | Outlined text (transparent fill, 1.5px stroke) |
| `.noise-overlay` | Adds SVG fractal noise texture via `::after` |
| `.marquee` / `.marquee-reverse` | Infinite horizontal scroll animations |
| `.hover-lift` | Spring `translateY(-4px)` on hover |
| `.animate-char-in` | Blur + slide-up character entrance animation |
| `.line-reveal` | Clip-path left-to-right text reveal |
| `.border-sketch` | Diagonal hatch border using gradient background |

---

## Future Backend Integration

The frontend is intentionally designed as a stateless UI layer ready to be connected to a fully serverless, AI-native backend. The planned backend stack is:

| Service | Role |
|---|---|
| **AWS Aurora PostgreSQL** | Primary relational database for organizations, AI systems, regulations, disclosures, and audit events |
| **pgvector** | Vector extension on Aurora for storing and querying Titan Embeddings used in semantic law matching |
| **Amazon Bedrock** | Managed AI inference — Claude for natural language understanding, compliance explanation, and disclosure generation |
| **Amazon Titan Embeddings** | Text embedding model used to convert AI use case descriptions and regulation text into vector representations for RAG-based law matching |

**Integration points already stubbed in the frontend:**

- `POST /api/analyze` — submit AI use case for law matching (→ Bedrock + pgvector)
- `POST /api/disclosures/generate` — generate a compliance disclosure (→ Claude on Bedrock)
- `GET /api/audit` — retrieve tamper-verified audit log (→ Aurora + cryptographic hash chain)
- `POST /api/systems` — create / update AI system records (→ Aurora)

---

## Scripts

All scripts are defined in `package.json` and run with your package manager of choice.

| Script | Command | Description |
|---|---|---|
| `dev` | `next dev` | Start the local development server with HMR at `http://localhost:3000` |
| `build` | `next build` | Create an optimized production build in `.next/` |
| `start` | `next start` | Serve the production build locally |
| `lint` | `eslint .` | Run ESLint across the entire project |

```bash
# Examples using pnpm
pnpm dev
pnpm build
pnpm start
pnpm lint
```

---

## Deployment

ComplyTrace is built for zero-configuration deployment on [Vercel](https://vercel.com).

### Deploy with Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push the repository to GitHub (or GitLab / Bitbucket)
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Vercel auto-detects Next.js — no build configuration is needed
4. Add any required environment variables in **Project Settings → Environment Variables**
5. Click **Deploy**

Every push to the default branch triggers a new production deployment. Pull requests automatically create preview deployments with unique URLs.

### Manual Deploy via Vercel CLI

```bash
# Install the Vercel CLI
pnpm add -g vercel

# Authenticate
vercel login

# Deploy to production
vercel --prod
```

---

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature-name`
3. Commit your changes using [Conventional Commits](https://www.conventionalcommits.org): `git commit -m "feat: add law match confidence tooltip"`
4. Push to your fork: `git push origin feat/your-feature-name`
5. Open a Pull Request against `main`

### Code Style

- TypeScript strict mode is enforced (`"strict": true` in `tsconfig.json`)
- All styling must use Tailwind utility classes and existing design tokens — no inline styles or new CSS classes
- Components must be mobile-first and pass basic accessibility checks (semantic HTML, ARIA labels, keyboard navigation)
- New pages must follow the established two-column sidebar layout pattern and use `noise-overlay` on the root element

### Reporting Issues

Please open a GitHub Issue with a clear description, reproduction steps, and screenshots where applicable.

---

## License

MIT License

Copyright (c) 2025 ComplyTrace

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
