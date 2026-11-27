const db = require('../db/database');

const accumulatedCostMap = {};

/**
 * Detect wasteful containers and calculate potential FinOps savings in ₹ (INR).
 * Accepts optional liveStats array from DockerMonitor for real-time calculation.
 */
function analyzeWasteAndRecommendations(liveStats = null) {
  let itemsToAnalyze = [];

  if (liveStats && Array.isArray(liveStats) && liveStats.length > 0) {
    itemsToAnalyze = liveStats.map(item => ({
      containerName: item.containerName,
      team: item.team,
      cpuLimitCores: item.cpuLimitCores || 1,
      avgCpuUsedCores: item.cpuUsedCores || 0,
      maxCpuUsedCores: item.cpuUsedCores || 0,
      memLimitMB: item.memLimitMB || 512,
      avgMemUsedMB: item.memUsedMB || 0,
      maxMemUsedMB: item.memUsedMB || 0,
      costPerHour: item.costPerHour || 15
    }));
  } else {
    // Fallback: Query average resource usage per container over recent history
    itemsToAnalyze = db.prepare(`
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
  }

  const wastefulContainers = [];
  const allContainers = [];
  const recommendations = [];
  let totalPotentialMonthlySavings = 0;
  let totalCurrentMonthlyCost = 0;

  let deficitCount = 0;  // >= 85% (Capacity Deficit - Upsize Required)
  let severeCount = 0;   // < 10%
  let moderateCount = 0; // 10% - 20%
  let healthyCount = 0;  // 20% - 85%

  for (const item of itemsToAnalyze) {
    const currentMonthlyCost = Math.round(item.costPerHour * 730);
    totalCurrentMonthlyCost += currentMonthlyCost;

    // CPU and Memory utilization %
    const cpuUtilization = item.cpuLimitCores > 0 
      ? (item.avgCpuUsedCores / item.cpuLimitCores) * 100 
      : 0;
    const memUtilization = item.memLimitMB > 0 
      ? (item.avgMemUsedMB / item.memLimitMB) * 100 
      : 0;

    const overallUtilization = Math.max(cpuUtilization, memUtilization);

    // Monotonically non-decreasing Actually Used Cost
    const calculatedUsedCost = Math.round(currentMonthlyCost * (cpuUtilization / 100));
    if (!accumulatedCostMap[item.containerName]) {
      accumulatedCostMap[item.containerName] = Math.max(1, calculatedUsedCost);
    } else {
      accumulatedCostMap[item.containerName] = Math.max(
        accumulatedCostMap[item.containerName],
        calculatedUsedCost
      );
    }
    const actuallyUsedCost = accumulatedCostMap[item.containerName];

    // Track severity distribution for the donut chart
    if (cpuUtilization >= 85) {
      deficitCount++;
    } else if (overallUtilization < 10) {
      severeCount++;
    } else if (overallUtilization < 20) {
      moderateCount++;
    } else {
      healthyCount++;
    }

    // Flag container if utilization is < 20%
    if (overallUtilization < 20) {
      // Right-size calculation with 20% safety buffer above peak/live usage
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
        actuallyUsedCost,
        rightSizedMonthlyCost,
        estimatedMonthlySavings: monthlySavings,
        severity: overallUtilization < 10 ? 'HIGH' : 'MEDIUM',
        status: 'Wasteful'
      };

      wastefulContainers.push(wasteEntry);
      allContainers.push(wasteEntry);

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
    } else {
      // Check if container is UNDER-PROVISIONED (CPU saturation >= 85% or 100%)
      if (cpuUtilization >= 85) {
        // Under-provisioned: workload has hit capacity saturation!
        // Purchased limit is NOT enough! Danger of CPU throttling / outage
        const upsizedCpuLimit = Number((item.cpuLimitCores * 1.5).toFixed(2));
        const upsizedMemLimit = Number((item.memLimitMB * 1.5).toFixed(0));
        const upsizedMonthlyCost = Math.round(currentMonthlyCost * 1.5);
        const capacityDeficit = upsizedMonthlyCost - currentMonthlyCost;

        const underProvisionedEntry = {
          containerName: item.containerName,
          team: item.team,
          cpuUtilizationPercent: Number(cpuUtilization.toFixed(1)),
          memUtilizationPercent: Number(memUtilization.toFixed(1)),
          overallUtilizationPercent: Number(overallUtilization.toFixed(1)),
          currentCpuLimit: item.cpuLimitCores,
          avgCpuUsed: Number(item.avgCpuUsedCores.toFixed(3)),
          recommendedCpuLimit: upsizedCpuLimit,
          currentMemLimitMB: item.memLimitMB,
          avgMemUsedMB: Number(item.avgMemUsedMB.toFixed(1)),
          recommendedMemLimitMB: upsizedMemLimit,
          currentMonthlyCost,
          actuallyUsedCost,
          rightSizedMonthlyCost: upsizedMonthlyCost,
          estimatedMonthlySavings: 0,
          capacityDeficit,
          severity: 'CRITICAL_DEFICIT',
          status: 'Under-Provisioned'
        };
        allContainers.push(underProvisionedEntry);
      } else {
        // Healthy / Efficient container (utilization 20% - 85%)
        const optimalEntry = {
          containerName: item.containerName,
          team: item.team,
          cpuUtilizationPercent: Number(cpuUtilization.toFixed(1)),
          memUtilizationPercent: Number(memUtilization.toFixed(1)),
          overallUtilizationPercent: Number(overallUtilization.toFixed(1)),
          currentCpuLimit: item.cpuLimitCores,
          avgCpuUsed: Number(item.avgCpuUsedCores.toFixed(3)),
          recommendedCpuLimit: item.cpuLimitCores,
          currentMemLimitMB: item.memLimitMB,
          avgMemUsedMB: Number(item.avgMemUsedMB.toFixed(1)),
          recommendedMemLimitMB: item.memLimitMB,
          currentMonthlyCost,
          actuallyUsedCost,
          rightSizedMonthlyCost: currentMonthlyCost,
          estimatedMonthlySavings: 0,
          severity: 'HEALTHY',
          status: 'Optimal'
        };
        allContainers.push(optimalEntry);
      }
    }
  }

  // Sort containers: 1. Overdue/Under-Provisioned first, 2. Actively using (Optimal) second, 3. Idle third
  wastefulContainers.sort((a, b) => b.estimatedMonthlySavings - a.estimatedMonthlySavings);
  allContainers.sort((a, b) => {
    const isDeficitA = a.status === 'Under-Provisioned' || a.severity === 'CRITICAL_DEFICIT';
    const isDeficitB = b.status === 'Under-Provisioned' || b.severity === 'CRITICAL_DEFICIT';
    if (isDeficitA && !isDeficitB) return -1;
    if (!isDeficitA && isDeficitB) return 1;

    const isOptimalA = a.status === 'Optimal' || a.severity === 'HEALTHY';
    const isOptimalB = b.status === 'Optimal' || b.severity === 'HEALTHY';
    if (isOptimalA && !isOptimalB) return -1;
    if (!isOptimalA && isOptimalB) return 1;

    if (isOptimalA && isOptimalB) {
      return (b.cpuUtilizationPercent || 0) - (a.cpuUtilizationPercent || 0);
    }

    return (b.estimatedMonthlySavings || 0) - (a.estimatedMonthlySavings || 0);
  });
  recommendations.sort((a, b) => b.potentialMonthlySavings - a.potentialMonthlySavings);

  const severityDistribution = [
    ...(deficitCount > 0 ? [{ name: 'Capacity Deficit (≥85%)', value: deficitCount, color: '#f43f5e' }] : []),
    { name: 'Severe Waste (<10%)', value: severeCount, color: '#fb7185' },
    { name: 'Moderate Waste (10-20%)', value: moderateCount, color: '#f59e0b' },
    { name: 'Healthy / Efficient (20-85%)', value: healthyCount, color: '#10b981' }
  ];

  return {
    wastefulContainers,
    allContainers,
    severityDistribution,
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
