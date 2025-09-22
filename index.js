// index.js
const fs = require('fs');
const bcd = require('@mdn/browser-compat-data');

console.log('=== Baseline Feature Report ===');

// Lista de features de ejemplo (podemos ampliar luego)
const features = [
  'css.flexbox',
  'css.grid',
  'javascript.bigint',
  'html.canvas'
];

const report = features.map(feature => {
  const data = bcd[feature.split('.')[0]][feature.split('.')[1]];
  const support = data.__compat.support;

  // Contamos navegadores principales
  const browsers = ['chrome', 'firefox', 'safari', 'edge'];
  const compatible = browsers.filter(b => support[b] && support[b].version_added);

  return {
    feature,
    compatibleBrowsers: compatible,
    baselineOK: compatible.length === browsers.length
  };
});

fs.writeFileSync('data/baseline-report.json', JSON.stringify(report, null, 2));
console.log('Report generated at data/baseline-report.json');
