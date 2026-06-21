#!/usr/bin/env python3
"""
compile_projects.py
====================
Scans every repo in the Naadir-Dev-Portfolio GitHub organisation for a
`portfolio/` directory, fetches all files matching `portfolio/*.json`,
and compiles them into `assets/js/data.js`.

Image filenames in the JSON `img` / `imgs` fields are automatically resolved
to raw.githubusercontent.com URLs — no local downloading or storage needed.

Each JSON file = one project card.  Multiple JSON files in the same repo =
multiple cards for that repo (great for toolkits / mono-repos).

JSON schema (all fields optional except `title`):
  {
    "section":  "python",           // top-level key in DATA  (default: "python")
    "category": "desktop",          // sub-category key        (default: "desktop")
    "n":        1,                  // sort order within category (default: 99)
    "title":    "My Project",       // card title (REQUIRED)
    "img":      "screenshot.webp",  // image file in THIS repo's portfolio/ folder
    "imgs":     ["a.png","b.png"],  // additional images (editorial card)
    "videoId":  "YouTubeID",        // YouTube video ID (automation cards)
    "desc":     "One-line blurb.",
    "code":     "https://github.com/...",
    "demo":     "https://...",
    "details":  "https://github.com/.../README.md",
    "tags":     ["python","pyqt"]
  }

Image workflow:
  Place the screenshot in the repo's portfolio/ folder with the same filename
  as the `img` field (e.g. portfolio/screenshot.webp). The compile script
  resolves each filename to a raw.githubusercontent.com URL automatically.
  No manual copying or local storage required.

Run locally:
  PORTFOLIO_TOKEN=ghp_xxx python scripts/compile_projects.py

GitHub Actions sets PORTFOLIO_TOKEN automatically via secrets.
"""

import base64
import json
import os
import re
import sys
from pathlib import Path
from datetime import datetime, timezone
from urllib.parse import quote
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

# ── Config ────────────────────────────────────────────────────────────────────
ORG           = 'Naadir-Dev-Portfolio'
PORTFOLIO_DIR = 'portfolio'
JSON_PATTERN  = re.compile(r'^portfolio/[^/]+\.json$', re.IGNORECASE)
IMG_EXTS      = {'.webp', '.png', '.jpg', '.jpeg'}
OUTPUT_FILE   = 'assets/js/data.js'
RAW_BASE      = 'https://raw.githubusercontent.com'
TOKEN         = os.environ.get('PORTFOLIO_TOKEN', '')

# Central portfolio visibility/order controls. Repos stay intact; this only
# controls what the compiled website data includes.
EXCLUDED_REPOS = {
    'MS-ToDo-Dashboard',
    'VBA-Toolkit',
    'VBA-Report-Automation',
    'SAP-GUI-Automation',
    'Power-Query-Toolkit',
    'Excel-Report-Templates',
}

PYTHON_DESKTOP_ORDER = {
    'Finance-Dashboard': 1,
    'Health-Dashboard': 2,
    'Health-Planner-Desktop': 3,
    'Document-OCR-Studio': 4,
    'Mortgage-Overpayment-Tracker': 5,
    'YouTube-Stats-Dashboard': 6,
    'Income-Prophet': 7,
    'Desktop-Widgets': 8,
}

WEB_CATEGORY_OVERRIDES = {
    'Economics-Dashboard-Web': 'independent-projects',
    'PowerBI-Request-Portal': 'business-solutions',
    'Team-Hub-Website': 'business-solutions',
    'internal-team-portal': 'business-solutions',
    'team-enablement-platform': 'business-solutions',
    'RainDrops': 'interactive-learning',
    'Hexamatch': 'interactive-learning',
    'Algebraverse': 'interactive-learning',
    'LogicGrid': 'interactive-learning',
}

WEB_CATEGORY_ORDER = {
    ('web', 'independent-projects'): {
        'Economics-Dashboard-Web': 1,
    },
    ('web', 'business-solutions'): {
        'team-enablement-platform': 1,
        'internal-team-portal': 2,
        'Team-Hub-Website': 2,
        'PowerBI-Request-Portal': 3,
    },
    ('web', 'interactive-learning'): {
        'RainDrops': 1,
        'Hexamatch': 2,
        'Algebraverse': 3,
        'LogicGrid': 4,
    },
}

WEB_TITLE_OVERRIDES = {
    'Team-Hub-Website': 'Internal Team Portal',
    'internal-team-portal': 'Internal Team Portal',
}

