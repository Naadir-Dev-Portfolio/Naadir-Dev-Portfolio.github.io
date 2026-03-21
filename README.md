# Naadir Dev Portfolio

> Dark editorial design · GitHub Actions–compiled · Gemini AI assistant · GitHub Pages

**Live site:** [naadir-dev-portfolio.github.io](https://naadir-dev-portfolio.github.io)

---

## Overview

This is a fully dynamic portfolio site. Project cards are **not hardcoded** — they are pulled automatically from individual project repositories and compiled into a single JavaScript file by a GitHub Actions workflow.

```
Each project repo
  └── portfolio/
        └── <project-name>.json   ← you edit this per project

GitHub Actions (nightly 2am UTC or manual trigger)
  └── reads all portfolio/*.json files across all repos
  └── compiles them into assets/js/data.js
  └── commits data.js back to this repo

GitHub Pages serves the updated site automatically.
```

---

## How to Add or Update a Project Card

1. In the project's GitHub repo, create or edit the file `portfolio/<project-name>.json`
2. Go to **Actions → Compile Portfolio Data → Run workflow** to see it live immediately (or wait for the nightly 2am UTC auto-run)

That's it. No touching this repo directly.

---

## portfolio/*.json Schema

Each JSON file = one project card on the site. Multiple JSON files in one repo = multiple cards (useful for toolkits with several distinct tools).

```json
{
  "section":   "python",
  "category":  "desktop",
  "n":         1,
  "title":     "My Project",
  "img":       "screenshot.webp",
  "videoId":   "JtVEtAiz0UU",
  "desc":      "One-line description of what this project does.",
  "demo":      "https://my-live-site.netlify.app",
  "code":      "https://github.com/Naadir-Dev-Portfolio/my-repo/blob/main/main.py",
  "details":   "https://github.com/Naadir-Dev-Portfolio/my-repo/blob/main/README.md",
  "tags":      ["python", "pyqt", "data-viz"]
}
```

### Field Reference

| Field | Required | Description |
|---|---|---|
| `section` | Yes | Top-level tab key — see sections table below |
| `category` | Yes | Sub-tab key — see sections table below |
| `n` | Yes | Sort order. `n:1` = featured editorial card (large, full-width). `n:2+` = gallery swipe cards |
| `title` | Yes | Card title |
| `img` | No | Screenshot filename from `assets/images/projects/` in this repo |
| `videoId` | No | YouTube video ID (e.g. `JtVEtAiz0UU`). Shows Video button and uses YouTube thumbnail |
| `video` | No | Full YouTube URL — alternative to `videoId`, either works |
| `desc` | No | One-line project description shown on the card |
| `demo` | No | Live site URL — shows **Live** button |
| `code` | No | Direct link to main source file on GitHub — shows **Code** button |
| `details` | No | Link to README or docs — shows **Details** button |
| `tags` | No | Array of technology tags shown as pills on the card |

### Card Click Behaviour
Clicking the card body (not a button) opens the first available link in this priority order:
**Live → Video → Details → Code**

---

## Sections & Categories

| `section` | `category` | Description |
|---|---|---|
| `python` | `desktop` | PyQt6 / Tkinter desktop apps |
| `python` | `automation` | Scripts, pipelines, batch tools |
| `python` | `trading` | Trading bots, crypto tools |
| `python` | `quant` | Quantitative finance, forecasting |
| `excelvba` | `vba-macros` | Excel VBA macros |
| `excelvba` | `powerquery` | Power Query M templates |
| `excelvba` | `power-automate` | Power Automate flows |
| `powerbi` | `dashboards` | Power BI dashboards |
| `powerbi` | `dataflow` | Dataflows and data models |
| `ai` | `agents` | Multi-agent systems, AI OS |
| `ai` | `generativeai` | LLM apps, Streamlit tools |
| `ai` | `prompt` | Prompt engineering tools |
| `web` | `teamsites` | Internal team portals |
| `web` | `tools` | Utility web tools |
| `web` | `cognitive` | Educational games |
| `mobile` | `android` | React Native / Android apps |
| `browserextensions` | `google-chrome` | Chrome extensions |

---

## Screenshot Images

Project screenshots live in `assets/images/projects/` in **this repo**. When adding a new project:
1. Add the screenshot file to that folder
2. Reference just the filename in the JSON: `"img": "my-screenshot.webp"`

Preferred format: `.webp` for performance. `.png` and `.jpg` also work.

---

## GitHub Actions — Compile Workflow

File: `.github/workflows/compile-portfolio.yml`

- Runs **automatically every night at 2am UTC**
- Can be **triggered manually** any time: Actions tab → Compile Portfolio Data → Run workflow
- Requires a secret `PORTFOLIO_TOKEN` (classic GitHub PAT with `repo` and `read:org` scopes) stored in this repo's Settings → Secrets → Actions

The workflow runs `scripts/compile_projects.py` which:
1. Fetches all repos in the `Naadir-Dev-Portfolio` org via the GitHub Search API
2. For each repo, looks for `portfolio/*.json` files
3. Compiles all found cards into `assets/js/data.js`
4. Commits and pushes the updated file back to this repo

---

## Folder Structure

```
Naadir-Dev-Portfolio.github.io/
├── index.html
├── assets/
│   ├── css/
│   │   └── main.css
│   ├── js/
│   │   ├── data.js          ← AUTO-GENERATED by GitHub Actions. Do not edit manually.
│   │   └── main.js          ← site logic, card rendering, AI chat, parallax
│   ├── images/
│   │   ├── projects/        ← drop project screenshots here
│   │   └── [hero images, logos etc.]
│   └── videos/              ← hero section background videos
├── scripts/
│   ├── compile_projects.py  ← GitHub Actions runs this
│   ├── seed_portfolios.py   ← one-time bootstrap (already run)
│   └── test_token.py        ← local diagnostics for the API token
└── .github/
    └── workflows/
        └── compile-portfolio.yml
```

---

## Tech Stack

- Pure HTML5 / CSS3 / Vanilla JavaScript — zero dependencies, zero build step
- Gemini AI via Netlify Functions proxy (external backend)
- Hosted on GitHub Pages (free)
- GitHub Actions for nightly data compilation

---

refresh
