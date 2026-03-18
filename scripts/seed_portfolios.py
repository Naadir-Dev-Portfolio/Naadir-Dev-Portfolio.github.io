#!/usr/bin/env python3
"""
seed_portfolios.py
==================
ONE-TIME bootstrap script.

JSON schema for each portfolio/*.json file:
  {
    "section":   "python",          // top-level tab key (required)
    "category":  "desktop",         // sub-tab key       (required)
    "n":         1,                 // sort order — n:1 = featured editorial card (full-width),
                                    //              n:2+ = gallery swipe cards
    "title":     "My Project",      // card title (REQUIRED)
    "img":       "screenshot.webp", // thumbnail filename in assets/images/projects/
    "videoId":   "JtVEtAiz0UU",     // YouTube video ID  (card shows Video button + uses thumbnail)
    "video":     "https://youtu.be/JtVEtAiz0UU", // OR full YouTube URL (either videoId or video works)
    "desc":      "One-line blurb.",
    "demo":      "https://...",     // Live button
    "code":      "https://github.com/...", // Code button
    "details":   "https://github.com/.../README.md", // Details button
    "tags":      ["python","pyqt"]
  }

  Card click priority (clicking the card body, not a button):
    Live > Video > Details > Code

Reads the current hardcoded project data from assets/js/data.js
(which still holds all your existing projects) and creates the
corresponding  portfolio/<slug>.json  file in each GitHub repo
via the GitHub API.

Run ONCE after setting up:
  PORTFOLIO_TOKEN=ghp_xxx python scripts/seed_portfolios.py

What it does:
  1. Reads window.__PORTFOLIO.DATA from assets/js/data.js (parsed as JSON).
  2. For each project card, looks up the GitHub repo URL from card.code or
     card.details to determine the target repo name.
  3. Creates portfolio/<slug>.json in that repo (adds section + category
     fields so the compile script knows where to place the card).
  4. Skips repos that already have a portfolio/ folder or where the repo
     name cannot be determined.

After running this script:
  - All your existing repos will have a portfolio/*.json file.
  - Run  python scripts/compile_projects.py  to verify the compile works.
  - From then on, edit the JSON in each repo directly; GitHub Actions
    will pick up changes nightly (or on manual trigger).

NOTE: This script commits directly to the default branch of each repo.
      It will NOT overwrite files that already exist.
"""

import base64
import json
import os
import re
import sys
from urllib.request import Request, urlopen
from urllib.error import HTTPError

ORG   = 'Naadir-Dev-Portfolio'
TOKEN = os.environ.get('PORTFOLIO_TOKEN', '')