# ── Section / category manifest (single source of truth) ──────────────────────
#
# This is the ordered manifest of tabs and sub-tabs the portfolio site renders.
# Each section is a top-level tab; each category is a sub-tab.
#
#   • To rename a tab     → edit "label" here
#   • To re-order tabs    → re-order the SECTIONS list
#   • To add a new tab    → append a new section dict here
#   • To add a sub-tab    → append to that section's "categories" list
#
# AUTO-DISCOVERY: any (section, category) pair declared in a project JSON that
# is NOT present in this manifest is appended automatically with a Title-Case
# label. So you can introduce new tabs purely from a project JSON — but for
# friendly names + ordering, declare them here.
#
# IMPORTANT: keep the *keys* in sync with Repo-Toolkit/toolkit.py SECTIONS_MANIFEST.
# Both files import the same shape — labels can drift, keys cannot.

SECTIONS = [
    {
        "key": "python",
        "label": "Python",
        "desc": "Python desktop apps, automation pipelines, quantitative tools and more - built to solve real problems.",
        "categories": [
            {"key": "desktop",     "label": "Desktop Apps"},
            {"key": "automation",  "label": "Automation"},
            {"key": "quant",       "label": "Quant Finance"},
        ],
    },
    {
        "key": "excelvba",
        "label": "Excel & VBA",
        "desc": "Excel VBA applications, reporting tools and office automation systems that eliminate repetitive manual work.",
        "categories": [
            {"key": "vba-macros",  "label": "Excel VBA Applications"},
        ],
    },
    {
        "key": "data-transformation",
        "label": "ETL",
        "desc": "SQL and Power Query ETL projects for cleaning, reshaping, reconciling and staging business data.",
        "categories": [
            {"key": "sql-power-query-etl",  "label": "SQL & Power Query ETL"},
        ],
    },
    {
        "key": "powerbi",
        "label": "Power BI",
        "desc": "Interactive Power BI dashboards to demonstrate my ability to create data-driven insights.",
        "categories": [
            {"key": "dashboards",  "label": "Dashboards"},
        ],
    },
    {
        "key": "ai",
        "label": "AI Projects",
        "desc": "AI agents, generative chatbots, and automated AI workflows powered by Gemini, OpenAI, and Python.",
        "categories": [
            {"key": "agents",        "label": "Agents"},
            {"key": "generativeai",  "label": "Generative AI Chatbots"},
            {"key": "workflows",     "label": "AI Workflows"},
        ],
    },
    {
        "key": "web",
        "label": "Web Development",
        "desc": "Independent web projects, business-facing portals, and browser-based interactive learning tools.",
        "categories": [
            {"key": "independent-projects", "label": "Independent Projects"},
            {"key": "business-solutions",   "label": "Business Solutions"},
            {"key": "interactive-learning", "label": "Interactive Learning"},
        ],
    },
    {
        "key": "mobile",
        "label": "Mobile Applications",
        "desc": "Cross-platform mobile applications built with React Native and Expo, plus native Kotlin Android work.",
        "categories": [
            {"key": "react-native",  "label": "React Native"},
            {"key": "kotlin",        "label": "Kotlin"},
        ],
    },
    {
        "key": "browserextensions",
        "label": "Browser Extensions",
        "desc": "Browser extensions that add productivity directly to the browser workflow.",
        "categories": [
            {"key": "chromium",  "label": "Chromium"},
        ],
    },
]

# Optional: legacy → canonical key remap.  If a project JSON still uses an old
# key, the compile remaps it silently and warns once. This means renaming a
# category won't break anything until the JSON itself is migrated.
LEGACY_KEY_ALIAS = {
    # section: { old_category_key: new_category_key }
    "web":               {
        "live-websites": "independent-projects",
        "teamsites": "business-solutions",
        "tools": "business-solutions",
        "enterprise-hubs": "business-solutions",
        "cognitive": "interactive-learning",
        "cognitive-training-sites": "interactive-learning",
        "cognitive-training-apps": "interactive-learning",
    },
    "mobile":            {"android": "react-native"},
    "browserextensions": {"google-chrome": "chromium"},
    "ai":                {"prompt": "generativeai"},
}

# Optional: legacy bucket remap where both section and category changed.
# This prevents old Excel Power Query JSONs from resurrecting a removed
# Excel & VBA sub-tab if a stale project repo is discovered.
LEGACY_BUCKET_ALIAS = {
    ("excelvba", "powerquery"): ("data-transformation", "sql-power-query-etl"),
}

