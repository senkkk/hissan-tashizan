# AGENTS.md

This repository is a static HTML/CSS/JavaScript site intended for GitHub Pages.

## Rules

- Do not introduce React, Next.js, Vite, or another framework unless explicitly requested.
- Keep the site deployable as plain static files.
- Prefer relative paths such as `./style.css` and `./images/foo.png` for GitHub Pages compatibility.
- After UI changes, run Playwright checks.

## Commands

```bash
npm install
npx playwright install --with-deps chromium
npm run test:e2e
# User-provided custom instructions

ユーザーへの回答や、Pull Requestへの記載はすべて日本語で行ってください。
