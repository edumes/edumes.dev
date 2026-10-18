// The one helper shadcn-style components (src/components/icons) import.
export const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ');
