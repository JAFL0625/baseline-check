const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// Cargar reporte y mapa de nombres
const reportPath = path.join(__dirname, 'data', 'baseline-report.json');
const featureMapPath = path.join(__dirname, 'data', 'feature-map.json');

let report = [];
let featureMap = {};

try {
  report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  featureMap = JSON.parse(fs.readFileSync(featureMapPath, 'utf8'));
} catch (err) {
  console.error('Error loading report or map:', err);
}

// API para compatibilidad
app.post('/api/compatibility', (req, res) => {
  const { features } = req.body;

  try {
    const filtered = features.map(f => {
      const internalName = featureMap[f.toLowerCase()];
      if (!internalName) {
        return { feature: f, compatibleBrowsers: [], baselineOK: false };
      }

      const match = report.find(r => r.feature === internalName);
      return match || { feature: f, compatibleBrowsers: [], baselineOK: false };
    });

    console.log('Features received:', features);
    console.log('Filtered result:', filtered);

    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Cannot process compatibility request' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
