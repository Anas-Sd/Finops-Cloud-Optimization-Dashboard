const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const { serviceMetadata } = require('../config/serviceMetadata');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'finops.db');

// Ensure parent directory exists
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Execute schema
const schemaPath = path.join(__dirname, 'schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');
db.exec(schemaSql);

// Seed 30 days of historical data if database is empty
seedHistoricalDataIfEmpty();

function seedHistoricalDataIfEmpty() {
  const rowCount = db.prepare('SELECT COUNT(*) as count FROM usage_history').get();
  if (rowCount.count > 0) {
    return;
  }

  console.log('[DB] Seeding 30 days of initial historical trend data...');

  const insertStmt = db.prepare(`
    INSERT INTO usage_history (containerName, team, timestamp, cpuLimitCores, cpuUsedCores, memLimitMB, memUsedMB, costPerHour)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    const now = new Date();
    // Generate daily snapshot entries for past 30 days
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const isoTimestamp = date.toISOString();

      Object.entries(serviceMetadata).forEach(([containerName, meta]) => {
        // Idle containers have ~2-8% utilization, active containers have ~45-75% utilization
        const isIdle = ['checkout-service', 'user-auth', 'inventory-api', 'notification-worker', 'email-service', 'cache-warmer', 'log-aggregator'].includes(containerName);
        
        let cpuUsedRatio = isIdle ? (0.02 + Math.random() * 0.05) : (0.50 + Math.random() * 0.25);
        let memUsedRatio = isIdle ? (0.08 + Math.random() * 0.07) : (0.40 + Math.random() * 0.30);

        const cpuUsedCores = Number((meta.cpuLimitCores * cpuUsedRatio).toFixed(3));
        const memUsedMB = Number((meta.memLimitMB * memUsedRatio).toFixed(1));

        insertStmt.run(
          containerName,
          meta.team,
          isoTimestamp,
          meta.cpuLimitCores,
          cpuUsedCores,
          meta.memLimitMB,
          memUsedMB,
          meta.costPerHour
        );
      });
    }
  });

  transaction();
  console.log('[DB] Historical data seeded successfully.');
}

module.exports = db;
