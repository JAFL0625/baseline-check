// server.js (robusto, tolerante a búsquedas)
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const REPORT_PATH = path.join(__dirname, 'data', 'baseline-report.json');

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[\.\-_]/g, ' ')
    .replace(/[^a-z0-9\s]/g, '') // quitar signos raros
    .replace(/\s+/g, ' ')
    .trim();
}

function buildIndex(report) {
  // Cada entrada tendrá: originalFeature, compatibleBrowsers, baselineOK, searchText
  return report.map(r => {
    const f = String(r.feature || '');
    const norm = normalize(f);
    const last = norm.split(' ').pop() || '';
    // remove common technical prefixes if present (css.properties etc)
    const withoutPrefixes = norm.replace(/\b(css|html|js|api|web api|javascript|properties|elements|builtins)\b/g, '').replace(/\s+/g,' ').trim();
    const tokens = Array.from(new Set(norm.split(' ').filter(Boolean).concat(withoutPrefixes.split(' ').filter(Boolean))));
    const searchText = [norm, withoutPrefixes, last, tokens.join(' ')].join(' ');
    return {
      originalFeature: f,
      compatibleBrowsers: r.compatibleBrowsers || [],
      baselineOK: !!r.baselineOK,
      searchText
    };
  });
}

function scoreMatch(entry, tokens) {
  // Score: how many tokens matched (higher better), prefer full-token matches
  let score = 0;
  for (const t of tokens) {
    if (entry.searchText === t) score += 10;
    else if (entry.searchText.includes(` ${t} `)) score += 5;
    else if (entry.searchText.includes(t)) score += 2;
  }
  return score;
}

// cargar y construir índice (se recarga por petición en caso de cambios)
function loadIndex() {
  if (!fs.existsSync(REPORT_PATH)) return { report: [], index: [] };
  const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
  const index = buildIndex(report);
  return { report, index };
}

app.post('/api/compatibility', (req, res) => {
  const { features } = req.body || {};
  if (!Array.isArray(features) || features.length === 0) {
    return res.status(400).json({ error: 'Send JSON with "features": ["Name1","Name2"]' });
  }

  const { report, index } = loadIndex();
  if (!report.length) {
    return res.status(500).json({ error: 'baseline-report.json is missing or empty. Run build-report.' });
  }

  const results = features.map(userF => {
    const userNorm = normalize(userF);
    const tokens = userNorm.split(' ').filter(Boolean);
    // 1) buscar mejores coincidencias por score
    const candidates = index
      .map(entry => ({ entry, score: scoreMatch(entry, tokens) }))
      .filter(x => x.score > 0)
      .sort((a,b) => b.score - a.score);

    if (candidates.length) {
      const best = candidates[0].entry;
      console.log(`Matched "${userF}" -> "${best.originalFeature}" (score ${candidates[0].score})`);
      return { feature: best.originalFeature, compatibleBrowsers: best.compatibleBrowsers, baselineOK: best.baselineOK };
    }

    // 2) intento fallback: buscar por includes en cualquier lado
    const fallback = index.find(e => tokens.some(t => e.searchText.includes(t)));
    if (fallback) {
      console.log(`Loosely matched "${userF}" -> "${fallback.originalFeature}"`);
      return { feature: fallback.originalFeature, compatibleBrowsers: fallback.compatibleBrowsers, baselineOK: fallback.baselineOK };
    }

    // 3) no encontrado
    console.log(`No match for "${userF}"`);
    return { feature: userF, compatibleBrowsers: [], baselineOK: false };
  });

  console.log('Features received:', features);
  console.log('Result:', results.map(r => ({ feature: r.feature, count: r.compatibleBrowsers.length })));
  res.json(results);
});

// DEBUG: lista primeras N features (útil para inspeccionar)
app.get('/debug/features', (req, res) => {
  const { report } = loadIndex();
  const names = report.map(r => r.feature).slice(0, 1000);
  res.json(names);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
