const db = require('../db/database');

/**
 * Detect wasteful containers and calculate potential FinOps savings in ₹ (INR)
 */
function analyzeWasteAndRecommendations() {
  // Query average resource usage per container over the last hour / recent records
  const usageSummary = db.prepare(`
    SELECT 
      containerName,
      team,
      AVG(cpuLimitCores) as cpuLimitCores,
      AVG(cpuUsedCores) as avgCpuUsedCores,
      MAX(cpuUsedCores) as maxCpuUsedCores,
      AVG(memLimitMB) as memLimitMB,
      AVG(memUsedMB) as avgMemUsedMB,
      MAX(memUsedMB) as maxMemUsedMB,
      AVG(costPerHour) as costPerHour
    FROM usage_history
    WHERE timestamp >= datetime('now', '-24 hours')
    GROUP BY containerName
  `).all();

  const wastefulContainers = [];
  const recommendations = [];
  let totalPotentialMonthlySavings = 0;
  let totalCurrentMonthlyCost = 0;

  for (const item of usageSummary) {
    const currentMonthlyCost = Math.round(item.costPerHour * 730);
    totalCurrentMonthlyCost += currentMonthlyCost;

    // CPU and Memory average utilization %
    const cpuUtilization = item.cpuLimitCores > 0 
      ? (item.avgCpuUsedCores / item.cpuLimitCores) * 100 
      : 0;
    const memUtilization = item.memLimitMB > 0 
      ? (item.avgMemUsedMB / item.memLimitMB) * 100 
      : 0;

    const overallUtilization = Math.max(cpuUtilization, memUtilization);

    // Flag container if utilization is < 20%
    if (overallUtilization < 20) {
      // Right-size calculation with 20% safety buffer above peak usage
      const peakCpuWithBuffer = Math.max(0.1, item.maxCpuUsedCores * 1.2);
      const rightSizedCpuLimit = Math.min(item.cpuLimitCores, Number(peakCpuWithBuffer.toFixed(2)));

      const peakMemWithBuffer = Math.max(32, item.maxMemUsedMB * 1.2);
      const rightSizedMemLimit = Math.min(item.memLimitMB, Number(peakMemWithBuffer.toFixed(0)));

      // Fraction of cost saved by right-sizing CPU & Memory
      const cpuSavingsRatio = (item.cpuLimitCores - rightSizedCpuLimit) / item.cpuLimitCores;
      const memSavingsRatio = (item.memLimitMB - rightSizedMemLimit) / item.memLimitMB;
      const avgSavingsRatio = Math.max(0, (cpuSavingsRatio + memSavingsRatio) / 2);

      const monthlySavings = Math.round(currentMonthlyCost * avgSavingsRatio);
      const rightSizedMonthlyCost = currentMonthlyCost - monthlySavings;

      totalPotentialMonthlySavings += monthlySavings;

      const wasteEntry = {
        containerName: item.containerName,
        team: item.team,
        cpuUtilizationPercent: Number(cpuUtilization.toFixed(1)),
        memUtilizationPercent: Number(memUtilization.toFixed(1)),
        overallUtilizationPercent: Number(overallUtilization.toFixed(1)),
        currentCpuLimit: item.cpuLimitCores,
        avgCpuUsed: Number(item.avgCpuUsedCores.toFixed(3)),
        recommendedCpuLimit: rightSizedCpuLimit,
        currentMemLimitMB: item.memLimitMB,
        avgMemUsedMB: Number(item.avgMemUsedMB.toFixed(1)),
        recommendedMemLimitMB: rightSizedMemLimit,
        currentMonthlyCost,
        rightSizedMonthlyCost,
        estimatedMonthlySavings: monthlySavings,
        severity: overallUtilization < 10 ? 'HIGH' : 'MEDIUM'
      };

      wastefulContainers.push(wasteEntry);

      recommendations.push({
        id: `rec-${item.containerName}`,
        containerName: item.containerName,
        team: item.team,
        severity: wasteEntry.severity,
        title: `Downsize ${item.containerName} (${item.team})`,
        message: `Currently using only ${cpuUtilization.toFixed(1)}% CPU and ${memUtilization.toFixed(1)}% Memory of allocated limits. Right-sizing CPU from ${item.cpuLimitCores} cores to ${rightSizedCpuLimit} cores will save ₹${monthlySavings.toLocaleString('en-IN')}/month.`,
        currentMonthlyCost,
        potentialMonthlySavings: monthlySavings,
        action: `Set cpus: '${rightSizedCpuLimit}' and memory: ${rightSizedMemLimit}M in docker-compose.yml`
      });
    }
  }

  // Sort wasteful containers by highest monthly savings first
  wastefulContainers.sort((a, b) => b.estimatedMonthlySavings - a.estimatedMonthlySavings);
  recommendations.sort((a, b) => b.potentialMonthlySavings - a.potentialMonthlySavings);

  return {
    wastefulContainers,
    recommendations,
    summary: {
      totalWastefulCount: wastefulContainers.length,
      totalCurrentMonthlyCost,
      totalPotentialMonthlySavings,
      potentialSavingsPercentage: totalCurrentMonthlyCost > 0 
        ? Number(((totalPotentialMonthlySavings / totalCurrentMonthlyCost) * 100).toFixed(1)) 
        : 0
    }
  };
}

module.exports = {
  analyzeWasteAndRecommendations
};
