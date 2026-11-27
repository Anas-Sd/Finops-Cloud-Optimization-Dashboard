const db = require('../db/database');

/**
 * Compute comprehensive FinOps analytics dynamically from live container snapshot or DB fallback
 */
function computeAnalytics(liveStats, wasteData) {
  let totalCpuLimit = 0;
  let totalCpuUsed = 0;
  let totalMemLimitMB = 0;
  let totalMemUsedMB = 0;
  let containerUtilizationList = [];
  let severeCount = 0;   // < 10%
  let moderateCount = 0; // 10% - 20%
  let healthyCount = 0;  // >= 20%

  if (liveStats && Array.isArray(liveStats) && liveStats.length > 0) {
    containerUtilizationList = liveStats.map(c => {
      const cpuLimit = c.cpuLimitCores || 1;
      const cpuUsed = c.cpuUsedCores || 0;
      const memLimit = c.memLimitMB || 512;
      const memUsed = c.memUsedMB || 0;
      const cpuPct = cpuLimit > 0 ? (cpuUsed / cpuLimit) * 100 : 0;
      const memPct = memLimit > 0 ? (memUsed / memLimit) * 100 : 0;
      const maxPct = Math.max(cpuPct, memPct);

      totalCpuLimit += cpuLimit;
      totalCpuUsed += cpuUsed;
      totalMemLimitMB += memLimit;
      totalMemUsedMB += memUsed;

      if (maxPct < 10) severeCount++;
      else if (maxPct < 20) moderateCount++;
      else healthyCount++;

      return {
        containerName: c.containerName,
        team: c.team,
        cpuPercent: Number(cpuPct.toFixed(1)),
        memPercent: Number(memPct.toFixed(1)),
        cpuLimit,
        cpuUsed: Number(cpuUsed.toFixed(2)),
        memLimit,
        memUsed: Number(memUsed.toFixed(0)),
        monthlyCost: Math.round((c.costPerHour || 15) * 730)
      };
    });
  } else {
    // Database fallback
    const totalResourceStats = db.prepare(`
      SELECT 
        SUM(cpuLimitCores) as totalCpuLimit,
        SUM(avgCpuUsedCores) as totalCpuUsed,
        SUM(memLimitMB) as totalMemLimitMB,
        SUM(avgMemUsedMB) as totalMemUsedMB
      FROM (
        SELECT 
          containerName,
          AVG(cpuLimitCores) as cpuLimitCores,
          AVG(cpuUsedCores) as avgCpuUsedCores,
          AVG(memLimitMB) as memLimitMB,
          AVG(memUsedMB) as avgMemUsedMB
        FROM usage_history
        WHERE timestamp >= datetime('now', '-24 hours')
        GROUP BY containerName
      )
    `).get();

    totalCpuLimit = Number((totalResourceStats?.totalCpuLimit || 0).toFixed(2));
    totalCpuUsed = Number((totalResourceStats?.totalCpuUsed || 0).toFixed(2));
    totalMemLimitMB = Number((totalResourceStats?.totalMemLimitMB || 0).toFixed(0));
    totalMemUsedMB = Number((totalResourceStats?.totalMemUsedMB || 0).toFixed(0));

    containerUtilizationList = db.prepare(`
      SELECT 
        containerName,
        team,
        AVG(cpuLimitCores) as cpuLimit,
        AVG(cpuUsedCores) as cpuUsed,
        AVG(memLimitMB) as memLimit,
        AVG(memUsedMB) as memUsed,
        AVG(costPerHour) as costPerHour
      FROM usage_history
      WHERE timestamp >= datetime('now', '-24 hours')
      GROUP BY containerName
    `).all().map(c => {
      const cpuPct = c.cpuLimit > 0 ? (c.cpuUsed / c.cpuLimit) * 100 : 0;
      const memPct = c.memLimit > 0 ? (c.memUsed / c.memLimit) * 100 : 0;
      const maxPct = Math.max(cpuPct, memPct);

      if (maxPct < 10) severeCount++;
      else if (maxPct < 20) moderateCount++;
      else healthyCount++;

      return {
        containerName: c.containerName,
        team: c.team,
        cpuPercent: Number(cpuPct.toFixed(1)),
        memPercent: Number(memPct.toFixed(1)),
        cpuLimit: c.cpuLimit,
        cpuUsed: Number(c.cpuUsed.toFixed(2)),
        memLimit: c.memLimit,
        memUsed: Number(c.memUsed.toFixed(0)),
        monthlyCost: Math.round(c.costPerHour * 730)
      };
    });
  }

  totalCpuLimit = Number(totalCpuLimit.toFixed(2));
  totalCpuUsed = Number(totalCpuUsed.toFixed(2));
  totalMemLimitMB = Number(totalMemLimitMB.toFixed(0));
  totalMemUsedMB = Number(totalMemUsedMB.toFixed(0));

  const overallCpuUtilPercent = totalCpuLimit > 0 ? Number(((totalCpuUsed / totalCpuLimit) * 100).toFixed(1)) : 0;
  const overallMemUtilPercent = totalMemLimitMB > 0 ? Number(((totalMemUsedMB / totalMemLimitMB) * 100).toFixed(1)) : 0;

  // Infrastructure Efficiency Score (0 to 100)
  const efficiencyScore = Math.min(100, Math.max(0, Math.round((overallCpuUtilPercent * 0.6) + (overallMemUtilPercent * 0.4) + 30)));

  // Team comparison
  const teamComparisonMap = {};
  for (const c of containerUtilizationList) {
    if (!teamComparisonMap[c.team]) {
      teamComparisonMap[c.team] = {
        team: c.team,
        containerCount: 0,
        containers: [],
        providedCpuCores: 0,
        usedCpuCores: 0,
        providedMemMB: 0,
        usedMemMB: 0,
        currentSpend: 0,
        actualUsedSpend: 0,
        targetSpend: 0,
        savings: 0
      };
    }
    const t = teamComparisonMap[c.team];
    t.containerCount++;
    t.containers.push(c.containerName);
    t.providedCpuCores += c.cpuLimit;
    t.usedCpuCores += c.cpuUsed;
    t.providedMemMB += c.memLimit;
    t.usedMemMB += c.memUsed;
    t.currentSpend += c.monthlyCost;

    const allContainerEntry = wasteData?.allContainers?.find(w => w.containerName === c.containerName);
    const containerActuallyUsed = allContainerEntry?.actuallyUsedCost !== undefined 
      ? allContainerEntry.actuallyUsedCost 
      : Math.round(c.monthlyCost * (c.cpuPercent / 100));
    t.actualUsedSpend += containerActuallyUsed;

    const wasteEntry = wasteData?.wastefulContainers?.find(w => w.containerName === c.containerName);
    if (wasteEntry) {
      t.targetSpend += wasteEntry.rightSizedMonthlyCost;
      t.savings += wasteEntry.estimatedMonthlySavings;
    } else {
      t.targetSpend += c.monthlyCost;
    }
  }

  const teamComparison = Object.values(teamComparisonMap).map(t => ({
    ...t,
    actualUsedSpend: Math.round(t.actualUsedSpend),
    providedCpuCores: Number(t.providedCpuCores.toFixed(2)),
    usedCpuCores: Number(t.usedCpuCores.toFixed(2)),
    cpuUtilPercent: t.providedCpuCores > 0 ? Number(((t.usedCpuCores / t.providedCpuCores) * 100).toFixed(1)) : 0,
    providedMemMB: Number(t.providedMemMB.toFixed(0)),
    usedMemMB: Number(t.usedMemMB.toFixed(0)),
    memUtilPercent: t.providedMemMB > 0 ? Number(((t.usedMemMB / t.providedMemMB) * 100).toFixed(1)) : 0
  }));

  const severityDistribution = wasteData?.severityDistribution || [
    { name: 'Severe Waste (<10%)', value: severeCount, color: '#fb7185' },
    { name: 'Moderate Waste (10-20%)', value: moderateCount, color: '#f59e0b' },
    { name: 'Healthy / Efficient (20-85%)', value: healthyCount, color: '#10b981' }
  ];

  return {
    efficiencyScore,
    efficiencyRating: efficiencyScore > 80 ? 'Optimal' : efficiencyScore > 50 ? 'Fair' : 'Poor',
    resourceTotals: {
      totalCpuLimit,
      totalCpuUsed,
      overallCpuUtilPercent,
      totalMemLimitMB,
      totalMemUsedMB,
      overallMemUtilPercent
    },
    severityDistribution,
    containerUtilizationList,
    teamComparison
  };
}

module.exports = { computeAnalytics };
