const fs = require('fs');
const code = fs.readFileSync('sidepanel.js', 'utf8');

const regex = /[a-zA-Z0-9_$]+\s*=\s*function\s+jo\b|[a-zA-Z0-9_$]+\s*=\s*\(?[^)]*\)?\s*=>\s*.*jo|function\s+jo\b|var\s+jo\b|let\s+jo\b|const\s+jo\b/g;
let m;
while ((m = regex.exec(code)) !== null) {
  console.log('Match:', m[0]);
}

const joWord = code.indexOf('jo(');
console.log('jo( index:', joWord);
if (joWord !== -1) {
  console.log(code.substring(joWord - 100, joWord + 150));
}
