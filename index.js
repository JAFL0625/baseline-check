const fs = require('fs');
const bcd = require('@mdn/browser-compat-data');

console.log('=== Baseline Feature Report (auto-discover + filtered) ===');

const browsers = ['chrome', 'firefox', 'safari', 'edge'];

/**
 * Recorre un objeto de compatibilidad y devuelve las features finales.
 * Usa prefix para formar el nombre (por ejemplo css.properties.flex).
 */
function collectFeatures(obj, prefix = '') {
  const list = [];
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    const item = obj[key];

    if (item && item.__compat && item.__compat.support) {
      list.push({
        name: prefix ? `${prefix}.${key}` : key,
        path: item
      });
    } else if (typeof item === 'object') {
      const newPrefix = prefix ? `${prefix}.${key}` : key;
      list.push(...collectFeatures(item, newPrefix));
    }
  }
  return list;
}

/**
 * Filtrado:
 *   – CSS: solo propiedades (css.properties)
 *   – HTML: solo elementos (html.elements)
 *   – JS: solo builtins (javascript.builtins)
 *   – Web APIs: toda la sección api
 */
const autoFeatures = [
  ...collectFeatures(bcd.css.properties),
  ...collectFeatures(bcd.html.elements),
  ...collectFeatures(bcd.javascript.builtins),
  ...collectFeatures(bcd.api)
];

console.log(`✔ Encontradas ${autoFeatures.length} features filtradas.`);

// Generar report y mapa legible
const report = [];
const nameMap = {};

autoFeatures.forEach(f => {
  const support = f.path?.__compat?.support;
  if (!support) return;

  let readableName = f.name
    .replace('css.properties.', '')
    .replace('javascript.builtins.', '')
    .replace('html.elements.', '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

  report.push({
    feature: readableName,
    compatibleBrowsers: browsers.filter(
      b => support[b] && support[b].version_added
    ),
    baselineOK: browsers.every(b => support[b] && support[b].version_added)
  });

  // Guardar para mapear nombres legibles -> nombre en el reporte
  nameMap[readableName.toLowerCase()] = readableName;
});

if (!fs.existsSync('data')) fs.mkdirSync('data');
fs.writeFileSync('data/baseline-report.json', JSON.stringify(report, null, 2));
fs.writeFileSync('data/feature-map.json', JSON.stringify(nameMap, null, 2));

console.log('✅ Reporte generado en data/baseline-report.json');
console.log('✅ Mapa de nombres generado en data/feature-map.json');