# Keys that must never appear in generated DATA or MANIFEST. They are accepted
# only as legacy inputs through aliases above.
FORBIDDEN_OUTPUT_CATEGORIES = {
    ("excelvba", "powerquery"),
    ("web", "teamsites"),
    ("web", "tools"),
    ("web", "enterprise-hubs"),
    ("web", "live-websites"),
    ("web", "cognitive"),
    ("web", "cognitive-training-sites"),
    ("web", "cognitive-training-apps"),
}

def auto_label(key: str) -> str:
    """Convert 'react-native' / 'vba_macros' → 'React Native' / 'Vba Macros'."""
    return " ".join(w.capitalize() for w in key.replace("-", " ").replace("_", " ").split() if w)


def build_skeleton(sections: list) -> dict:
    """Empty data dict pre-populated with all declared section/category keys."""
    return {sec["key"]: {cat["key"]: [] for cat in sec["categories"]} for sec in sections}


# Legacy export — many call sites reference SKELETON. Rebuilt from SECTIONS so
# there is still only one source of truth.
SKELETON = build_skeleton(SECTIONS)

# ── GitHub API helpers ─────────────────────────────────────────────────────────

def gh_request(path: str) -> list | dict | None:
    """Make a GitHub API call, handling pagination automatically."""
    base = f'https://api.github.com{path}'
    headers = {
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
    }
    if TOKEN:
        headers['Authorization'] = f'Bearer {TOKEN}'

    results = []
    url = base + ('&' if '?' in base else '?') + 'per_page=100'

    while url:
        req = Request(url, headers=headers)
        try:
            with urlopen(req, timeout=20) as resp:
                data = json.loads(resp.read().decode())
                link_header = resp.headers.get('Link', '')
                if isinstance(data, list):
                    results.extend(data)
                    next_url = None
                    for part in link_header.split(','):
                        part = part.strip()
                        if 'rel="next"' in part:
                            next_url = part.split(';')[0].strip().strip('<>')
                    url = next_url
                else:
                    return data
        except HTTPError as e:
            if e.code == 404:
                return None
            print(f'  HTTP {e.code} for {url}', file=sys.stderr)
            return None
        except URLError as e:
            print(f'  Network error: {e}', file=sys.stderr)
            return None

    return results


def fetch_json_content(repo_name: str, file_path: str) -> dict | None:
    """Fetch and parse a JSON file from a repo via the contents API."""
    data = gh_request(f'/repos/{ORG}/{repo_name}/contents/{file_path}')
    if not data or 'content' not in data:
        return None
    raw = base64.b64decode(data['content']).decode('utf-8-sig')
    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        print(f'  JSON parse error in {repo_name}/{file_path}: {e}', file=sys.stderr)
        return None


def repo_cache_token(repo: dict) -> str:
    """Stable cache-busting token derived from the repo's last push time."""
    raw = str(repo.get('pushed_at') or repo.get('updated_at') or '').strip()
    return re.sub(r'[^0-9A-Za-z]+', '', raw)


def resolve_image_url(repo: dict, filename: str) -> str:
    """
    Return the raw.githubusercontent.com URL for portfolio/{filename} in the repo.
    Uses the repo's default branch and appends a cache-busting version token so
    same-filename screenshot replacements propagate without renaming files.
    """
    repo_name = repo['name']
    branch = repo.get('default_branch') or 'main'
    url = f'{RAW_BASE}/{ORG}/{repo_name}/{branch}/portfolio/{filename}'
    token = repo_cache_token(repo)
    return f'{url}?v={quote(token, safe="")}' if token else url


# ── Main compile logic ─────────────────────────────────────────────────────────

def get_org_repos() -> list:
    """Fetch all repos in the org using Search API (no read:org permission needed)."""
    results = []
    page = 1
    while True:
        url = f'/search/repositories?q=org:{ORG}&per_page=100&page={page}'
        data = gh_request(url)
        if not data or 'items' not in data:
            break
        items = data['items']
        results.extend(items)
        if len(items) < 100:
            break
        page += 1
    return results


