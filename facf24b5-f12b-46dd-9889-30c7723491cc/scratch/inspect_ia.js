const fs = require('fs');
const code = fs.readFileSync('sidepanel.js', 'utf8');

const iaIdx = code.indexOf('async function ia(');
console.log('ia index:', iaIdx);
console.log(code.substring(iaIdx, iaIdx + 4500));
