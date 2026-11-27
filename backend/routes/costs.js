const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { analyzeWasteAndRecommendations } = require('../services/wasteDetector');
const { getLatestLiveStats } = require('../services/dockerMonitor');
const { computeAnalytics } = require('../services/analyticsService');

/**
 * GET /api/costs/summary
 * Total spend (last 30 days), spend today, total waste, potential savings
 */
router.get('/summary', (req, res) => {
  try {
    const liveStats = getLatestLiveStats();
    const wasteData = analyzeWasteAndRecommendations(liveStats);

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
    const liveStats = getLatestLiveStats();
    const wasteData = analyzeWasteAndRecommendations(liveStats);
    const analytics = computeAnalytics(liveStats, wasteData);

    res.json({
      success: true,
      analytics
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


module.exports = router;