# ── Seed data — mirrors the current hardcoded DATA in data.js ─────────────────
# fmt: off
SEED_DATA = {
    'python': {
        'desktop': [
            {'n':1,'title':'Finance Dashboard','img':'FinanceScreen.png','imgs':['FinanceScreen.png','financeDashboard.jpg','eer.webp'],'desc':'Interactive finance KPIs dashboard with automated data importing, charting and portfolio tracking — built with PyQt6.','code':'https://github.com/Naadir-Dev-Portfolio/Finance-Dashboard/blob/main/Ui_finance.py','details':'https://github.com/Naadir-Dev-Portfolio/Finance-Dashboard/blob/main/README.md','tags':['python','pyqt','data-viz']},
            {'n':2,'title':'YouTube Stats Dashboard','img':'yt_viewCountScreen.webp','desc':'Cross-platform PyQt6 dashboard integrating the YouTube Data API to visualise channel growth and engagement trends.','code':'https://github.com/Naadir-Dev-Portfolio/YouTube-Stats-Dashboard/blob/main/main.py','details':'https://github.com/Naadir-Dev-Portfolio/YouTube-Stats-Dashboard/blob/main/README.md','tags':['python','pyqt','api']},
            {'n':3,'title':'Health Dashboard','img':'healthDashboardScreen.png','desc':'OpenGL-powered health metrics dashboard with dynamic 3D body model selection and vitals tracking.','code':'https://github.com/Naadir-Dev-Portfolio/Health-Dashboard/blob/main/Ui_health.py','details':'https://github.com/Naadir-Dev-Portfolio/Health-Dashboard/blob/main/README.md','tags':['python','pyqt','opengl']},
            {'n':4,'title':'Mortgage Overpayment Tracker','img':'mortgageTrackerScreen.webp','desc':'Amortisation simulation tool — model overpayment scenarios, see interest saved and payoff date at a glance.','code':'https://github.com/Naadir-Dev-Portfolio/Mortgage-Overpayment-Tracker/blob/main/main.py','details':'https://github.com/Naadir-Dev-Portfolio/Mortgage-Overpayment-Tracker/blob/main/README.md','tags':['python','finance']},
            {'n':5,'title':'Income Prophet','img':'','desc':'Time-series income forecasting — models growth trajectories and projects future earnings using statistical modelling.','code':'https://github.com/Naadir-Dev-Portfolio/Income-Prophet/blob/main/main.py','details':'https://github.com/Naadir-Dev-Portfolio/Income-Prophet/blob/main/README.md','tags':['python','forecasting','finance']},
            {'n':6,'title':'Desktop Widgets','img':'','desc':'Collection of always-on-top PyQt6 overlay widgets — BTC ticker, SPY/FTSE/Treasuries charts, crypto alerts, news reader, health tracker, mortgage calc and more.','code':'https://github.com/Naadir-Dev-Portfolio/Desktop-Widgets','details':'https://github.com/Naadir-Dev-Portfolio/Desktop-Widgets/blob/main/README.md','tags':['python','pyqt','crypto','api']},
            {'n':7,'title':'OCR Spin Extractor','img':'','desc':'Extracts spin session and exercise performance data from workout screenshots using an OCR pipeline, exported to CSV.','code':'https://github.com/Naadir-Dev-Portfolio/OCR-Spin-Extractor/blob/main/main.py','details':'https://github.com/Naadir-Dev-Portfolio/OCR-Spin-Extractor/blob/main/README.md','tags':['python','ocr','automation']},
            {'n':8,'title':'Health Planner Desktop','img':'','desc':'Cross-platform desktop health planner built with PyQt6 and QWebEngineView — hybrid Python/web UI for tracking workout regimens, health metrics and exercise logs.','code':'https://github.com/Naadir-Dev-Portfolio/Health-Planner-Desktop/blob/main/main.py','details':'https://github.com/Naadir-Dev-Portfolio/Health-Planner-Desktop/blob/main/README.md','tags':['python','pyqt','health','automation']},
        ],
        'automation': [
            {'n':1,'title':'Adobe Script Toolkit','videoId':'JtVEtAiz0UU','desc':'Full Adobe automation toolkit — Python drives Illustrator via COM to run a complete sticker pack export pipeline (multi-size PNG/JPEG/SVG, watermarked previews, PDF sticker sheets, promo video). Plus native JSX scripts for Illustrator and After Effects: batch artboard export, vectorize, layer renaming, render queue automation.','code':'https://github.com/Naadir-Dev-Portfolio/Adobe-Script-Toolkit/blob/main/illustrator/sticker_pack_export_pipeline.py','details':'https://github.com/Naadir-Dev-Portfolio/Adobe-Script-Toolkit/blob/main/README.md','tags':['python','automation','extendscript','adobe','jsx']},
            {'n':2,'title':'PDF Data Extractor','img':'','desc':'Batch PDF text and table extraction pipeline — processes folders of PDFs, pulls structured data into usable formats.','code':'https://github.com/Naadir-Dev-Portfolio/PDF-Data-Extractor/blob/main/main.py','details':'https://github.com/Naadir-Dev-Portfolio/PDF-Data-Extractor/blob/main/README.md','tags':['python','automation','ocr']},
        ],
        'trading': [
            {'n':1,'title':'Trading Algo Backtester','img':'','desc':'Multi-strategy algorithmic trading backtester with a scikit-learn ML layer — runs historical analysis and live market signals on crypto and equities.','code':'https://github.com/Naadir-Dev-Portfolio/Trading-Algo-Backtester/blob/main/main.py','details':'https://github.com/Naadir-Dev-Portfolio/Trading-Algo-Backtester/blob/main/README.md','tags':['python','trading','ml','backtesting']},
            {'n':2,'title':'Crypto News Aggregator','img':'','desc':'Scrapes CryptoPanic, organises articles by coin and sentiment, outputs clean Excel reports for market research.','code':'https://github.com/Naadir-Dev-Portfolio/Crypto-News-Aggregator/blob/main/main.py','details':'https://github.com/Naadir-Dev-Portfolio/Crypto-News-Aggregator/blob/main/README.md','tags':['python','crypto','trading','excel']},
        ],
        'quant': [
            {'n':1,'title':'Quant Research Scripts','img':'','desc':'Quantitative finance experiments — NeuralProphet neural time-series forecasting and inflation-adjusted stock price analysis.','code':'https://github.com/Naadir-Dev-Portfolio/Quant-Research-Scripts','details':'https://github.com/Naadir-Dev-Portfolio/Quant-Research-Scripts/blob/main/README.md','tags':['python','quant','ml','forecasting']},
            {'n':2,'title':'Economic Dashboard','img':'','desc':'26 Python data pipelines pulling FRED API data — yield curves, housing starts, unemployment, CAPE ratio, credit spreads and more.','code':'https://github.com/Naadir-Dev-Portfolio/Economic-Dashboard','details':'https://github.com/Naadir-Dev-Portfolio/Economic-Dashboard/blob/main/README.md','tags':['python','economics','api','data-viz']},
        ],
    },
    'excelvba': {
        'vba-macros': [
            {'n':1,'title':'VBA Toolkit','img':'','desc':'General-purpose VBA macro library — reusable patterns for data processing, report formatting, file handling and Excel automation.','code':'https://github.com/Naadir-Dev-Portfolio/VBA-Toolkit','details':'https://github.com/Naadir-Dev-Portfolio/VBA-Toolkit/blob/main/README.md','tags':['vba','excel','automation']},
            {'n':2,'title':'VBA Report Automation','img':'','desc':'VBA macro suite automating end-to-end audit and operational reporting pipelines — from raw data extraction to formatted, distributable output.','code':'https://github.com/Naadir-Dev-Portfolio/VBA-Report-Automation','details':'https://github.com/Naadir-Dev-Portfolio/VBA-Report-Automation/blob/main/README.md','tags':['vba','excel','automation','reporting']},
            {'n':3,'title':'SAP GUI Automation','img':'','desc':'SAP GUI scripting templates using VBA — automates standard SAP transactions, data pulls and form submissions.','code':'https://github.com/Naadir-Dev-Portfolio/SAP-GUI-Automation','details':'https://github.com/Naadir-Dev-Portfolio/SAP-GUI-Automation/blob/main/README.md','tags':['vba','sap','automation']},
        ],
        'powerquery': [
            {'n':1,'title':'Power Query Toolkit','img':'','desc':'Power Query M templates for common data transformation patterns — cleaning, reshaping, merging and loading data in Excel. Production-ready and reusable across projects.','code':'https://github.com/Naadir-Dev-Portfolio/Power-Query-Toolkit','details':'https://github.com/Naadir-Dev-Portfolio/Power-Query-Toolkit/blob/main/README.md','tags':['excel','power-query','etl']},
            {'n':2,'title':'Excel Report Templates','img':'','desc':'Collection of professional Excel workbook templates — operational reports, team analytics, financial tools and SAP-integrated extracts. Sanitised for public use.','code':'https://github.com/Naadir-Dev-Portfolio/Excel-Report-Templates','details':'https://github.com/Naadir-Dev-Portfolio/Excel-Report-Templates/blob/main/README.md','tags':['excel','vba','reporting']},
        ],
        'power-automate': [],
    },
    'powerbi':  {'dashboards': [], 'dataflow': []},
    'ai': {
        'agents': [
            {'n':1,'title':'Spheria','img':'','desc':'Hero project — AI desktop OS with multi-agent orchestration, tool calling, persistent memory, and a custom animated orb interface. A fully autonomous desktop AI built in Python and PyQt6.','code':'https://github.com/Naadir-Dev-Portfolio/Spheria','details':'https://github.com/Naadir-Dev-Portfolio/Spheria/blob/main/README.md','tags':['ai','multi-agent','python','pyqt']},
        ],
        'generativeai': [
            {'n':1,'title':'Enterprise GenAI Assistant','img':'ccmiChatbot_demo.webp','desc':'Custom enterprise chatbot leveraging Gemini 1.5 Flash — built and deployed for a team within days. RAG pipeline over internal documentation.','code':'https://github.com/Naadir-Dev-Portfolio/Enterprise-GenAI-Assistant/blob/main/main.py','demo':'https://ccmi-genai-chat.streamlit.app/','details':'https://github.com/Naadir-Dev-Portfolio/Enterprise-GenAI-Assistant/blob/main/README.md','tags':['ai','streamlit','gemini','prompt-eng']},
            {'n':2,'title':'AI Quiz Bot','img':'aiQuizbot.webp','desc':'Interactive knowledge testing with adaptive questioning powered by Gemini 1.5 Flash — generates fresh quizzes on any topic.','code':'https://github.com/Naadir-Dev-Portfolio/AI-Quizbot/blob/main/main.py','demo':'https://aiquizbot.streamlit.app/','details':'https://github.com/Naadir-Dev-Portfolio/AI-Quizbot/blob/main/README.md','tags':['ai','streamlit','gemini','prompt-eng']},
            {'n':3,'title':'Finance NL Query','img':'','desc':'Natural language interface for financial data — ask plain-English questions and get structured, queryable answers without writing code.','code':'https://github.com/Naadir-Dev-Portfolio/Finance-NL-Query/blob/main/main.py','details':'https://github.com/Naadir-Dev-Portfolio/Finance-NL-Query/blob/main/README.md','tags':['ai','nlp','finance','python']},
            {'n':4,'title':'ComfyUI Workflows','img':'','desc':'ComfyUI node-graph workflows for AI image generation pipelines — txt2img, img2img with 4x ESRGAN upscaling, plus Python automation scripts for batch queuing and auto-renaming generated outputs.','code':'https://github.com/Naadir-Dev-Portfolio/ComfyUI-Workflows','details':'https://github.com/Naadir-Dev-Portfolio/ComfyUI-Workflows/blob/main/README.md','tags':['ai','comfyui','stable-diffusion','python']},
            {'n':5,'title':'Portfolio AI Assistant','img':'','desc':'The AI assistant embedded in this portfolio — a Gemini-powered chat interface that knows my full project history and answers questions about my skills and experience in real time.','code':'https://github.com/Naadir-Dev-Portfolio/Naadir-Dev-Portfolio.github.io','details':'https://github.com/Naadir-Dev-Portfolio/Naadir-Dev-Portfolio.github.io/blob/main/README.md','tags':['ai','gemini','prompt-eng','js']},
        ],
        'prompt': [
            {'n':1,'title':'AI Prompt Generator','img':'','desc':'Generates 1000+ diverse, categorised AI prompts and appends them to a master library — covers creative, technical, educational and analytical domains.','code':'https://github.com/Naadir-Dev-Portfolio/AI-Prompt-Generator/blob/main/main.py','details':'https://github.com/Naadir-Dev-Portfolio/AI-Prompt-Generator/blob/main/README.md','tags':['ai','prompt-eng','python']},
        ],
    },
    'web': {
        'teamsites': [
            {'n':1,'title':'Team Hub Website','img':'ccmisite_demo.webp','desc':'Professional front-end portal for an internal data team — showcasing tools, projects and team info with a clean, responsive layout.','code':'https://github.com/Naadir-Dev-Portfolio/Team-Hub-Website/tree/main','demo':'https://ccmiteamsite-by-naadir.netlify.app/','details':'https://github.com/Naadir-Dev-Portfolio/Team-Hub-Website/blob/main/README.md','tags':['web','html','css','js']},
            {'n':2,'title':'Power BI Request Portal','img':'pbirequest.webp','desc':'Interactive request portal that walks stakeholders through the Power BI report commissioning process — replaces email back-and-forth.','code':'https://github.com/Naadir-Dev-Portfolio/PowerBI-Request-Portal/blob/main/index.html','demo':'https://powerbirequest-by-naadir.netlify.app/','details':'https://github.com/Naadir-Dev-Portfolio/PowerBI-Request-Portal/blob/main/README.md','tags':['web','html','powerbi']},
            {'n':3,'title':'Economics Dashboard Web','img':'','desc':'Interactive browser-based economics dashboard — live macro data, yield curves, housing, employment and inflation. Currently in development.','code':'https://github.com/Naadir-Dev-Portfolio/Economics-Dashboard-Web','details':'https://github.com/Naadir-Dev-Portfolio/Economics-Dashboard-Web/blob/main/README.md','tags':['web','js','economics','data-viz']},
        ],
        'tools': [],
        'cognitive': [
            {'n':1,'title':'Rain Drops Arithmetics','img':'raindropsScreen.webp','desc':"Fast-paced arithmetic training game inspired by Lumosity's Rain Drops — tests mental calculation speed under pressure.",'code':'https://github.com/Naadir-Dev-Portfolio/RainDrops/blob/main/index.html','demo':'https://raindrops-by-naadir.netlify.app/','tags':['web','js','game']},
            {'n':2,'title':'Hexamatch Fractions','img':'hexamatchScreen.webp','desc':'Hexagonal tile-matching game that builds intuitive understanding of equivalent fractions through play.','code':'https://github.com/Naadir-Dev-Portfolio/Hexamatch/blob/main/index.html','demo':'https://hexamatch-by-naadir.netlify.app/','tags':['web','js','game']},
            {'n':3,'title':'AlgebraVerse','img':'algebraverseScreen.webp','desc':'Progressive algebra challenge system — from basic equations to multi-step problem solving, with difficulty scaling.','code':'https://github.com/Naadir-Dev-Portfolio/Algebraverse/blob/main/index.html','demo':'https://algebraverse-by-naadir.netlify.app/','tags':['web','js','game']},
            {'n':4,'title':'Logic Grid Boolean','img':'logicgridscreen.webp','desc':'Visual boolean logic gate puzzle — helps players build intuitive understanding of AND, OR and NOT operations.','code':'https://github.com/Naadir-Dev-Portfolio/LogicGrid/blob/main/index.html','demo':'https://logicgrid-by-naadir.netlify.app/','tags':['web','js','game']},
        ],
    },
    'mobile': {
        'android': [
            {'n':1,'title':'Mobile Health Planner','img':'','desc':'React Native health planning app for Android — workout logger, regimen tracker and health metrics built with Expo SDK 54 and TypeScript. Deep-link ready with custom URI scheme.','code':'https://github.com/Naadir-Dev-Portfolio/Mobile-Health-Planner','details':'https://github.com/Naadir-Dev-Portfolio/Mobile-Health-Planner/blob/main/README.md','tags':['react-native','mobile','health','typescript']},
        ],
    },
    'browserextensions': {'google-chrome': []},
}
# fmt: on

