#!/usr/bin/env python3
"""Read private portfolio analytics from Cloudflare D1.

Uses only the Python standard library. Credentials come from environment
variables or an ignored .env file in the repository root.
"""

from __future__ import annotations

import argparse
import ipaddress
import json
import os
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any


API_ROOT = "https://api.cloudflare.com/client/v4"
ENV_NAMES = (
    "CLOUDFLARE_ACCOUNT_ID",
    "CLOUDFLARE_DATABASE_ID",
    "CLOUDFLARE_D1_TOKEN",
)


def load_dotenv(path: Path) -> None:
    """Load simple KEY=VALUE entries without overriding real environment values."""
    if not path.is_file():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        if key not in ENV_NAMES:
            continue
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
            value = value[1:-1]
        os.environ.setdefault(key, value)


class D1Client:
    def __init__(self) -> None:
        load_dotenv(Path(__file__).resolve().with_name(".env"))
        values = {name: os.environ.get(name, "").strip() for name in ENV_NAMES}
        missing = [name for name, value in values.items() if not value]
        if missing:
            names = ", ".join(missing)
            raise SystemExit(
                f"Missing {names}. Copy .env.example to .env and fill in your "
                "Cloudflare values."
            )

        self.account_id = values["CLOUDFLARE_ACCOUNT_ID"]
        self.database_id = values["CLOUDFLARE_DATABASE_ID"]
        self.token = values["CLOUDFLARE_D1_TOKEN"]
        self.url = (
            f"{API_ROOT}/accounts/{self.account_id}/d1/database/"
            f"{self.database_id}/query"
        )

    def query(self, sql: str, params: list[Any] | None = None) -> list[dict[str, Any]]:
        body = json.dumps({"sql": sql, "params": params or []}).encode("utf-8")
        request = urllib.request.Request(
            self.url,
            data=body,
            method="POST",
            headers={
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json",
                "User-Agent": "naadir-portfolio-analytics/1.0",
            },
        )
        try:
            with urllib.request.urlopen(request, timeout=20) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as error:
            detail = error.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"Cloudflare returned HTTP {error.code}: {detail}") from error
        except urllib.error.URLError as error:
            raise RuntimeError(f"Could not reach Cloudflare: {error.reason}") from error

        if not payload.get("success"):
            raise RuntimeError(f"Cloudflare query failed: {payload.get('errors') or payload}")

        result = payload.get("result", [])
        batches = result if isinstance(result, list) else [result]
        rows: list[dict[str, Any]] = []
        for batch in batches:
            if isinstance(batch, dict):
                rows.extend(batch.get("results") or [])
        return rows


def local_datetime(epoch_seconds: Any) -> str:
    try:
        value = int(epoch_seconds)
    except (TypeError, ValueError):
        return "-"
    return datetime.fromtimestamp(value).astimezone().strftime("%Y-%m-%d %H:%M")