def compile_all() -> tuple[dict, list]:
    """Scan every org repo's portfolio/*.json files and assemble:

      • DATA      — section → category → [cards] (the project list)
      • MANIFEST  — ordered list of {section, label, desc, categories[]} that
                    the website uses to render its tab bar dynamically.

    Auto-discovery: any (section, category) pair that appears in a JSON but
    is not declared in SECTIONS is appended to the manifest with a Title-Case
    label. Stale categories declared in SECTIONS but with zero projects still
    appear (so the user can preview an empty tab they're about to fill).
    """
    import copy
    data = copy.deepcopy(SKELETON)
    discovered: dict[str, set[str]] = {}  # section → set(category) seen in JSONs

    print(f'Fetching repos for org: {ORG}')
    repos = get_org_repos()
    if not repos:
        print('ERROR: could not fetch repos list. Exiting.', file=sys.stderr)
        sys.exit(1)

    print(f'Found {len(repos)} repos.')

    for repo in repos:
        repo_name = repo['name']

        if repo_name in EXCLUDED_REPOS:
            print(f'  [{repo_name}] skipped by portfolio visibility rules')
            continue

        tree = gh_request(f'/repos/{ORG}/{repo_name}/git/trees/HEAD?recursive=1')
        if not tree or 'tree' not in tree:
            continue

        json_files = [
            item['path'] for item in tree['tree']
            if JSON_PATTERN.match(item['path'])
        ]

        if not json_files:
            continue

        print(f'  [{repo_name}] found {len(json_files)} portfolio file(s)')

        for file_path in sorted(json_files):
            card = fetch_json_content(repo_name, file_path)
            if not card:
                continue

            section  = card.pop('section',  'python').lower().strip()
            category = card.pop('category', 'desktop').lower().strip()

            # ── Legacy alias remap ─────────────────────────────────────────
            alias_map = LEGACY_KEY_ALIAS.get(section, {})
            if category in alias_map:
                new_cat = alias_map[category]
                print(f'    → legacy alias: {section}/{category} → {section}/{new_cat}')
                category = new_cat

            bucket_alias = LEGACY_BUCKET_ALIAS.get((section, category))
            if bucket_alias:
                new_section, new_category = bucket_alias
                print(f'    -> legacy bucket alias: {section}/{category} -> {new_section}/{new_category}')
                section, category = new_section, new_category

            web_category = WEB_CATEGORY_OVERRIDES.get(repo_name)
            if section == 'web' and web_category and category != web_category:
                print(f'    -> web category override: {section}/{category} -> {section}/{web_category}')
                category = web_category

            # ── Auto-create unknown section/category ───────────────────────
            data.setdefault(section, {})
            data[section].setdefault(category, [])
            discovered.setdefault(section, set()).add(category)

            if section == 'python' and category == 'desktop':
                forced_order = PYTHON_DESKTOP_ORDER.get(repo_name)
                if forced_order is not None:
                    card['n'] = forced_order
            if section == 'web':
                forced_order = WEB_CATEGORY_ORDER.get((section, category), {}).get(repo_name)
                if forced_order is not None:
                    card['n'] = forced_order
                title_override = WEB_TITLE_OVERRIDES.get(repo_name)
                if title_override:
                    card['title'] = title_override

            # ── Resolve image filenames → raw GitHub URLs ──────────────────
            img = card.get('img', '').strip()
            if img and Path(img).suffix.lower() in IMG_EXTS:
                card['img'] = resolve_image_url(repo, img)
                print(f'    → img: {card["img"]}')

            img_featured = card.get('imgFeatured', '').strip()
            if img_featured and Path(img_featured).suffix.lower() in IMG_EXTS:
                card['imgFeatured'] = resolve_image_url(repo, img_featured)
                print(f'    → imgFeatured: {card["imgFeatured"]}')

            resolved_imgs = []
            for extra_img in card.get('imgs', []):
                extra_img = extra_img.strip()
                if extra_img and Path(extra_img).suffix.lower() in IMG_EXTS:
                    resolved_imgs.append(resolve_image_url(repo, extra_img))
                else:
                    resolved_imgs.append(extra_img)
            if resolved_imgs:
                card['imgs'] = resolved_imgs

            data[section][category].append(card)
            print(f'    + {section}/{category}: {card.get("title","(untitled)")}')

    # Sort each category list by 'n' field
    for section in data.values():
        for cat_key, cards in section.items():
            section[cat_key] = sorted(cards, key=lambda c: c.get('n', 99))

    manifest = build_manifest(SECTIONS, discovered)
    return data, manifest


