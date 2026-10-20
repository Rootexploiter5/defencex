# figma-make-app

Next.js + React 19 + Tailwind CSS project running inside Figma Make.

## Development Server

A Next.js development server runs on `$PORT` (default 8443).

- Command: `npm run dev`
- Port: `8443`
- Preview URL: The user can access the running app through the preview panel or `http://localhost:8443`
- Hot reload: Turbopack hot reload is enabled

## Project Structure

This is the canonical project structure:

- `src/app/layout.tsx` - Next.js root layout; imports `src/index.css`, fonts, and metadata
- `src/app/page.tsx` - Next.js root route; renders `src/App.tsx`
- `src/App.tsx` - Primary application component and the usual starting point for UI work ("use client")
- `src/index.css` - Global CSS entrypoint and Tailwind CSS v4 import
- `next.config.mjs` - Next.js configuration with Turbopack root
- `package.json` - Project dependencies and scripts (`dev`, `build`, `start`, `format`)
- `tsconfig.json` - TypeScript configuration with Next.js plugin and `@/*` alias
- `.mise.toml` - Toolchain versions for Node.js and pnpm

## Dependencies

- Runtime: Next.js 16, React 19, and React DOM 19
- Styling: Tailwind CSS v4
- Build tooling: Next.js Turbopack, TypeScript 5.7
- Formatting: oxfmt

## Styling

This project uses **Tailwind CSS v4**. `src/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/index.css`. This scaffold does not need a Tailwind config file or PostCSS config.

`src/app/layout.tsx` imports `src/index.css`, and global font wiring is configured in `src/app/layout.tsx` and `src/index.css`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
