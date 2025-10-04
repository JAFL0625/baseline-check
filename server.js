// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const REPORT_PATH = path.join(__dirname, 'data', 'baseline-report.json');
const ALIAS_PATH = path.join(__dirname, 'data', 'alias-map.json');
const MAP_PATH = path.join(__dirname, 'data', 'feature-map.json');

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[\.\-_]/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function loadData() {
  let report = [], alias = {}, fmap = {};
  try { report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8')) || []; } catch(e){/*noop*/}
  try { alias = JSON.parse(fs.readFileSync(ALIAS_PATH, 'utf8')) || {}; } catch(e){/*noop*/}
  try { fmap = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8')) || {}; } catch(e){/*noop*/}
  // build an index with searchText for fuzzy matching
  const index = report.map(r => {
    const searchText = normalize(r.feature);
    return { feature: r.feature, compatibleBrowsers: r.compatibleBrowsers || [], baselineOK: !!r.baselineOK, searchText };
  });
  return { report, alias, fmap, index };
}

function scoreMatch(entry, tokens) {
  let score = 0;
  for (const t of tokens) {
    if (entry.searchText === t) score += 10;
    else if (entry.searchText.includes(` ${t} `)) score += 6;
    else if (entry.searchText.includes(t)) score += 3;
  }
  return score;
}

app.post('/api/compatibility', (req, res) => {
  const { features } = req.body || {};
  if (!Array.isArray(features) || features.length === 0) {
    return res.status(400).json({ error: 'Send JSON with "features": ["Name1","Name2"]' });
  }

  const { report, alias, fmap, index } = loadData();

  const results = features.map(userF => {
    const n = normalize(userF);

    // 1) Búsqueda exacta por nombre en report
    const exact = report.find(r => normalize(r.feature) === n);
    if (exact) return { feature: exact.feature, compatibleBrowsers: exact.compatibleBrowsers, baselineOK: exact.baselineOK };

    // 2) Búsqueda por alias
    const ali = alias[n];
    if (ali) {
      const aliMatch = report.find(r => r.feature === ali);
      if (aliMatch) return { feature: aliMatch.feature, compatibleBrowsers: aliMatch.compatibleBrowsers, baselineOK: aliMatch.baselineOK };
    }

    // 3) Fuzzy match (solo si con score suficiente)
    const tokens = n.split(' ').filter(Boolean);
    const candidates = index.map(entry => ({ entry, score: scoreMatch(entry, tokens) }))
      .filter(x => x.score > 0)
      .sort((a,b) => b.score - a.score);

    const SCORE_THRESHOLD = 6; // ajustar si quieres más o menos permisividad
    if (candidates.length && candidates[0].score >= SCORE_THRESHOLD) {
      const best = candidates[0].entry;
      console.log(`Fuzzy matched "${userF}" -> "${best.feature}" (score ${candidates[0].score})`);
      return { feature: best.feature, compatibleBrowsers: best.compatibleBrowsers, baselineOK: best.baselineOK };
    }

    // 4) No encontrado
    console.log(`No match for "${userF}"`);
    return { feature: userF, compatibleBrowsers: [], baselineOK: false };
  });

  console.log('Features received:', features);
  console.log('Result:', results.map(r => ({ feature: r.feature, count: r.compatibleBrowsers.length })));
  res.json(results);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