def duration(value: Any) -> str:
    try:
        seconds = max(0, int(round(float(value or 0))))
    except (TypeError, ValueError):
        seconds = 0
    hours, remainder = divmod(seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    if hours:
        return f"{hours}h {minutes}m"
    if minutes:
        return f"{minutes}m {seconds}s"
    return f"{seconds}s"


def display_ip(value: Any, full_ip: bool) -> str:
    text = str(value or "unknown")
    if full_ip or text == "unknown":
        return text
    try:
        address = ipaddress.ip_address(text)
    except ValueError:
        return "unknown"
    if address.version == 4:
        return f"{text.split('.')[0]}.xxx.xxx.xxx"
    groups = address.exploded.split(":")
    return f"{groups[0]}:{groups[1]}:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx"


def clipped(value: Any, width: int) -> str:
    text = str(value or "-")
    return text if len(text) <= width else text[: width - 1] + "…"


def print_visit_table(rows: list[dict[str, Any]], full_ip: bool, live: bool = False) -> None:
    if live:
        print(f"{'LAST SEEN':16}  {'COUNTRY':7}  {'IP':31}  {'PAGE':32}  {'ACTIVE':9}  METHOD")
        for row in rows:
            print(
                f"{local_datetime(row.get('last_seen_at')):16}  "
                f"{clipped(row.get('country'), 7):7}  "
                f"{clipped(display_ip(row.get('ip_address'), full_ip), 31):31}  "
                f"{clipped(row.get('page'), 32):32}  "
                f"{duration(row.get('active_seconds')):9}  "
                f"{row.get('tracking_method', '-')}"
            )
        return

    print(f"{'TIME':16}  {'COUNTRY':7}  {'IP':31}  {'PAGE':32}  {'ACTIVE':9}  METHOD")
    for row in rows:
        print(
            f"{local_datetime(row.get('started_at')):16}  "
            f"{clipped(row.get('country'), 7):7}  "
            f"{clipped(display_ip(row.get('ip_address'), full_ip), 31):31}  "
            f"{clipped(row.get('page'), 32):32}  "
            f"{duration(row.get('active_seconds')):9}  "
            f"{row.get('tracking_method', '-')}"
        )


def recent(client: D1Client, limit: int, full_ip: bool) -> None:
    rows = client.query(
        """
        SELECT started_at, country, ip_address, page, active_seconds, tracking_method
        FROM visits
        ORDER BY started_at DESC
        LIMIT ?
        """,
        [limit],
    )
    print_visit_table(rows, full_ip)


def today(client: D1Client) -> None:
    now = datetime.now().astimezone()
    start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=1)
    params = [int(start.timestamp()), int(end.timestamp())]
    summary_rows = client.query(
        """
        SELECT COUNT(*) AS visits,
               COUNT(DISTINCT ip_address) AS unique_ips,
               COALESCE(
                   AVG(CASE
                       WHEN tracking_method = 'javascript' THEN active_seconds
                   END),
                   0
               ) AS average_active_seconds
        FROM visits
        WHERE started_at >= ? AND started_at < ?
        """,
        params,
    )
    page_rows = client.query(
        """
        SELECT page, COUNT(*) AS visits
        FROM visits
        WHERE started_at >= ? AND started_at < ?
        GROUP BY page
        ORDER BY visits DESC, page ASC
        """,
        params,
    )

    summary = summary_rows[0] if summary_rows else {}
    print(f"Today ({start.strftime('%Y-%m-%d %Z')})")
    print(f"Visits:                  {int(summary.get('visits') or 0)}")
    print(f"Approximate unique IPs:  {int(summary.get('unique_ips') or 0)}")
    print(f"Average active duration: {duration(summary.get('average_active_seconds'))}")
    print("\nMost visited pages")
    if not page_rows:
        print("No visits yet.")
    for row in page_rows:
        print(f"{int(row.get('visits') or 0):5}  {row.get('page') or '-'}")


def countries(client: D1Client) -> None:
    rows = client.query(
        """
        SELECT country, COUNT(*) AS visits
        FROM visits
        GROUP BY country
        ORDER BY visits DESC, country ASC
        """
    )
    print(f"{'COUNTRY':10}  VISITS")
    for row in rows:
        print(f"{clipped(row.get('country'), 10):10}  {int(row.get('visits') or 0)}")


def live(client: D1Client, interval: int, minutes: int, limit: int, full_ip: bool) -> None:
    try:
        while True:
            cutoff = int(time.time()) - minutes * 60
            rows = client.query(
                """
                SELECT last_seen_at, country, ip_address, page,
                       active_seconds, tracking_method
                FROM visits
                WHERE last_seen_at >= ?
                ORDER BY last_seen_at DESC
                LIMIT ?
                """,
                [cutoff, limit],
            )
            print("\033[2J\033[H", end="")
            print(
                f"Portfolio traffic — last {minutes} minutes — refreshed "
                f"{datetime.now().astimezone().strftime('%Y-%m-%d %H:%M:%S %Z')}"
            )
            print("Press Ctrl+C to stop.\n")
            print_visit_table(rows, full_ip, live=True)
            time.sleep(interval)
    except KeyboardInterrupt:
        print("\nStopped.")


def positive_int(value: str) -> int:
    number = int(value)
    if number < 1:
        raise argparse.ArgumentTypeError("must be at least 1")
    return number


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Inspect private portfolio analytics in Cloudflare D1.")
    parser.add_argument(
        "--full-ip",
        action="store_true",
        help="display complete stored IP addresses instead of masking them",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    recent_parser = subparsers.add_parser("recent", help="show recent visits")
    recent_parser.add_argument("--limit", type=positive_int, default=20)

    subparsers.add_parser("today", help="show today's summary")
    subparsers.add_parser("countries", help="group all visits by country")

    live_parser = subparsers.add_parser("live", help="poll and refresh recent traffic")
    live_parser.add_argument("--interval", type=positive_int, default=5, help="refresh seconds")
    live_parser.add_argument("--minutes", type=positive_int, default=30, help="recent window")
    live_parser.add_argument("--limit", type=positive_int, default=50)
    return parser


def main() -> int:
    args = build_parser().parse_args()
    try:
        client = D1Client()
        if args.command == "recent":
            recent(client, args.limit, args.full_ip)
        elif args.command == "today":
            today(client)
        elif args.command == "countries":
            countries(client)
        elif args.command == "live":
            live(client, args.interval, args.minutes, args.limit, args.full_ip)
        return 0
    except RuntimeError as error:
        print(f"Error: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
