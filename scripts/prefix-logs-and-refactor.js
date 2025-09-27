const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'index.html');
let s = fs.readFileSync(file, 'utf8');
let orig = s;
let changes = 0;

function determinePrefix(msg){
  const m = String(msg||'').toLowerCase();
  if(/\b(cx|caixa|mov|sessao|sess|conferir|conferencia)\b/.test(m)) return '[CX]';
  if(/\b(db|listar\(|stores\.|abrirdb|fsdb|outbox|flushoutbox|persist|indexedb|storo|store|falha de dados)\b/.test(m)) return '[DB]';
  if(/\b(renderiza|renderiz|ui|render|navega|nav|renderiza|render|interface|atendente|sessao usuario|renderização)\b/.test(m)) return '[UI]';
  if(/\b(nuvem|firebase|cloud|auth|autentica|login nuvem|signIn|signUp|fsdb|firebase)\b/.test(m)) return '[CLOUD]';
  if(/\b(login|senha|usu[áa]rio|autentica|autentica[cç][aã]o|credenciais|user-not-found|usuário)\b/.test(m)) return '[AUTH]';
  return '[GEN]';
}

// Add prefix to console.log messages where first arg is simple string literal
s = s.replace(/console\.(warn|error|info)\(\s*(['\"])([\s\S]*?)\2/gm, (full, level, q, msg)=>{
  // skip if already prefixed
  if(/^[\s]*\[.*?\]/.test(msg)) return full;
  const prefix = determinePrefix(msg);
  changes++;
  return `console.${level}(${q}${prefix} ${msg}${q}`;
});

// Remove duplicate aplicarSessaoUI definitions, keep first occurrence
const funcKeyword = 'function aplicarSessaoUI()';
let idx = s.indexOf(funcKeyword);
if(idx !== -1){
  const secondIdx = s.indexOf(funcKeyword, idx + 1);
  if(secondIdx !== -1){
    // Find next 'function temPerfil' after secondIdx
    const nextAnchor = 'function temPerfil(';
    const anchorIdx = s.indexOf(nextAnchor, secondIdx);
    if(anchorIdx !== -1){
      // Remove from secondIdx up to anchorIdx
      s = s.slice(0, secondIdx) + s.slice(anchorIdx);
      changes++;
      console.log('Removida definição duplicada de aplicarSessaoUI() (segunda ocorrência).');
    } else {
      // fallback: try to find the matching closing brace of the function by searching for '\n}' sequence after secondIdx
      // we'll look for pattern '\n    }catch' which often closes
      const catchIdx = s.indexOf('\n    }catch', secondIdx);
      if(catchIdx !== -1){
        // find function end by locating the next '\n' after catch block end '}'
        const closeIdx = s.indexOf('\n', catchIdx+1);
        if(closeIdx !== -1){
          s = s.slice(0, secondIdx) + s.slice(closeIdx+1);
          changes++;
        }
      }
    }
  }
}

if(changes>0){
  fs.writeFileSync(file, s, 'utf8');
  console.log('Arquivo atualizado com', changes, 'alterações.');
} else {
  console.log('Nenhuma alteração necessária.');
}
