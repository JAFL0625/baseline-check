// generate-table.js
// Lee el reporte JSON y genera una tabla en Markdown.

const fs = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, 'data', 'baseline-report.json');
if (!fs.existsSync(reportPath)) {
  console.error(`No se encontró el archivo ${reportPath}`);
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

// Cabecera de la tabla
let markdown = `| Feature | Compatible Browsers | Baseline OK |\n`;
markdown += `|--------|--------------------|------------|\n`;

for (const item of report) {
  const browsers = item.compatibleBrowsers.join(', ');
  const baseline = item.baselineOK ? '✅' : '❌';
  markdown += `| ${item.feature} | ${browsers} | ${baseline} |\n`;
}

const outPath = path.join(__dirname, 'data', 'baseline-report.md');
fs.writeFileSync(outPath, markdown);
console.log(`Tabla generada en ${outPath}`);

