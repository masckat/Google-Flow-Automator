const fs = require('fs');
const code = fs.readFileSync('sidepanel.js', 'utf8');

const wIdx = code.indexOf('async function W(');
console.log('W index:', wIdx);
console.log(code.substring(wIdx, wIdx + 2000));
