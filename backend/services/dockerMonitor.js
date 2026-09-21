const Docker = require('dockerode');
const fs = require('fs');
const db = require('../db/database');
const { getMetadataForContainer } = require('../config/serviceMetadata');

// Initialize Dockerode with platform fallback
let docker;
if (fs.existsSync('/var/run/docker.sock')) {
  docker = new Docker({ socketPath: '/var/run/docker.sock' });
} else if (process.platform === 'win32') {
  docker = new Docker({ socketPath: '//./pipe/docker_engine' });
} else {
  docker = new Docker();
}

let latestLiveStats = [];
let ioInstance = null;

/**
 * Calculate CPU % from Docker stats using standard Docker CLI CPU delta formula
 */
function calculateCpuPercent(stats) {
  const cpuStats = stats.cpu_stats || {};
  const preCpuStats = stats.precpu_stats || {};

  const totalUsage = cpuStats.cpu_usage?.total_usage || 0;
  const preTotalUsage = preCpuStats.cpu_usage?.total_usage || 0;

  const systemUsage = cpuStats.system_cpu_usage || 0;
  const preSystemUsage = preCpuStats.system_cpu_usage || 0;

  const cpuDelta = totalUsage - preTotalUsage;
  const systemDelta = systemUsage - preSystemUsage;

  let numCpus = cpuStats.online_cpus || (cpuStats.cpu_usage?.percpu_usage ? cpuStats.cpu_usage.percpu_usage.length : 1);
  if (!numCpus || numCpus < 1) numCpus = 1;

  if (systemDelta > 0 && cpuDelta > 0) {
    const cpuPercent = (cpuDelta / systemDelta) * numCpus * 100.0;
    const cpuUsedCores = (cpuDelta / systemDelta) * numCpus;
    return {
      cpuPercent: Number(cpuPercent.toFixed(2)),
      cpuUsedCores: Number(cpuUsedCores.toFixed(3))
    };
  }

  return { cpuPercent: 0.0, cpuUsedCores: 0.0 };
}

/**
 * Poll real Docker container stats
 */
async function pollContainerStats() {
  try {
    const containers = await docker.listContainers({ all: false });
    const currentSnapshot = [];

    const dbInsertStmt = db.prepare(`
      INSERT INTO usage_history (containerName, team, timestamp, cpuLimitCores, cpuUsedCores, memLimitMB, memUsedMB, costPerHour)
      VALUES (?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction((rows) => {
      for (const row of rows) {
        dbInsertStmt.run(
          row.containerName,
          row.team,
          row.cpuLimitCores,
          row.cpuUsedCores,
          row.memLimitMB,
          row.memUsedMB,
          row.costPerHour
        );
      }
    });

    for (const containerInfo of containers) {
      const containerName = containerInfo.Names[0].replace(/^\//, '');
      const meta = getMetadataForContainer(containerName);

      try {
        const container = docker.getContainer(containerInfo.Id);
        const stats = await container.stats({ stream: false });

        const { cpuPercent, cpuUsedCores } = calculateCpuPercent(stats);

        // Calculate Memory Usage & Limit
        const cache = stats.memory_stats?.stats?.cache || stats.memory_stats?.stats?.inactive_file || 0;
        const rawUsage = (stats.memory_stats?.usage || 0) - cache;
        const memUsedMB = Number(Math.max(0, rawUsage / (1024 * 1024)).toFixed(1));

        // Memory Limit in MB
        const memLimitBytes = stats.memory_stats?.limit || 0;
        const memLimitMBFromStats = memLimitBytes > 0 ? memLimitBytes / (1024 * 1024) : meta.memLimitMB;
        const memLimitMB = Number(memLimitMBFromStats.toFixed(1));
        const memPercent = memLimitMB > 0 ? Number(((memUsedMB / memLimitMB) * 100).toFixed(2)) : 0;

        const statRecord = {
          containerId: containerInfo.Id.substring(0, 12),
          containerName,
          team: meta.team,
          status: containerInfo.State || 'running',
          cpuPercent,
          cpuUsedCores,
          cpuLimitCores: meta.cpuLimitCores,
          memUsedMB,
          memLimitMB: meta.memLimitMB || memLimitMB,
          memPercent,
          costPerHour: meta.costPerHour,
          timestamp: new Date().toISOString()
        };

        currentSnapshot.push(statRecord);
      } catch (err) {
        console.error(`[DockerMonitor] Error fetching stats for ${containerName}:`, err.message);
      }
    }

    if (currentSnapshot.length > 0) {
      latestLiveStats = currentSnapshot;
      transaction(currentSnapshot);

      if (ioInstance) {
        ioInstance.emit('container-stats', {
          timestamp: new Date().toISOString(),
          containers: currentSnapshot
        });
      }
    }
  } catch (err) {
    console.error('[DockerMonitor] Error listing containers:', err.message);
  }
}

/**
 * Start background polling service
 */
function startMonitoring(io, intervalMs = 2000) {
  ioInstance = io;
  console.log(`[DockerMonitor] Telemetry monitoring started (polling every ${intervalMs}ms)...`);
  
  // Initial poll
  pollContainerStats();

  // Recurring poll
  setInterval(pollContainerStats, intervalMs);
}

function getLatestLiveStats() {
  return latestLiveStats;
}

module.exports = {
  startMonitoring,
  getLatestLiveStats,
  pollContainerStats
};
