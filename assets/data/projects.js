/**
 * projects.js — Portfolio 2.0 · Single Source of Truth
 * ─────────────────────────────────────────────────────
 * HOW TO ADD A NEW PROJECT:
 *   1. Copy any block below and paste at the top of the relevant category array.
 *   2. Fill in: id, title, tags, description, image (filename only), github, demo.
 *   3. Drop the image into: assets/images/projects/<your-filename>.png
 *   4. Set featured: true if it should appear in the spotlight section.
 *   5. Save. Done — no other file needs changing.
 *
 * STATUS VALUES:
 *   "live"         → live / finished
 *   "wip"          → work in progress (shows amber "In Progress" badge)
 *   "coming-soon"  → shows grey "Coming Soon" badge
 *
 * CATEGORIES & SUBCATEGORIES:
 *   excel        → vba | powerquery | powerautomate | powerbi
 *   python       → desktop | automation | utilities
 *   ai           → generativeai | agents | nlp | prompt
 *   trading      → backtesting | livedata | forecasting
 *   web          → teamsites | tools | cognitive
 */

const PROJECTS = {

  /* ══════════════════════════════════════════════════════════════
     FEATURED — appears in flagship spotlight (max ~3)
  ══════════════════════════════════════════════════════════════ */
  featured: [
    {
      id: "eso-spheria",
      title: "Echo Sphere One (ESO / Spheria)",
      tags: ["Python", "Gemini AI", "PyQt6", "FastAPI", "Multi-Agent", "MS Graph API"],
      description: "A fully operational personal AI operating system built from scratch. Spheria orchestrates a suite of specialist AI agents — Intel, Food, Schedule, Calendar, News — all powered by Gemini and wired into Microsoft Outlook, To-Do, and live data feeds. Features a custom PyQt6 animated orb widget as the desktop interface.",
      highlights: ["10+ working tool-calling agents", "Full MS Graph API integration", "Real-time news with Gemini summarisation", "Custom PyQt6 animated orb UI"],
      image: "eso-spheria.png",
      github: "https://github.com/Naadir-Dev-Portfolio/Desktop-ESO-Spheria",
      demo: null,
      status: "live",
      featured: true,
      category: "ai",
      subcategory: "agents"
    },
    {
      id: "excel-vba-toolkit",
      title: "Excel VBA & Office 365 Automation Toolkit",
      tags: ["VBA", "Excel", "Power Query", "SAP GUI", "JavaScript", "Power Automate"],
      description: "A curated collection of production-grade automation tools built for real enterprise environments — SAP GUI scripting, multi-sheet audit macros, Power Query pipelines, VBScript utilities, and JavaScript-based report export workflows. Dozens of hours saved per month across reporting teams.",
      highlights: ["SAP GUI automation via VBA", "Power Query pipeline templates", "Multi-report audit suite", "VBScript server management utilities"],
      image: "excel-vba-toolkit.png",
      github: "https://github.com/Naadir-Dev-Portfolio/Excel-VBA-Automation-Toolkit",
      demo: null,
      status: "live",
      featured: true,
      category: "excel",
      subcategory: "vba"
    },
    {
      id: "algo-backtester",
      title: "Advanced Algorithmic Strategy Backtester",
      tags: ["Python", "vectorbt", "optuna", "TA-Lib", "NeuralProphet", "Binance API"],
      description: "A serious quantitative strategy research tool combining vectorbt's high-speed backtesting with Optuna's Bayesian hyperparameter optimisation and TA-Lib technical indicators. Live data ingestion via Binance WebSocket. NeuralProphet neural forecasting module included.",
      highlights: ["Bayesian optimisation via Optuna", "Real-time Binance WebSocket feed", "NeuralProphet forecasting module", "Multi-asset OHLCV data pipeline"],
      image: "algo-backtester.png",
      github: "https://github.com/Naadir-Dev-Portfolio/Trading-Algo-Backtester",
      demo: null,
      status: "live",
      featured: true,
      category: "trading",
      subcategory: "backtesting"
    }
  ],

  /* ══════════════════════════════════════════════════════════════
     EXCEL / VBA / OFFICE 365
  ══════════════════════════════════════════════════════════════ */
  excel: {
    vba: [
      {
        id: "excel-vba-toolkit",
        title: "Excel VBA & Office 365 Automation Toolkit",
        tags: ["VBA", "Excel", "Power Query", "SAP GUI", "JavaScript", "VBScript"],
        description: "Production-grade automation tools built for enterprise environments — SAP GUI scripting, multi-sheet audit macros, Power Query pipelines, and VBScript server utilities.",
        image: "excel-vba-toolkit.png",
        github: "https://github.com/Naadir-Dev-Portfolio/Excel-VBA-Automation-Toolkit",
        demo: null,
        status: "live"
      },
      {
        id: "sap-gui-automation",
        title: "SAP GUI Script Automation",
        tags: ["VBA", "SAP GUI Scripting", "Excel"],
        description: "Enterprise SAP GUI automation scripts for extracting, processing, and routing data between SAP and Excel. Eliminates manual SAP copy-paste workflows.",
        image: "sap-gui.png",
        github: "https://github.com/Naadir-Dev-Portfolio/Excel-VBA-Automation-Toolkit",
        demo: null,
        status: "live"
      }
    ],
    powerquery: [
      {
        id: "power-query-pipeline",
        title: "Power Query Data Pipeline Templates",
        tags: ["Power Query", "M Language", "Excel", "Data Transformation"],
        description: "Reusable Power Query M-language transformation templates for cleaning, reshaping and loading multi-source data into Excel reporting models.",
        image: "power-query.png",
        github: "https://github.com/Naadir-Dev-Portfolio/Excel-VBA-Automation-Toolkit",
        demo: null,
        status: "live"
      }
    ],
    powerautomate: [
      {
        id: "email-workflow",
        title: "Automated Email Workflow & Routing",
        tags: ["Power Automate", "Office 365", "Excel", "VBA"],
        description: "Multi-step email workflow automation that captures, processes and routes inbound requests — reducing manual handling and routing errors across the team.",
        image: "email-workflow.png",
        github: "https://github.com/Naadir-Dev-Portfolio/Excel-VBA-Automation-Toolkit",
        demo: null,
        status: "live"
      }
    ],
    powerbi: [
      {
        id: "pbi-request-portal",
        title: "Power BI Request Portal",
        tags: ["HTML/CSS/JS", "Power BI", "Office 365", "Visio Flow"],
        description: "Interactive workflow site that guides stakeholders through the Power BI report request process — from scoping to delivery — with an embedded Visio process map.",
        image: "pbirequest.png",
        github: "https://github.com/Naadir-Dev-Portfolio/Website-PowerBI-Request-Portal",
        demo: "https://powerbirequest-by-naadir.netlify.app/",
        status: "live"
      }
    ]
  },

  /* ══════════════════════════════════════════════════════════════
     PYTHON
  ══════════════════════════════════════════════════════════════ */
  python: {
    desktop: [
      {
        id: "finance-dashboard",
        title: "PyQt6 Financial KPI Dashboard",
        tags: ["Python", "PyQt6", "Pandas", "Matplotlib", "Power Query"],
        description: "Interactive finance KPI dashboard with automated data importing using PyQt6. Pulls from Excel Power Query → Access DB pipeline and renders dynamic charts.",
        image: "FinanceScreen.png",
        github: "https://github.com/Naadir-Dev-Portfolio/Desktop-PyQt6-finance-dashboard",
        demo: null,
        status: "live"
      },
      {
        id: "health-dashboard",
        title: "PyQt6 Health Dashboard",
        tags: ["Python", "PyQt6", "OpenGL", "Samsung Health", "Matplotlib"],
        description: "Health metrics dashboard with OpenGL-powered 3D model selection. Ingests Samsung Health exports for weight, sleep, nutrition, BP and ECG visualisation.",
        image: "healthDashboardScreen.png",
        github: "https://github.com/Naadir-Dev-Portfolio/Desktop-PyQt6-health-dashboard",
        demo: null,
        status: "live"
      },
      {
        id: "mortgage-tracker",
        title: "Mortgage Overpayment & Amortisation Tracker",
        tags: ["Python", "PyQt6", "Pandas", "Matplotlib"],
        description: "Self-built mortgage simulation tool with configurable overpayments, amortisation schedules and interest saving projections across multiple scenarios.",
        image: "mortgageTrackerScreen.png",
        github: "https://github.com/Naadir-Dev-Portfolio/Desktop-Mortgage-overpayment-tracker",
        demo: null,
        status: "live"
      },
      {
        id: "youtube-analytics",
        title: "YouTube Viewer Analytics Dashboard",
        tags: ["Python", "PyQt6", "YouTube Data API", "Matplotlib"],
        description: "Cross-platform PyQt6 dashboard integrating the YouTube Data API to visualise channel view-count trends and engagement metrics over time.",
        image: "yt_viewCountScreen.png",
        github: "https://github.com/Naadir-Dev-Portfolio/Desktop-youtube-view-stats-dashboard",
        demo: null,
        status: "live"
      },
      {
        id: "income-forecasting",
        title: "Income Forecasting Dashboard",
        tags: ["Python", "PyQt6", "Prophet", "ARIMA", "scikit-learn"],
        description: "Multi-model income forecasting tool: ARIMA, Facebook Prophet and LinearRegression in one PyQt6 dashboard. Load a CSV and compare three forecast models side-by-side.",
        image: "income-forecasting.png",
        github: "https://github.com/Naadir-Dev-Portfolio/Desktop-Income-Forecasting",
        demo: null,
        status: "live"
      },
      {
        id: "nl-finance-query",
        title: "Natural Language Finance Query Tool",
        tags: ["Python", "PyQt6", "SentenceTransformers", "NLP", "Pandas"],
        description: "Type plain English questions about your financial data and get instant answers. Powered by SentenceTransformers (paraphrase-MiniLM) for semantic similarity matching.",
        image: "nl-finance-query.png",
        github: "https://github.com/Naadir-Dev-Portfolio/Desktop-NL-Finance-Query",
        demo: null,
        status: "live"
      }
    ],
    automation: [
      {
        id: "illustrator-pipeline",
        title: "Python / ExtendScript Illustrator Export Pipeline",
        tags: ["Python", "Adobe Illustrator", "ExtendScript", "Automation"],
        description: "Fully automated Illustrator export pipeline using Python to orchestrate ExtendScript — batch processes artwork files to multiple formats without human intervention.",
        image: "illustratorPipeline.png",
        github: "https://github.com/Naadir-Dev-Portfolio/Automation-Illustrator-Export-Pipeline",
        demo: null,
        videoId: "JtVEtAiz0UU",
        status: "live"
      },
      {
        id: "ocr-extractor",
        title: "OCR Data Extraction Pipeline",
        tags: ["Python", "OpenCV", "Tesseract", "OCR", "PDF"],
        description: "OpenCV + Tesseract OCR pipeline for extracting structured data from images and PDFs. Includes pre-processing (dilation, erosion, resize) for high-accuracy extraction.",
        image: "ocr-extractor.png",
        github: "https://github.com/Naadir-Dev-Portfolio/Python-OCR-Data-Extractor",
        demo: null,
        status: "live"
      },
      {
        id: "desktop-widgets",
        title: "Python Desktop Widget Suite",
        tags: ["Python", "PyQt6", "tkinter", "API Integrations", "Desktop"],
        description: "14 standalone desktop widgets: crypto live prices, TradingView charts, news scrapers, X trending, backup tools, network map and software updater. A personal productivity suite.",
        image: "desktop-widgets.png",
        github: "https://github.com/Naadir-Dev-Portfolio/Python-Desktop-Widgets",
        demo: null,
        status: "live"
      }
    ],
    utilities: [
      {
        id: "crypto-news-aggregator",
        title: "Crypto News Aggregator",
        tags: ["Python", "CryptoPanic API", "Pandas", "Web Scraping", "Excel Export"],
        description: "CryptoPanic news scraper that pulls, categorises and exports crypto headlines into organised Excel/CSV reports. Supports keyword filtering and sentiment tagging.",
        image: "crypto-news.png",
        github: "https://github.com/Naadir-Dev-Portfolio/Python-Crypto-News-Aggregator",
        demo: null,
        status: "live"
      },
      {
        id: "ai-prompt-generator",
        title: "AI Prompt Engineering Toolkit",
        tags: ["Python", "Generative AI", "NLP", "Prompt Engineering"],
        description: "Generates 1000+ creative and structured AI prompts across categories. Companion AI Predictive Typing module uses keyboard detection for context-aware prompt suggestions.",
        image: "ai-prompt-generator.png",
        github: "https://github.com/Naadir-Dev-Portfolio/Python-AI-Prompt-Generator",
        demo: null,
        status: "live"
      }
    ]
  },

  /* ══════════════════════════════════════════════════════════════
     AI / MACHINE LEARNING
  ══════════════════════════════════════════════════════════════ */
  ai: {
    agents: [
      {
        id: "eso-spheria",
        title: "Echo Sphere One — Personal AI OS",
        tags: ["Python", "Gemini AI", "PyQt6", "FastAPI", "MS Graph API", "Multi-Agent"],
        description: "A personal AI operating system: Intel, Food, Schedule, Calendar and News agents — all tool-calling, all wired into live Microsoft 365 data. Custom animated PyQt6 orb desktop interface.",
        image: "eso-spheria.png",
        github: "https://github.com/Naadir-Dev-Portfolio/Desktop-ESO-Spheria",
        demo: null,
        status: "live"
      }
    ],
    generativeai: [
      {
        id: "ccmi-genai",
        title: "CCMI Gen AI Team Chatbot",
        tags: ["Python", "Streamlit", "Gemini 1.5 Flash", "RAG"],
        description: "Custom team-facing AI chatbot built with Gemini 1.5 Flash on Streamlit. Deployed for real internal use — answers team queries about processes, reports and data.",
        image: "ccmiChatbot_demo.png",
        github: "https://github.com/Naadir-Dev-Portfolio/Streamlit-ccmi-genai",
        demo: "https://ccmi-genai-chat.streamlit.app/",
        status: "live"
      },
      {
        id: "ai-quizbot",
        title: "AI Quiz Bot",
        tags: ["Python", "Streamlit", "Gemini 1.5 Flash", "Education"],
        description: "Gemini-powered interactive quiz generator. Creates custom quizzes on any topic with adaptive difficulty, immediate feedback and score tracking.",
        image: "aiQuizbot.png",
        github: "https://github.com/Naadir-Dev-Portfolio/Streamlit-AIQuizbot",
        demo: "https://aiquizbot.streamlit.app/",
        status: "live"
      },
      {
        id: "portfolio-ai-assistant",
        title: "Portfolio AI Assistant",
        tags: ["Python", "Streamlit", "Gemini", "Conversational AI"],
        description: "Conversational AI assistant that knows everything about this portfolio — projects, skills, experience. Ask it anything about my work.",
        image: "ai-assistant.png",
        github: "https://github.com/Naadir-Dev-Portfolio/Streamlit-Portfolio-AI-Assistant",
        demo: null,
        status: "live"
      }
    ],
    nlp: [
      {
        id: "nl-finance-query",
        title: "Natural Language Finance Query",
        tags: ["Python", "SentenceTransformers", "NLP", "PyQt6", "Cosine Similarity"],
        description: "Semantic search over financial records using paraphrase-MiniLM. Ask natural language questions like 'How much did I spend on transport in March?' and get direct answers.",
        image: "nl-finance-query.png",
        github: "https://github.com/Naadir-Dev-Portfolio/Desktop-NL-Finance-Query",
        demo: null,
        status: "live"
      },
      {
        id: "ai-predictive-typing",
        title: "AI Predictive Typing",
        tags: ["Python", "NLP", "Keyboard Detection", "tkinter"],
        description: "Real-time predictive typing assistant using keyboard input detection and NLP to suggest context-aware word completions.",
        image: "ai-predictive-typing.png",
        github: "https://github.com/Naadir-Dev-Portfolio/Python-AI-Prompt-Generator",
        demo: null,
        status: "live"
      }
    ],
    prompt: [
      {
        id: "ai-prompt-generator",
        title: "1000-Prompt AI Engineering Toolkit",
        tags: ["Python", "Generative AI", "Prompt Engineering"],
        description: "A systematic prompt engineering toolkit: generates, tests and categorises 1000+ prompts across use-cases. Demonstrates deep understanding of LLM instruction design.",
        image: "ai-prompt-generator.png",
        github: "https://github.com/Naadir-Dev-Portfolio/Python-AI-Prompt-Generator",
        demo: null,
        status: "live"
      }
    ]
  },

  /* ══════════════════════════════════════════════════════════════
     TRADING & QUANTITATIVE FINANCE
  ══════════════════════════════════════════════════════════════ */
  trading: {
    backtesting: [
      {
        id: "algo-backtester",
        title: "Advanced Algorithmic Backtester",
        tags: ["Python", "vectorbt", "optuna", "TA-Lib", "Pandas", "Crypto"],
        description: "Strategy research tool combining vectorbt's ultra-fast backtesting with Optuna Bayesian optimisation across 50+ TA-Lib indicators. Multi-asset, multi-timeframe.",
        image: "algo-backtester.png",
        github: "https://github.com/Naadir-Dev-Portfolio/Trading-Algo-Backtester",
        demo: null,
        status: "live"
      }
    ],
    livedata: [
      {
        id: "binance-websocket",
        title: "Binance WebSocket Live Feed",
        tags: ["Python", "WebSockets", "Binance API", "Real-time Data"],
        description: "Live cryptocurrency price streaming via Binance WebSocket API. SOL/USDT ticker stream with real-time processing pipeline — the live data layer for the backtester.",
        image: "binance-websocket.png",
        github: "https://github.com/Naadir-Dev-Portfolio/Trading-Algo-Backtester",
        demo: null,
        status: "live"
      },
      {
        id: "crypto-news-aggregator-trading",
        title: "Crypto Panic News Aggregator",
        tags: ["Python", "CryptoPanic API", "Sentiment", "News Scraping"],
        description: "Pulls and organises real-time crypto news from CryptoPanic API. Keyword scoring, source filtering and structured export for trading sentiment analysis.",
        image: "crypto-news.png",
        github: "https://github.com/Naadir-Dev-Portfolio/Python-Crypto-News-Aggregator",
        demo: null,
        status: "live"
      }
    ],
    forecasting: [
      {
        id: "neuralprophet",
        title: "NeuralProphet Crypto Forecasting",
        tags: ["Python", "NeuralProphet", "Time Series", "ADA/USDT", "Plotly"],
        description: "Neural network time series forecasting on ADA/USDT 15-minute OHLCV data using NeuralProphet — Meta's neural extension of Prophet. Interactive Plotly output.",
        image: "neuralprophet.png",
        github: "https://github.com/Naadir-Dev-Portfolio/Trading-Algo-Backtester",
        demo: null,
        status: "live"
      },
      {
        id: "income-forecasting-trading",
        title: "Multi-Model Income Forecaster",
        tags: ["Python", "Prophet", "ARIMA", "scikit-learn", "PyQt6"],
        description: "Compare ARIMA, Prophet and linear regression forecasts side-by-side on any time series CSV. Useful for both financial planning and strategy research.",
        image: "income-forecasting.png",
        github: "https://github.com/Naadir-Dev-Portfolio/Desktop-Income-Forecasting",
        demo: null,
        status: "live"
      }
    ]
  },

  /* ══════════════════════════════════════════════════════════════
     WEB
  ══════════════════════════════════════════════════════════════ */
  web: {
    teamsites: [
      {
        id: "ccmi-team-site",
        title: "CCMI Data Team Website",
        tags: ["HTML", "CSS", "JavaScript", "Responsive Design"],
        description: "Front-end team site I designed and built for my data team — includes Power BI report library, Power Apps directory, documents hub and dynamic team dashboard.",
        image: "ccmisite_demo.png",
        github: "https://github.com/Naadir-Dev-Portfolio/Website-ccmi-team-site",
        demo: "https://ccmiteamsite-by-naadir.netlify.app/",
        status: "live"
      },
      {
        id: "pbi-request-site",
        title: "Power BI Report Request Portal",
        tags: ["HTML", "CSS", "JavaScript", "Power BI", "Visio"],
        description: "Interactive request portal with embedded Visio process flow guiding stakeholders through the end-to-end Power BI report request and delivery workflow.",
        image: "pbirequest.png",
        github: "https://github.com/Naadir-Dev-Portfolio/Website-PowerBI-Request-Portal",
        demo: "https://powerbirequest-by-naadir.netlify.app/",
        status: "live"
      }
    ],
    tools: [
      {
        id: "economic-dashboard",
        title: "Global Economic Intelligence Dashboard",
        tags: ["Python", "JavaScript", "Plotly", "FRED API", "Economics Data"],
        description: "Live web dashboard tracking 20+ global economic indicators: yield curves, housing markets, unemployment, CAPE ratio, credit spreads, and property indices across 8 countries.",
        image: "economic-dashboard.png",
        github: "https://github.com/Naadir-Dev-Portfolio/Python-Economic-Dashboard",
        demo: null,
        status: "wip"
      }
    ],
    cognitive: [
      {
        id: "raindrops",
        title: "Rain Drops — Arithmetic Speed Game",
        tags: ["HTML5 Canvas", "JavaScript", "CSS", "Maths"],
        description: "Replica of the Lumosity Rain Drops brain training game. Arithmetic equations fall as raindrops — solve them before they hit the ground. Increasing speed across levels.",
        image: "raindropsScreen.png",
        github: "https://github.com/Naadir-Dev-Portfolio/HTML5-Game-RainDrops",
        demo: "https://raindrops-by-naadir.netlify.app/",
        status: "live"
      },
      {
        id: "hexamatch",
        title: "Hexamatch — Fractions Tile Game",
        tags: ["HTML5 Canvas", "JavaScript", "CSS", "Fractions"],
        description: "Hexagonal tile-matching game built to develop intuitive fraction understanding. Match equivalent fractions, decimals and percentages against the clock.",
        image: "hexamatchScreen.png",
        github: "https://github.com/Naadir-Dev-Portfolio/HTML5-Game-Hexamatch",
        demo: "https://hexamatch-by-naadir.netlify.app/",
        status: "live"
      },
      {
        id: "algebraverse",
        title: "AlgebraVerse — Algebra Challenge",
        tags: ["HTML5 Canvas", "JavaScript", "CSS", "Algebra"],
        description: "Progressive algebra challenge game I built to relearn algebra myself — solving equations, factorising expressions and working with inequalities. 40 levels.",
        image: "algebraverseScreen.png",
        github: "https://github.com/Naadir-Dev-Portfolio/HTML5-Game-Algebraverse",
        demo: "https://algebraverse-by-naadir.netlify.app/",
        status: "live"
      },
      {
        id: "logicgrid",
        title: "Logic Grid — Boolean Reasoning",
        tags: ["HTML5 Canvas", "JavaScript", "CSS", "Logic Gates", "Boolean"],
        description: "Visualises logic gates and Boolean operations in an interactive puzzle game. AND, OR, NOT, XOR — builds Boolean reasoning from first principles.",
        image: "logicgridscreen.png",
        github: "https://github.com/Naadir-Dev-Portfolio/HTML5-Game-LogicGrid",
        demo: "https://logicgrid-by-naadir.netlify.app/",
        status: "live"
      }
    ]
  }
};

