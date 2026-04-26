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
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

# ── Config ────────────────────────────────────────────────────────────────────
ORG           = 'Naadir-Dev-Portfolio'
PORTFOLIO_DIR = 'portfolio'
JSON_PATTERN  = re.compile(r'^portfolio/[^/]+\.json$', re.IGNORECASE)
IMG_EXTS      = {'.webp', '.png', '.jpg', '.jpeg'}
OUTPUT_FILE   = 'assets/js/data.js'
RAW_BASE      = 'https://raw.githubusercontent.com'
TOKEN         = os.environ.get('PORTFOLIO_TOKEN', '')

# ── Canonical section / category skeleton ─────────────────────────────────────
SKELETON = {
    'python':            {'desktop': [], 'automation': [], 'trading': [], 'quant': []},
    'excelvba':          {'vba-macros': [], 'powerquery': [], 'power-automate': []},
    'powerbi':           {'dashboards': [], 'dataflow': []},
    'ai':                {'agents': [], 'generativeai': [], 'prompt': []},
    'web':               {'teamsites': [], 'tools': [], 'cognitive': []},
    'mobile':            {'android': []},
    'browserextensions': {'chromium': []},
}

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
    raw = base64.b64decode(data['content']).decode('utf-8')
    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        print(f'  JSON parse error in {repo_name}/{file_path}: {e}', file=sys.stderr)
        return None


def resolve_image_url(repo_name: str, filename: str) -> str:
    """
    Return the raw.githubusercontent.com URL for portfolio/{filename} in the repo.
    Uses the default branch name from the repo metadata if available, else 'main'.
    """
    return f'{RAW_BASE}/{ORG}/{repo_name}/main/portfolio/{filename}'


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


def compile_all() -> dict:
    """Return the full DATA dict by scanning all org repos."""
    import copy
    data = copy.deepcopy(SKELETON)

    print(f'Fetching repos for org: {ORG}')
    repos = get_org_repos()
    if not repos:
        print('ERROR: could not fetch repos list. Exiting.', file=sys.stderr)
        sys.exit(1)

    print(f'Found {len(repos)} repos.')

    for repo in repos:
        repo_name = repo['name']

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

            if section not in data:
                print(f'    WARNING: unknown section "{section}" — skipping', file=sys.stderr)
                continue

            if category not in data[section]:
                data[section][category] = []

            # ── Resolve image filenames → raw GitHub URLs ──────────────────────
            # Single image
            img = card.get('img', '').strip()
            if img and Path(img).suffix.lower() in IMG_EXTS:
                card['img'] = resolve_image_url(repo_name, img)
                print(f'    → img: {card["img"]}')

            # Optional alternate image for the n:1 featured editorial card
            img_featured = card.get('imgFeatured', '').strip()
            if img_featured and Path(img_featured).suffix.lower() in IMG_EXTS:
                card['imgFeatured'] = resolve_image_url(repo_name, img_featured)
                print(f'    → imgFeatured: {card["imgFeatured"]}')

            # Multiple images (editorial card)
            resolved_imgs = []
            for extra_img in card.get('imgs', []):
                extra_img = extra_img.strip()
                if extra_img and Path(extra_img).suffix.lower() in IMG_EXTS:
                    resolved_imgs.append(resolve_image_url(repo_name, extra_img))
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

    return data


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


def write_data_js(data: dict):
    timestamp = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')
    js_data   = to_js_value(data, indent=1)

    content = f"""/* ============================================================
   PORTFOLIO DATA  —  assets/js/data.js
   Auto-regenerated by GitHub Actions (.github/workflows/compile-portfolio.yml).
   DO NOT edit this file manually — your changes will be overwritten.
   To add/update a project, edit portfolio/*.json in that project's repo.
   Project images are auto-downloaded from each repo's portfolio/ folder.
   Last compiled: {timestamp}
   ============================================================ */
window.__PORTFOLIO = {{

  DATA: {js_data}

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

    data = compile_all()
    write_data_js(data)
    print('Done.')
