CREATE TABLE IF NOT EXISTS usage_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    containerName TEXT NOT NULL,
    team TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    cpuLimitCores REAL NOT NULL,
    cpuUsedCores REAL NOT NULL,
    memLimitMB REAL NOT NULL,
    memUsedMB REAL NOT NULL,
    costPerHour REAL NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_usage_timestamp ON usage_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_usage_container ON usage_history(containerName);