# ── GitHub API helpers ─────────────────────────────────────────────────────────

HEADERS = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Authorization': f'Bearer {TOKEN}',
}


def gh_get(path: str):
    req = Request(f'https://api.github.com{path}', headers=HEADERS)
    try:
        with urlopen(req, timeout=20) as r:
            return json.loads(r.read())
    except HTTPError as e:
        if e.code == 404:
            return None
        raise


def gh_put(path: str, payload: dict):
    data = json.dumps(payload).encode()
    req = Request(f'https://api.github.com{path}', data=data, headers={**HEADERS, 'Content-Type': 'application/json'}, method='PUT')
    try:
        with urlopen(req, timeout=20) as r:
            return json.loads(r.read())
    except HTTPError as e:
        body = e.read().decode()
        print(f'    PUT {path} → HTTP {e.code}: {body[:200]}', file=sys.stderr)
        return None


def repo_name_from_card(card: dict) -> str | None:
    """Extract GitHub repo name from code or details URL."""
    for field in ('code', 'details'):
        url = card.get(field, '')
        m = re.search(r'github\.com/Naadir-Dev-Portfolio/([^/]+)', url)
        if m:
            return m.group(1)
    return None


def file_exists(repo: str, path: str) -> bool:
    return gh_get(f'/repos/{ORG}/{repo}/contents/{path}') is not None


