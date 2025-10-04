// index.js
const fs = require('fs');
const bcd = require('@mdn/browser-compat-data');

console.log('=== Baseline Feature Report (auto-discover + filtered) ===');

const browsers = ['chrome', 'firefox', 'safari', 'edge', 'opera']; // si quieres agregar más, añádelos aquí

function collectFeatures(obj, prefix = '') {
  const list = [];
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    const item = obj[key];

    if (item && item.__compat && item.__compat.support) {
      list.push({ name: prefix ? `${prefix}.${key}` : key, path: item });
    } else if (typeof item === 'object') {
      const newPrefix = prefix ? `${prefix}.${key}` : key;
      list.push(...collectFeatures(item, newPrefix));
    }
  }
  return list;
}

function isSupported(support) {
  if (!support) return false;
  const list = Array.isArray(support) ? support : [support];
  for (const s of list) {
    if ((s.version_added && s.version_added !== false) || s.partial_implementation) {
      return true;
    }
  }
  return false;
}

function normalizeName(n) {
  return String(n || '')
    .toLowerCase()
    .replace(/[\.\-_]/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// 1) Colección principal (CSS props, HTML elements, JS builtins, Web APIs)
const raw = [
  ...collectFeatures(bcd.css?.properties || {}, 'css.properties'),
  ...collectFeatures(bcd.html?.elements || {}, 'html.elements'),
  ...collectFeatures(bcd.javascript?.builtins || {}, 'javascript.builtins'),
  ...collectFeatures(bcd.api || {}, 'api')
];

console.log(`✔ Encontradas ${raw.length} features filtradas.`);

// 2) Generar reporte legible
const report = [];
const nameMap = {};   // readableNormalized -> readableName (para búsqueda)
const aliasMap = {};  // aliasNormalized -> readableName (alias manuales)

// Construimos el reporte
for (const f of raw) {
  const support = f.path?.__compat?.support;
  if (!support) continue;

  const compatible = browsers.filter(b => isSupported(support[b]));
  // readableName: limpiar prefijos como css.properties. etc y capitalizar palabras
  let readableName = f.name
    .replace(/^css\.properties\./i, '')
    .replace(/^javascript\.builtins\./i, '')
    .replace(/^html\.elements\./i, '')
    .replace(/^api\./i, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

  // en algunos casos hay nombres vacíos o no deseados: ignorar si vacío
  if (!readableName) continue;

  const item = {
    feature: readableName,
    compatibleBrowsers: compatible,
    baselineOK: browsers.every(b => compatible.includes(b))
  };

  report.push(item);
  nameMap[normalizeName(readableName)] = readableName;
}

// 3) Asegurar alias comunes (si ya existen en report, solo añadimos alias, si no, lo agregamos)
// Alias que queremos soportar (puedes añadir más). Si la feature ya está en report,
// aliasMap apuntará a la entry en report; si no existe, se creará manualmente.
const ensureAliases = [
  { alias: 'css variables', preferFind: ['cssvariablereferencevalue', 'css variable'] },
  { alias: 'css subgrid', preferFind: ['subgrid', 'css subgrid', 'css-subgrid'] },
  { alias: 'web bluetooth api', preferFind: ['bluetooth', 'web bluetooth'] },
  { alias: 'html canvas', preferFind: ['canvas', 'html canvas'] }
];

// Helper que busca en nameMap por token
function findReadableByTokens(tokens) {
  tokens = tokens.map(t => t.toLowerCase());
  for (const key in nameMap) {
    const k = key.toLowerCase();
    if (tokens.every(t => k.includes(t))) return nameMap[key];
  }
  // fallback: return first that contains any token
  for (const key in nameMap) {
    const k = key.toLowerCase();
    if (tokens.some(t => k.includes(t))) return nameMap[key];
  }
  return null;
}

for (const a of ensureAliases) {
  const aliasNorm = normalizeName(a.alias);
  // intenta encontrar por preferFind
  let found = null;
  for (const candidate of a.preferFind) {
    const candNorm = normalizeName(candidate);
    if (nameMap[candNorm]) { found = nameMap[candNorm]; break; }
  }
  if (!found) {
    // intenta tokens
    const tokens = aliasNorm.split(' ').filter(Boolean);
    found = findReadableByTokens(tokens);
  }
  if (found) {
    aliasMap[aliasNorm] = found; // alias -> readableName existente
  } else {
    // Si no se encontró, añadimos manual al reporte con compatibilidad probable
    // *** Puedes ajustar estos valores si prefieres otros ***
    const manuals = {
      'css subgrid': { feature: 'CSS Subgrid', compatibleBrowsers: ['chrome','firefox','safari','edge'], baselineOK: true },
      'css variables': { feature: 'CSS Variables', compatibleBrowsers: ['chrome','firefox','safari','edge'], baselineOK: true }
    };
    if (manuals[aliasNorm]) {
      report.push(manuals[aliasNorm]);
      nameMap[normalizeName(manuals[aliasNorm].feature)] = manuals[aliasNorm].feature;
      aliasMap[aliasNorm] = manuals[aliasNorm].feature;
      console.log(`Added manual feature for alias "${a.alias}" => ${manuals[aliasNorm].feature}`);
    }
  }
}

// 4) Guardar archivos
if (!fs.existsSync('data')) fs.mkdirSync('data');
fs.writeFileSync('data/baseline-report.json', JSON.stringify(report, null, 2));
fs.writeFileSync('data/feature-map.json', JSON.stringify(nameMap, null, 2));
fs.writeFileSync('data/alias-map.json', JSON.stringify(aliasMap, null, 2));

console.log('✅ Reporte generado en data/baseline-report.json');
console.log('✅ Mapa de nombres generado en data/feature-map.json');
console.log('✅ Alias generado en data/alias-map.json');
