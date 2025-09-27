const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// GET /api/report  -> devuelve el baseline-report.json
router.get('/report', (req, res) => {
  const reportPath = path.join(__dirname, '../data/baseline-report.json');

  if (!fs.existsSync(reportPath)) {
    return res.status(404).json({ error: 'Report file not found. Run the baseline action first.' });
  }

  const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  res.json(reportData);
});

// ✅ NUEVA RUTA DE COMPATIBILIDAD
router.post('/compatibility', (req, res) => {
  const { features = [], targets = [] } = req.body;

  const featuresData = {
    "CSS Flexbox": ["chrome", "firefox", "safari", "edge"],
    "CSS Grid": ["chrome", "firefox", "safari", "edge"],
    "JavaScript BigInt": ["chrome", "firefox", "safari", "edge"],
    "HTML Canvas": ["chrome", "firefox", "safari", "edge"],
  };

  const results = features.map(feature => {
    const supported = featuresData[feature] || [];
    const baselineOK = targets.length === 0
      ? supported.length > 0
      : targets.every(t => supported.includes(t.toLowerCase()));

    return { feature, compatibleBrowsers: supported, baselineOK };
  });

  res.json(results);
});

module.exports = router;
