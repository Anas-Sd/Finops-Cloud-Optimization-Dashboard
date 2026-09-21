const express = require('express');
const router = express.Router();
const { analyzeWasteAndRecommendations } = require('../services/wasteDetector');

/**
 * GET /api/waste
 * List of wasteful containers sorted by highest savings first
 */
router.get('/', (req, res) => {
  try {
    const wasteData = analyzeWasteAndRecommendations();
    res.json({
      success: true,
      count: wasteData.wastefulContainers.length,
      summary: wasteData.summary,
      containers: wasteData.wastefulContainers
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
    const wasteData = analyzeWasteAndRecommendations();
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
