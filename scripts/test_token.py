#!/usr/bin/env python3
"""
test_token.py  —  LOCAL TROUBLESHOOTING SCRIPT
================================================
Run this once to verify your PORTFOLIO_TOKEN has the right permissions
before running the full compile script via GitHub Actions.

Usage (Windows CMD):
    set PORTFOLIO_TOKEN=ghp_xxxxxxxxxxxx && python scripts/test_token.py

Tests performed:
    1. Token authentication (who am I?)
    2. List org repos via /orgs endpoint
    3. List org repos via Search API (fallback used by compile script)
    4. Read a portfolio JSON from a known repo
    5. Check write access to this repo (needed to commit data.js)
"""

import json
import os
import sys
from urllib.request import Request, urlopen
from urllib.error import HTTPError

TOKEN = os.environ.get('PORTFOLIO_TOKEN', '')
ORG   = 'Naadir-Dev-Portfolio'
# A repo we know has a portfolio JSON (seeded earlier)
TEST_REPO = 'Finance-Dashboard'
TEST_FILE = 'portfolio/finance-dashboard.json'
# The portfolio repo itself (needs write access)
PORTFOLIO_REPO = 'Naadir-Dev-Portfolio.github.io'

PASS = '  [PASS]'
FAIL = '  [FAIL]'
WARN = '  [WARN]'

def gh(path, method='GET'):
    headers = {
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
    }
    if TOKEN:
        headers['Authorization'] = f'Bearer {TOKEN}'
    req = Request(f'https://api.github.com{path}', headers=headers, method=method)
    try:
        with urlopen(req, timeout=15) as r:
            return r.status, json.loads(r.read())
    except HTTPError as e:
        return e.code, json.loads(e.read().decode() or '{}')

# ── Tests ─────────────────────────────────────────────────────────────────────

def test_auth():
    print('\n[1] Token authentication')
    if not TOKEN:
        print(f'{FAIL} PORTFOLIO_TOKEN env var is not set.')
        return False
    status, data = gh('/user')
    if status == 200:
        print(f'{PASS} Authenticated as: {data.get("login")} ({data.get("name")})')
        return True
    else:
        print(f'{FAIL} HTTP {status}: {data.get("message")}')
        return False


def test_org_repos():
    print('\n[2] List org repos via /orgs endpoint')
    status, data = gh(f'/orgs/{ORG}/repos?per_page=5')
    if status == 200 and isinstance(data, list):
        print(f'{PASS} Got {len(data)} repos (showing first 5). This endpoint works.')
        for r in data[:3]:
            print(f'       - {r["name"]}')
        return True
    else:
        msg = data.get('message', str(data)) if isinstance(data, dict) else str(data)
        print(f'{WARN} HTTP {status}: {msg}')
        print(f'       The compile script uses the Search API instead, so this may be OK.')
        return False


def test_search_api():
    print('\n[3] List org repos via Search API (what compile_projects.py actually uses)')
    status, data = gh(f'/search/repositories?q=org:{ORG}&per_page=10')
    if status == 200 and 'items' in data:
        total = data.get('total_count', '?')
        print(f'{PASS} Search API returned {total} repos total.')
        for r in data['items'][:3]:
            print(f'       - {r["name"]}')
        return True
    else:
        msg = data.get('message', str(data)) if isinstance(data, dict) else str(data)
        print(f'{FAIL} HTTP {status}: {msg}')
        return False


def test_read_json():
    print(f'\n[4] Read portfolio JSON from {TEST_REPO}/{TEST_FILE}')
    import base64
    status, data = gh(f'/repos/{ORG}/{TEST_REPO}/contents/{TEST_FILE}')
    if status == 200 and 'content' in data:
        raw = base64.b64decode(data['content']).decode()
        card = json.loads(raw)
        print(f'{PASS} Read successfully. Title: "{card.get("title")}"')
        return True
    else:
        msg = data.get('message', str(data)) if isinstance(data, dict) else str(data)
        print(f'{FAIL} HTTP {status}: {msg}')
        return False


def test_write_access():
    print(f'\n[5] Write access to {PORTFOLIO_REPO} (needed to commit data.js)')
    # Use the repo metadata endpoint and check permissions field
    status, data = gh(f'/repos/{ORG}/{PORTFOLIO_REPO}')
    if status == 200:
        perms = data.get('permissions', {})
        if perms.get('push'):
            print(f'{PASS} Push access confirmed.')
            return True
        else:
            print(f'{WARN} Repo accessible but push permission not confirmed: {perms}')
            print(f'       The Actions workflow may still work if the token has Contents:write.')
            return False
    else:
        msg = data.get('message', str(data)) if isinstance(data, dict) else str(data)
        print(f'{FAIL} HTTP {status}: {msg}')
        return False


# ── Run all tests ─────────────────────────────────────────────────────────────

if __name__ == '__main__':
    print('=' * 55)
    print('  Portfolio Token Diagnostics')
    print('=' * 55)

    results = [
        test_auth(),
        test_org_repos(),
        test_search_api(),
        test_read_json(),
        test_write_access(),
    ]

    passed = sum(1 for r in results if r)
    print(f'\n{"=" * 55}')
    print(f'  Results: {passed}/{len(results)} tests passed')
    print(f'{"=" * 55}')

    # The compile script needs tests 1, 3, 4, 5 to pass (test 2 is optional)
    critical = [results[0], results[2], results[3], results[4]]
    if all(critical):
        print('\n  All critical tests passed — compile script should work.')
    else:
        print('\n  One or more critical tests failed — fix the token permissions first.')
    print()
