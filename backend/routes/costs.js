const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { analyzeWasteAndRecommendations } = require('../services/wasteDetector');

/**
 * GET /api/costs/summary
 * Total spend (last 30 days), spend today, total waste, potential savings
 */
router.get('/summary', (req, res) => {
  try {
    const wasteData = analyzeWasteAndRecommendations();

    // Calculate total spend over last 30 days based on hourly cost * hours active
    const total30DaySpendResult = db.prepare(`
      SELECT SUM(costPerHour * 24) as total30DaySpend
      FROM (
        SELECT strftime('%Y-%m-%d', timestamp) as day, containerName, AVG(costPerHour) as costPerHour
        FROM usage_history
        WHERE timestamp >= datetime('now', '-30 days')
        GROUP BY day, containerName
      )
    `).get();

    const spendTodayResult = db.prepare(`
      SELECT SUM(costPerHour * (strftime('%H', 'now') + 1)) as spendToday
      FROM (
        SELECT containerName, AVG(costPerHour) as costPerHour
        FROM usage_history
        WHERE strftime('%Y-%m-%d', timestamp) = strftime('%Y-%m-%d', 'now')
        GROUP BY containerName
      )
    `).get();

    const total30DaySpend = Math.round(total30DaySpendResult.total30DaySpend || 0);
    const spendToday = Math.round(spendTodayResult.spendToday || (total30DaySpend / 30));

    res.json({
      success: true,
      currency: 'INR',
      currencySymbol: '₹',
      summary: {
        total30DaySpend,
        spendToday,
        totalWastefulContainers: wasteData.summary.totalWastefulCount,
        potentialMonthlySavings: wasteData.summary.totalPotentialMonthlySavings,
        potentialSavingsPercentage: wasteData.summary.potentialSavingsPercentage
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/costs/by-team
 * Aggregated cost distribution by team over last 30 days
 */
router.get('/by-team', (req, res) => {
  try {
    const teamCosts = db.prepare(`
      SELECT 
        team,
        COUNT(DISTINCT containerName) as containerCount,
        ROUND(SUM(costPerHour * 730), 0) as monthlySpend
      FROM (
        SELECT containerName, team, AVG(costPerHour) as costPerHour
        FROM usage_history
        WHERE timestamp >= datetime('now', '-30 days')
        GROUP BY containerName
      )
      GROUP BY team
      ORDER BY monthlySpend DESC
    `).all();

    res.json({
      success: true,
      teams: teamCosts
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/costs/trend
 * Daily total cost over last 30 days for trend line chart
 */
router.get('/trend', (req, res) => {
  try {
    const dailyTrend = db.prepare(`
      SELECT 
        date(timestamp) as date,
        ROUND(SUM(costPerHour * 24), 0) as dailyCost
      FROM (
        SELECT strftime('%Y-%m-%d', timestamp) as timestamp, containerName, AVG(costPerHour) as costPerHour
        FROM usage_history
        WHERE timestamp >= datetime('now', '-30 days')
        GROUP BY strftime('%Y-%m-%d', timestamp), containerName
      )
      GROUP BY date(timestamp)
      ORDER BY date(timestamp) ASC
    `).all();

    res.json({
      success: true,
      trend: dailyTrend
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/costs/analytics
 * Comprehensive FinOps analytics including efficiency score, total limit vs usage, severity tiers, and team target spend
 */
router.get('/analytics', (req, res) => {
  try {
    const wasteData = analyzeWasteAndRecommendations();

    // Query average CPU and Memory across all containers
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

    const totalCpuLimit = Number((totalResourceStats.totalCpuLimit || 0).toFixed(2));
    const totalCpuUsed = Number((totalResourceStats.totalCpuUsed || 0).toFixed(2));
    const totalMemLimitMB = Number((totalResourceStats.totalMemLimitMB || 0).toFixed(0));
    const totalMemUsedMB = Number((totalResourceStats.totalMemUsedMB || 0).toFixed(0));

    const overallCpuUtilPercent = totalCpuLimit > 0 ? Number(((totalCpuUsed / totalCpuLimit) * 100).toFixed(1)) : 0;
    const overallMemUtilPercent = totalMemLimitMB > 0 ? Number(((totalMemUsedMB / totalMemLimitMB) * 100).toFixed(1)) : 0;

    // Infrastructure Efficiency Score (0 to 100)
    const efficiencyScore = Math.min(100, Math.max(0, Math.round((overallCpuUtilPercent * 0.6) + (overallMemUtilPercent * 0.4) + 30)));

    // Categorize containers into severity bands
    let severeCount = 0;   // < 10%
    let moderateCount = 0; // 10% - 20%
    let healthyCount = 0;  // > 20%

    const containerUtilizationList = db.prepare(`
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

    // Team comparison: current vs right-sized target spend & provided resources
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

      const wasteEntry = wasteData.wastefulContainers.find(w => w.containerName === c.containerName);
      if (wasteEntry) {
        t.targetSpend += wasteEntry.rightSizedMonthlyCost;
        t.savings += wasteEntry.estimatedMonthlySavings;
      } else {
        t.targetSpend += c.monthlyCost;
      }
    }

    const teamComparison = Object.values(teamComparisonMap).map(t => ({
      ...t,
      providedCpuCores: Number(t.providedCpuCores.toFixed(2)),
      usedCpuCores: Number(t.usedCpuCores.toFixed(2)),
      cpuUtilPercent: t.providedCpuCores > 0 ? Number(((t.usedCpuCores / t.providedCpuCores) * 100).toFixed(1)) : 0,
      providedMemMB: Number(t.providedMemMB.toFixed(0)),
      usedMemMB: Number(t.usedMemMB.toFixed(0)),
      memUtilPercent: t.providedMemMB > 0 ? Number(((t.usedMemMB / t.providedMemMB) * 100).toFixed(1)) : 0
    }));

    res.json({
      success: true,
      analytics: {
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
        severityDistribution: [
          { name: 'Severe Waste (<10%)', value: severeCount, color: '#f43f5e' },
          { name: 'Moderate Waste (10-20%)', value: moderateCount, color: '#f59e0b' },
          { name: 'Healthy / Efficient (>20%)', value: healthyCount, color: '#10b981' }
        ],
        containerUtilizationList,
        teamComparison
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


module.exports = router;

