CREATE TABLE IF NOT EXISTS visits (
    id TEXT PRIMARY KEY,
    ip_address TEXT NOT NULL,
    country TEXT NOT NULL,
    page TEXT NOT NULL,
    started_at INTEGER NOT NULL,
    last_seen_at INTEGER NOT NULL,
    active_seconds INTEGER NOT NULL DEFAULT 0 CHECK (active_seconds >= 0),
    tracking_method TEXT NOT NULL CHECK (tracking_method IN ('javascript', 'pixel'))
);

CREATE INDEX IF NOT EXISTS idx_visits_started_at
    ON visits (started_at DESC);

CREATE INDEX IF NOT EXISTS idx_visits_last_seen_at
    ON visits (last_seen_at DESC);

CREATE INDEX IF NOT EXISTS idx_visits_ip_address
    ON visits (ip_address);

CREATE INDEX IF NOT EXISTS idx_visits_country
    ON visits (country);
