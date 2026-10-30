const fs = require('fs');
const code = fs.readFileSync('sidepanel.js', 'utf8');

const regex = /jo\s*=/g;
let m;
while ((m = regex.exec(code)) !== null) {
  console.log('jo= at:', m.index);
  console.log(code.substring(m.index - 50, m.index + 100));
}
