const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'index.html');
let s = fs.readFileSync(file, 'utf8');
const orig = s;
// 1) normalize catch parameter: catch(_) -> catch(e)
s = s.replace(/catch\(\s*_\s*\)/g, 'catch(e)');
// 2) replace empty catches: catch(e){ } or catch(e){} -> add console.warn
s = s.replace(/catch\(e\)\s*\{\s*\}/g, "catch(e){ console.warn('Falha silenciosa capturada', e); }");
// 3) catches with only comment: catch(e){ /* ... */ } -> add console.warn before comment
s = s.replace(/catch\(e\)\s*\{\s*(\/\*[\s\S]*?\*\/)\s*\}/g, "catch(e){ console.warn('Falha silenciosa capturada', e); $1 }");
// 4) catches with only comment without spaces: catch(e){/*...*/} handled by previous regex
// 5) catches where body had only a single statement like return null; keep it and prepend warn
s = s.replace(/catch\(e\)\s*\{\s*(return[^;]*;)/g, "catch(e){ console.warn('Erro capturado', e); $1");
// 6) catches that contained only simple expressions (e.g., }catch(_){ } but now catch(e){ }) already handled
if(s !== orig){
  fs.writeFileSync(file, s, 'utf8');
  console.log('index.html atualizado: catches transformados.');
} else {
  console.log('Nenhuma alteração necessária.');
}
