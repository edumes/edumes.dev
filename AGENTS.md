<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Blog illustrations

Every blog article, including future articles, must include a relevant animated illustration with fictional data in both Portuguese and English. Use the case studies' visual style and the shared player in `src/components/visuals/blog.tsx`; keep scenario controls, pause/resume, keyboard access and reduced-motion support.

Add the article's scene and localized copy to that file and place a standalone `<Illustration />` in each MDX body near the concept it explains. Do not replace a missing scene with a generic fallback or remove the illustration validation. `next build` must reject articles without an illustration or a registered scene. Run `npm run test:blog` and `npm run build` after adding articles.