# ── Main seed logic ────────────────────────────────────────────────────────────

def slugify(title: str) -> str:
    return re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')


def seed():
    if not TOKEN:
        print('ERROR: PORTFOLIO_TOKEN env var not set.', file=sys.stderr)
        sys.exit(1)

    created = 0
    skipped = 0

    for section, categories in SEED_DATA.items():
        for category, cards in categories.items():
            for card in cards:
                repo = repo_name_from_card(card)
                if not repo:
                    print(f'  SKIP (no repo URL): {card.get("title")}')
                    skipped += 1
                    continue

                slug = slugify(card.get('title', 'project'))
                file_path = f'portfolio/{slug}.json'

                # Don't overwrite
                if file_exists(repo, file_path):
                    print(f'  EXISTS  [{repo}]  {file_path}')
                    skipped += 1
                    continue

                # Build the JSON to commit (add section + category)
                payload_card = {
                    'section':  section,
                    'category': category,
                    **card,
                }
                # Remove empty strings to keep files clean
                payload_card = {k: v for k, v in payload_card.items() if v != '' and v != []}

                json_content = json.dumps(payload_card, indent=2, ensure_ascii=False)
                encoded = base64.b64encode(json_content.encode()).decode()

                result = gh_put(
                    f'/repos/{ORG}/{repo}/contents/{file_path}',
                    {
                        'message': f'feat: add portfolio/{slug}.json [skip ci]',
                        'content': encoded,
                        'branch':  'main',
                    }
                )

                if result:
                    print(f'  CREATED [{repo}]  {file_path}')
                    created += 1
                else:
                    # Try 'master' branch as fallback
                    result2 = gh_put(
                        f'/repos/{ORG}/{repo}/contents/{file_path}',
                        {
                            'message': f'feat: add portfolio/{slug}.json [skip ci]',
                            'content': encoded,
                            'branch':  'master',
                        }
                    )
                    if result2:
                        print(f'  CREATED [{repo}] (master) {file_path}')
                        created += 1
                    else:
                        print(f'  FAILED  [{repo}]  {file_path}', file=sys.stderr)
                        skipped += 1

    print(f'\nDone. Created: {created}  |  Skipped/failed: {skipped}')


if __name__ == '__main__':
    seed()
