#!/usr/bin/env node
/**
 * Verifica camadas básicas do build/icon.ico e imprime tamanhos detectados.
 * Método simples: parse manual dos directory entries.
 */
const fs = require('fs');
const path = require('path');
const file = path.join('build','icon.ico');
if(!fs.existsSync(file)){
  console.error('Arquivo não encontrado:', file);
  process.exit(1);
}
const buf = fs.readFileSync(file);
if(buf.length < 6){
  console.error('Arquivo muito pequeno para ser ICO válido.');
  process.exit(1);
}
const count = buf.readUInt16LE(4);
let offset = 6;
const entries = [];
for(let i=0;i<count;i++){
  const entry = buf.slice(offset, offset+16);
  const w = entry[0] === 0 ? 256 : entry[0];
  const h = entry[1] === 0 ? 256 : entry[1];
  const size = entry.readUInt32LE(8);
  const imgOffset = entry.readUInt32LE(12);
  entries.push({w,h,size,imgOffset});
  offset += 16;
}
console.log('Entradas ICO detectadas ('+entries.length+')');
for(const e of entries){
  console.log(` - ${e.w}x${e.h} -> ${e.size} bytes @${e.imgOffset}`);
}
console.log('Tamanho total arquivo:', buf.length, 'bytes');
