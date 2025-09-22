// index.js
const bcd = require('@mdn/browser-compat-data');

// Ejemplo: comprobar si la API de fetch está en Baseline
const feature = bcd.api.fetch;

console.log('=== Baseline quick check ===');
console.log('Feature: Fetch API');
console.log('Compatibilidad:', feature.__compat.support);
console.log('============================');
