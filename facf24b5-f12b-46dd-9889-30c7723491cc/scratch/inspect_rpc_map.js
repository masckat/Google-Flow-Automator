const fs = require('fs');
const code = fs.readFileSync('sidepanel.js', 'utf8');

const joIdx = code.indexOf('function jo(');
console.log('jo index:', joIdx);
console.log(code.substring(joIdx, joIdx + 1500));

const underEIdx = code.indexOf('var _e={');
if (underEIdx === -1) {
  const m = code.indexOf('_e={');
  console.log('_e index:', m);
  console.log(code.substring(m, m + 2500));
} else {
  console.log('_e index:', underEIdx);
  console.log(code.substring(underEIdx, underEIdx + 2500));
}