def build_manifest(declared: list, discovered: dict[str, set[str]]) -> list:
    """Combine the declared SECTIONS with auto-discovered (section, category)
    pairs. Declared entries win on label + ordering; unknown keys get appended
    at the end with auto-generated Title-Case labels."""
    manifest = []
    seen_sections: set[str] = set()

    for sec in declared:
        skey = sec['key']
        seen_sections.add(skey)
        declared_cats = sec.get('categories', [])
        seen_cats = {c['key'] for c in declared_cats}
        # Discovered cats not declared → append them
        extra = sorted(discovered.get(skey, set()) - seen_cats)
        cats = list(declared_cats) + [
            {'key': k, 'label': auto_label(k)} for k in extra
        ]
        manifest.append({
            'key':        skey,
            'label':      sec['label'],
            'desc':       sec.get('desc', ''),
            'categories': cats,
        })

    # Auto-add sections that exist in JSONs but not in declared
    for skey in sorted(discovered.keys() - seen_sections):
        cats = sorted(discovered[skey])
        manifest.append({
            'key':        skey,
            'label':      auto_label(skey),
            'desc':       '',
            'categories': [{'key': k, 'label': auto_label(k)} for k in cats],
        })
        print(f'  [auto] new section discovered: {skey} → {auto_label(skey)}', file=sys.stderr)

    return manifest


def validate_output_keys(data: dict, manifest: list) -> None:
    """Fail fast if a legacy category leaks into generated site data."""
    leaked = []
    for section, category in sorted(FORBIDDEN_OUTPUT_CATEGORIES):
        if category in data.get(section, {}):
            leaked.append(f"{section}/{category} in DATA")
        for sec in manifest:
            if sec.get("key") != section:
                continue
            if any(cat.get("key") == category for cat in sec.get("categories", [])):
                leaked.append(f"{section}/{category} in MANIFEST")
    if leaked:
        joined = ", ".join(leaked)
        raise RuntimeError(f"Legacy portfolio category leaked into output: {joined}")


def to_js_value(obj, indent=0) -> str:
    """Serialise a Python object to compact-ish JS literal (not JSON)."""
    pad  = '  ' * indent
    pad1 = '  ' * (indent + 1)

    if isinstance(obj, dict):
        if not obj:
            return '{}'
        lines = []
        for k, v in obj.items():
            key = k if re.match(r'^[a-zA-Z_$][a-zA-Z0-9_$]*$', k) else f"'{k}'"
            lines.append(f'{pad1}{key}:{to_js_value(v, indent + 1)}')
        return '{\n' + ',\n'.join(lines) + '\n' + pad + '}'

    if isinstance(obj, list):
        if not obj:
            return '[]'
        items = [f'{pad1}{to_js_value(v, indent + 1)}' for v in obj]
        return '[\n' + ',\n'.join(items) + '\n' + pad + ']'

    if isinstance(obj, bool):
        return 'true' if obj else 'false'

    if isinstance(obj, (int, float)):
        return str(obj)

    if obj is None:
        return 'null'

    s = str(obj)
    s = s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n').replace('\r', '')
    return f"'{s}'"


def write_data_js(data: dict, manifest: list):
    validate_output_keys(data, manifest)
    timestamp = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')
    js_data     = to_js_value(data,     indent=1)
    js_manifest = to_js_value(manifest, indent=1)

    content = f"""/* ============================================================
   PORTFOLIO DATA  —  assets/js/data.js
   Auto-regenerated by GitHub Actions (.github/workflows/compile-portfolio.yml).
   DO NOT edit this file manually — your changes will be overwritten.

   To add/update a project, edit portfolio/*.json in that project's repo.
   Project images are auto-downloaded from each repo's portfolio/ folder.

   The MANIFEST below tells the website how to render its tabs and sub-tabs.
   It is built from scripts/compile_projects.py SECTIONS plus auto-discovery
   of any (section, category) keys that show up in project JSONs.

   Last compiled: {timestamp}
   ============================================================ */
window.__PORTFOLIO = {{

  DATA: {js_data},

  MANIFEST: {js_manifest}

}}; // END window.__PORTFOLIO
"""
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'\nWrote {OUTPUT_FILE}  ({len(content):,} bytes)')


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == '__main__':
    if not TOKEN:
        print('WARNING: PORTFOLIO_TOKEN not set — GitHub API rate limit is 60 req/hr.')
        print('         Set PORTFOLIO_TOKEN env var to a personal access token.')

    data, manifest = compile_all()
    write_data_js(data, manifest)
    print('Done.')
