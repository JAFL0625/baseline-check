// index.js
const fs = require('fs');
const bcd = require('@mdn/browser-compat-data');

console.log('=== Baseline Feature Report (fixed paths) ===');

// Features con sus rutas reales dentro del paquete
const features = [
  { name: 'CSS Flexbox', path: bcd.css.properties.flex },
  { name: 'CSS Grid', path: bcd.css.properties.grid },
  { name: 'JavaScript BigInt', path: bcd.javascript.builtins.BigInt },
  { name: 'HTML Canvas', path: bcd.html.elements.canvas }
];

const browsers = ['chrome', 'firefox', 'safari', 'edge'];

const report = features.map(f => {
  const support = f.path.__compat.support;
  const compatible = browsers.filter(b =>
    support[b] && support[b].version_added
  );
  return {
    feature: f.name,
    compatibleBrowsers: compatible,
    baselineOK: compatible.length === browsers.length
  };
});

if (!fs.existsSync('data')) fs.mkdirSync('data');
fs.writeFileSync('data/baseline-report.json', JSON.stringify(report, null, 2));
console.log('Report generated at data/baseline-report.json');
