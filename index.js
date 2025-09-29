// index.js
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
 */
const autoFeatures = [
  ...collectFeatures(bcd.css.properties, 'css.properties'),
  ...collectFeatures(bcd.html.elements,  'html.elements'),
  ...collectFeatures(bcd.javascript.builtins, 'javascript.builtins')
];

console.log(`✔ Encontradas ${autoFeatures.length} features filtradas.`);

const report = autoFeatures.map(f => {
  const support = f.path.__compat.support;
  const compatible = browsers.filter(
    b => support[b] && support[b].version_added
  );
  return {
    feature: f.name,
    compatibleBrowsers: compatible,
    baselineOK: compatible.length === browsers.length
  };
});

if (!fs.existsSync('data')) fs.mkdirSync('data');
fs.writeFileSync('data/baseline-report.json', JSON.stringify(report, null, 2));
console.log('✅ Reporte generado en data/baseline-report.json');
