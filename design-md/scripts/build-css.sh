#!/bin/sh
# DESIGN.md → shadcn/ui 호환 globals.css
# export 는 @theme 블록만 만든다. 나머지 고정 래퍼를 여기서 붙인다.
set -e
LIGHT="${1:-examples/shadcn.DESIGN.md}"
DARK="${2:-examples/shadcn.dark.DESIGN.md}"
OUT="${3:-dist/globals.css}"
mkdir -p "$(dirname "$OUT")"

{
  echo '@import "tailwindcss";'
  echo '@import "tw-animate-css";'
  echo
  echo '@custom-variant dark (&:is(.dark *));'
  echo
  npx -y @google/design.md export "$LIGHT" --format css-tailwind
  echo
  npx -y @google/design.md export "$DARK"  --format css-tailwind \
    | sed '1s/@theme {/.dark {/'
  echo
  cat <<'BASE'
@layer base {
  * {
    border-color: var(--color-border);
  }
  body {
    background-color: var(--color-background);
    color: var(--color-foreground);
    font-family: var(--font-sans);
  }
}
BASE
} > "$OUT"

echo "→ $OUT ($(grep -c . "$OUT") lines)"
