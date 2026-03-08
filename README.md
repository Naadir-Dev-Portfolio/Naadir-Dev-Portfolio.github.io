# Portfolio 2.0 — Naadir Dev Portfolio

> Dark glassmorphism · Dynamic JSON-driven · Gemini AI assistant · Netlify deployed

Live site: **[your-netlify-url.netlify.app]**

---

## ✅ How to Add a New Project (30 seconds)

1. Open `assets/data/projects.js`
2. Find the correct category array (e.g. `python > desktop`)
3. Copy-paste a project block and fill in your fields:

```js
{
  id: "my-new-project",              // unique slug, no spaces
  title: "My New Project",
  tags: ["Python", "PyQt6"],         // up to 4 tags shown
  description: "What it does.",
  image: "my-new-project.png",       // filename only — drop image in assets/images/projects/
  github: "https://github.com/Naadir-Dev-Portfolio/...",
  demo: null,                        // or a live URL
  videoId: null,                     // YouTube video ID if you have one
  status: "live"                     // "live" | "wip" | "coming-soon"
}
```

4. Drop a screenshot into `assets/images/projects/my-new-project.png`
5. Commit and push — Netlify auto-deploys in ~30 seconds.

> **No screenshot yet?** Leave `image: null` — a styled placeholder card will show until you add one.

---

## 🌟 Featured / Spotlight Section

To feature a project in the top spotlight section, add it to the `featured` array in `projects.js`:

```js
featured: [
  {
    id: "eso-spheria",
    featured: true,
    highlights: ["Key point 1", "Key point 2"],  // shows as bullet points in spotlight
    ...
  }
]
```

The **first** item in `featured` gets the full-width hero treatment. The rest get smaller cards.

---

## 🗂️ Categories & Subcategories

| Category Key | Label          | Subcategories                              |
|--------------|----------------|--------------------------------------------|
| `excel`      | Excel & VBA    | `vba`, `powerquery`, `powerautomate`, `powerbi` |
| `python`     | Python         | `desktop`, `automation`, `utilities`       |
| `ai`         | AI & ML        | `agents`, `generativeai`, `nlp`, `prompt`  |
| `trading`    | Trading & Quant| `backtesting`, `livedata`, `forecasting`   |
| `web`        | Web & Games    | `teamsites`, `tools`, `cognitive`          |

---

## 🤖 AI Assistant

The AI assistant calls `/.netlify/functions/ask` — which lives in `Portfolio-Backend-API` (the renamed `secret-service` repo).

To update the AI's knowledge about you, edit `SITE_CONFIG.aiSystemPrompt` in `projects.js`.

---

## 🚀 Deployment (Netlify)

1. Push this repo to GitHub as `Portfolio-v2`
2. In Netlify: New site → Import from GitHub → select `Portfolio-v2`
3. Build command: *(leave blank — static site)*
4. Publish directory: `/` (root)
5. Done.

**Environment variables** (for the AI assistant backend — set in `Portfolio-Backend-API`):
- `GEMINI_API_KEY` — your Google Gemini API key

---

## 📁 Folder Structure

```
Portfolio-v2/
├── index.html                    # ← the whole site lives here
├── assets/
│   ├── css/
│   │   └── style.css             # ← full design system
│   ├── js/
│   │   └── app.js                # ← dynamic rendering engine
│   ├── data/
│   │   └── projects.js           # ← ✏️ EDIT THIS to add projects
│   └── images/
│       └── projects/             # ← drop screenshots here
│           └── [project-name].png
└── README.md
```

---

## 🛠️ Tech Stack

- Pure HTML5 / CSS3 / Vanilla JavaScript — zero dependencies, zero build step
- Gemini AI via Netlify Functions (Portfolio-Backend-API)
- Hosted on Netlify (free tier)
