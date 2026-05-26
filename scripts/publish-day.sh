#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 || $# -gt 2 ]]; then
  echo "Usage: $0 <slug> [path-to-tsx]" >&2
  echo "Example: $0 2026-05-26-day13 ../../projects/kv-cache-learning/opensource-learning/day_13_nano_vllm_kv_cache.tsx" >&2
  exit 2
fi

SLUG="$1"
SRC_TSX="${2:-}"
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

if [[ ! "$SLUG" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}-[a-zA-Z0-9._-]+$ ]]; then
  echo "Warning: recommended slug format is YYYY-MM-DD-name, got: $SLUG" >&2
fi

mkdir -p src/days

if [[ -n "$SRC_TSX" ]]; then
  if [[ ! -f "$SRC_TSX" ]]; then
    echo "TSX file not found: $SRC_TSX" >&2
    exit 1
  fi
  cp "$SRC_TSX" src/App.tsx
  cp "$SRC_TSX" "src/days/${SLUG}.tsx"
elif [[ ! -f src/App.tsx ]]; then
  echo "No src/App.tsx exists and no TSX source was provided." >&2
  exit 1
fi

# Nested /days/<slug>/ pages need relative asset URLs.
if [[ -f vite.config.ts ]]; then
  python3 - <<'PY'
from pathlib import Path
p = Path('vite.config.ts')
s = p.read_text()
if "base: '/vllm-learning-interactive/'" in s:
    s = s.replace("base: '/vllm-learning-interactive/'", "base: './'")
elif 'base:' not in s:
    s = s.replace('plugins: [react()],', "plugins: [react()],\n  base: './',")
p.write_text(s)
PY
fi

npm install
npm run build
rm -rf node_modules tsconfig.tsbuildinfo

# Commit/push source branch if changed.
git add .
if ! git diff --cached --quiet; then
  git commit -m "Add interactive page ${SLUG}"
fi
git push origin main

WT="$(mktemp -d /tmp/vllm-pages.XXXXXX)"
cleanup() {
  cd "$ROOT" || true
  git worktree remove --force "$WT" >/dev/null 2>&1 || rm -rf "$WT"
}
trap cleanup EXIT

if git ls-remote --exit-code origin refs/heads/gh-pages >/dev/null 2>&1; then
  git fetch origin gh-pages
  git worktree add -B gh-pages "$WT" origin/gh-pages
else
  git worktree add --detach "$WT"
  (cd "$WT" && git switch --orphan gh-pages && git rm -rf . >/dev/null 2>&1 || true)
fi

mkdir -p "$WT/days/$SLUG"
rm -rf "$WT/days/$SLUG"/*
cp -R dist/. "$WT/days/$SLUG/"
touch "$WT/.nojekyll"

python3 - "$WT" <<'PY'
from pathlib import Path
import sys
root = Path(sys.argv[1])
days = sorted([p.name for p in (root / 'days').iterdir() if p.is_dir()], reverse=True) if (root / 'days').exists() else []
links = '\n'.join(f'<li><a href="./days/{d}/">{d}</a></li>' for d in days)
html = f'''<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>vLLM Learning Interactive</title>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 860px; margin: 48px auto; padding: 0 20px; line-height: 1.6; }}
    a {{ color: #2563eb; text-decoration: none; }}
    a:hover {{ text-decoration: underline; }}
    li {{ margin: 10px 0; }}
  </style>
</head>
<body>
  <h1>vLLM Learning Interactive</h1>
  <p>按天归档的交互式学习页面。</p>
  <ul>
{links}
  </ul>
</body>
</html>
'''
(root / 'index.html').write_text(html)
PY

(cd "$WT" && git add . && (git commit -m "Deploy interactive page ${SLUG}" || true) && git push -f origin gh-pages)
rm -rf dist

echo "Published: https://bloodycoder.github.io/vllm-learning-interactive/days/${SLUG}/"