/* ══════════════════════════════════════════════════════════════
   SITE CONFIG — edit this to update meta info
══════════════════════════════════════════════════════════════ */
const SITE_CONFIG = {
  name: "Naadir",
  role: "Data Automation Specialist",
  tagline: "Inspiring teams to achieve more with seamless data automation.",
  subtitle: ["Excel & VBA Architect", "Python Developer", "AI Solutions Builder", "Reporting Specialist"],
  github: "https://github.com/Naadir-Dev-Portfolio",
  linkedin: "#",
  email: "",
  aiSystemPrompt: `You are "Naadir's Portfolio Assistant" — a professional AI representing Naadir's skills and projects.
Naadir is a Data Automation Specialist with deep expertise in:
- Excel VBA (enterprise-grade macros, SAP GUI automation, multi-sheet audit tools, Power Query pipelines)
- Power BI reporting and data modelling
- Python development (PyQt6 desktop apps, Streamlit, data science, ML, automation)
- AI & Generative AI (Gemini, multi-agent systems, NLP, SentenceTransformers)
- Trading & Quantitative Finance (vectorbt, optuna, NeuralProphet, Binance API)
- Web development (HTML5, CSS, JavaScript, Netlify)

Key projects:
- Echo Sphere One (ESO/Spheria): personal AI OS with 10+ Gemini agents, MS Graph API, PyQt6 animated orb
- Excel VBA Automation Toolkit: SAP GUI scripting, Power Query pipelines, audit macros
- Advanced Algo Backtester: vectorbt + optuna + TA-Lib + Binance WebSocket
- CCMI Gen AI Chatbot: deployed Streamlit + Gemini team chatbot
- Global Economic Dashboard: 20+ live economic indicators (in progress)

Keep answers concise, professional, and accurate. If asked about something not in the portfolio, say so politely.`,
  heroRailPanels: [
    { label: "Excel & VBA", sub: "Enterprise automation", link: "#excel", svg: "excel" },
    { label: "Python Apps", sub: "Desktop & data tools", link: "#python", svg: "python" },
    { label: "AI & Agents", sub: "Gemini, multi-agent systems", link: "#ai", svg: "ai" },
    { label: "Trading & Quant", sub: "Backtesting & forecasting", link: "#trading", svg: "trading" },
    { label: "Web & Games", sub: "Sites & HTML5 games", link: "#web", svg: "web" },
    { label: "Economics", sub: "Global data dashboard", link: "#web", svg: "economics" }
  ]
};
