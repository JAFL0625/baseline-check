// src/routes.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

/**
 * GET /api/report
 * Devuelve el baseline-report.json generado por la GitHub Action.
 */
router.get('/report', (req, res) => {
  const reportPath = path.join(__dirname, '../data/baseline-report.json');

  if (!fs.existsSync(reportPath)) {
    return res
      .status(404)
      .json({ error: 'Report file not found. Run the baseline action first.' });
  }

  try {
    const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    res.json(reportData);
  } catch (err) {
    console.error('Error reading report:', err);
    res.status(500).json({ error: 'Error reading report file.' });
  }
});

/**
 * POST /api/compatibility
 * Body JSON:
 * {
 *   "features": ["CSS Variables", "Web Bluetooth API"],
 *   "targets": ["chrome", "firefox"]
 * }
 *
 * Respuesta: array con { feature, compatibleBrowsers, baselineOK }
 */
router.post('/compatibility', (req, res) => {
  const { features = [], targets = [] } = req.body;

  // ✅ Validaciones de entrada
  if (!Array.isArray(features) || features.length === 0) {
    return res
      .status(400)
      .json({ error: 'Send a non-empty array of "features".' });
  }
  if (!Array.isArray(targets)) {
    return res
      .status(400)
      .json({ error: '"targets" must be an array (can be empty).' });
  }

  const reportPath = path.join(__dirname, '../data/baseline-report.json');
  if (!fs.existsSync(reportPath)) {
    return res
      .status(404)
      .json({ error: 'Report file not found. Run the baseline action first.' });
  }

  let reportData;
  try {
    reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  } catch (err) {
    console.error('Error reading report:', err);
    return res.status(500).json({ error: 'Error reading report file.' });
  }

  const normalizedTargets = targets.map(t => t.toLowerCase());

  // Para cada feature solicitada, buscar en el baseline-report.json
  const results = reportData
    .filter(item => features.includes(item.feature))
    .map(item => {
      const supported = item.compatibleBrowsers.map(b => b.toLowerCase());
      const baselineOK =
        normalizedTargets.length === 0
          ? supported.length > 0
          : normalizedTargets.every(t => supported.includes(t));

      return {
        feature: item.feature,
        compatibleBrowsers: item.compatibleBrowsers,
        baselineOK
      };
    });

  res.json(results);
});

module.exports = router;
