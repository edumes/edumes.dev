---
name: lucide-animated
description: Install and use animated React icons from https://lucide-animated.com
---

# lucide-animated skill

> For the complete documentation index, see [llms.txt](https://lucide-animated.com/llms.txt). Per-icon markdown is at `/icons/<name>.md` — for example https://lucide-animated.com/icons/activity.md. An MCP server is available at `/mcp`.

Use this skill when a user asks to add an animated icon to a React or Next.js project, or when they reference lucide-animated.

## Discover available icons

- Index of all icons: https://lucide-animated.com/llms.txt
- Full corpus (long-context): https://lucide-animated.com/llms-full.txt
- Per-icon docs: `/icons/<name>.md` where `<name>` is the kebab-case icon name — for example https://lucide-animated.com/icons/activity.md

Icon names follow Lucide's kebab-case convention (`activity`, `arrow-right`, `circle-check`, etc.).

## Install one icon

Use the shadcn CLI:

```bash
npx shadcn@latest add "https://lucide-animated.com/r/activity.json"
```

This drops a single React component file into the user's project under `components/icons/<icon-name>.tsx` and adds `motion` to dependencies if missing.

## Use the component

```tsx
import { Activity } from "@/components/icons/activity";

export function Demo() {
  return <Activity className="size-6" />;
}
```

The component name is the PascalCase form of the icon's kebab-case name. Components animate on hover by default. All props from `SVGProps<SVGSVGElement>` are forwarded, so you can pass `className`, `onClick`, `aria-label`, etc.

## Constraints

- Requires React 18 or newer.
- Requires `motion` (added automatically by the shadcn CLI when installing the first icon).
- Tailwind CSS is recommended for sizing/coloring but not required.
- MIT licensed (https://github.com/pqoqubbw/icons/blob/main/LICENSE) — free for personal and commercial use.

## MCP tools (optional)

An MCP server is available at `/mcp` (Streamable HTTP). Tools: `search_icons` (fuzzy lookup by name/keyword), `list_icons` (paginated list), `get_icon` (install command + usage snippet for one icon). Use these when you have an MCP-compatible host instead of fetching markdown.

## Common pitfalls

- Use kebab-case for the install URL (`arrow-right`), not PascalCase.
- The import name is PascalCase with no `Icon` suffix in the user's local file (e.g. `Activity`, not `ActivityIcon`).
- Hover animation only fires on devices that support `:hover`. For touch, the consumer can trigger animation imperatively via component refs.

## Source

- Website: https://lucide-animated.com
- Repository: https://github.com/pqoqubbw/icons
- Author: @pqoqubbw (https://x.com/pqoqubbw)

## In this project (edumes.dev)

- Don't use the shadcn CLI here (no components.json). Run `npm run icons:add -- <kebab-name> ...`: it vendors the icon into `src/components/icons/`, swaps the wrapper `<div>` for a `<span>`, sets the site's 1.75 stroke and rebuilds `src/components/icons/index.ts`.
- Render icons through `<Icon name="..." />` from `src/components/icon.tsx`, never the vendored component directly. It plays on hover/focus of the nearest link, button, option or `[data-icon-host]`, once on scroll-in, on `play`, every `loop` ms, and stays still under reduced motion or with `still`.
- Tech logos are Simple Icons (`simple-icons` package) drawn in `currentColor`, mapped in `Stack` in `src/components/home.tsx`.
