const express = require('express');
const router = express.Router();
const { analyzeWasteAndRecommendations } = require('../services/wasteDetector');
const { getLatestLiveStats } = require('../services/dockerMonitor');

/**
 * GET /api/waste
 * List of wasteful containers sorted by highest savings first
 */
router.get('/', (req, res) => {
  try {
    const liveStats = getLatestLiveStats();
    const wasteData = analyzeWasteAndRecommendations(liveStats);
    res.json({
      success: true,
      count: wasteData.allContainers.length,
      wastefulCount: wasteData.wastefulContainers.length,
      severityDistribution: wasteData.severityDistribution,
      summary: wasteData.summary,
      containers: wasteData.allContainers,
      wastefulContainers: wasteData.wastefulContainers,
      allContainers: wasteData.allContainers
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/recommendations
 * Auto-generated FinOps recommendations list
 */
router.get('/recommendations', (req, res) => {
  try {
    const liveStats = getLatestLiveStats();
    const wasteData = analyzeWasteAndRecommendations(liveStats);
    res.json({
      success: true,
      count: wasteData.recommendations.length,
      recommendations: wasteData.recommendations
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
