const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '..', 'index.html');
let s = fs.readFileSync(file, 'utf8');
const methods = ['log','warn','error','info','debug'];
let changed = 0;
for(const m of methods){
  const re = new RegExp('console\\.'+m+'\\(', 'g');
  s = s.replace(re, ()=>{ changed++; return 'appLogger.'+m+'('; });
}
fs.writeFileSync(file, s, 'utf8');
console.log('convert-console-to-logger: substitutions=', changed);
