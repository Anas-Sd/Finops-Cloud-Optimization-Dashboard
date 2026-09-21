const express = require('express');
const router = express.Router();
const { getLatestLiveStats } = require('../services/dockerMonitor');

/**
 * GET /api/containers/live
 * Returns latest real-time container stats snapshot
 */
router.get('/live', (req, res) => {
  try {
    const stats = getLatestLiveStats();
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      count: stats.length,
      containers: stats
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
