# Meetings Ahead

Meetings Ahead is an AI-powered workplace productivity app that turns meeting notes, transcripts, and agendas into ready-to-use work outputs. It runs in the browser and uses selected documents as the only context for every AI response, so answers stay grounded in your actual sources.

## Features

- **Meeting Notes Summarizer** — Build an instant briefing with a summary, key decisions, risks, and an action-item table.
- **Ask Meetings** — Chat with your selected sources. The AI answers only from the documents you choose and cites the source titles.
- **Report Writer** — Draft polished workplace reports such as weekly status updates, executive briefs, project kickoff summaries, and meeting recaps.
- **Smart Email Generator** — Generate professional emails with tone options (formal, friendly, persuasive, direct, apologetic, appreciative) and adjustable length.
- **AI Task Planner / Scheduler** — Create a prioritized daily or weekly schedule with time-blocked tasks, available-hours guardrails, and dependency watch-outs.
- **Source-first design** — Paste text or upload `.txt`, `.md`, `.csv`, `.json`, and `.log` files. Only selected sources are sent to the AI; everything stays in browser local storage by default.
- **Responsive dashboard** — Sidebar navigation on desktop, slide-out menu on mobile, and a clean input/output layout that adapts to any screen size.
- **Responsible AI disclaimer** — Every output reminds users to review AI-generated content before sharing decisions or sending externally.

## Tools Used

- [TanStack Start](https://tanstack.com/start) — Full-stack React framework with server functions
- [TanStack Router](https://tanstack.com/router) — File-based routing
- [TanStack Query](https://tanstack.com/query) — Server-state management
- [React 19](https://react.dev) — UI library
- [TypeScript](https://www.typescriptlang.org) — Type-safe development
- [Tailwind CSS v4](https://tailwindcss.com) — Utility-first styling
- [shadcn/ui](https://ui.shadcn.com) — Accessible UI components
- [AI SDK](https://sdk.vercel.ai) — AI model orchestration
- [Lovable AI Gateway](https://docs.lovable.dev/features/cloud) — Managed model access
- [Lucide](https://lucide.dev) — Icons

## Setup Instructions

1. **Clone the repository**

   ```sh
   git clone <this-repository-url>
   cd <repository-name>
   ```

2. **Install dependencies**

   ```sh
   bun install
   ```

3. **Run the development server**

   ```sh
   bun run dev
   ```

   The app will be available at `http://localhost:8080`.

4. **Lovable AI Gateway key**

   The app uses `LOVABLE_API_KEY` for AI calls. In local development this key is provided automatically when the project is run inside Lovable. If you deploy or run outside Lovable, set `LOVABLE_API_KEY` in your environment.

## Project Structure

- `src/routes/index.tsx` — Main dashboard with navigation, document sources, and all AI tool panels
- `src/components/app/` — UI panels: Briefing, Ask, Report, Email, Planner, Document sidebar, Markdown renderer
- `src/lib/documents.functions.ts` — Server functions that call the Lovable AI Gateway
- `src/lib/ai-gateway.server.ts` — Shared AI gateway provider helper
- `src/styles.css` — Custom design tokens and Tailwind theme
