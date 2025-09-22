// generate-table.js
const fs = require('fs');

const report = JSON.parse(
  fs.readFileSync('data/baseline-report.json', 'utf8')
);

const header = '| Feature | Compatible Browsers | Baseline OK |\n|---------|----------------------|------------|';
const rows = report.map(r =>
  `| ${r.feature} | ${r.compatibleBrowsers.join(', ')} | ${r.baselineOK ? '✅' : '❌'} |`
);

fs.writeFileSync('BASELINE_TABLE.md', [header, ...rows].join('\n'));
console.log('BASELINE_TABLE.md updated');

