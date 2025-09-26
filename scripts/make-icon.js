#!/usr/bin/env node
/**
 * Gera build/icon.ico a partir de build/logo.png (ou icon-source.png) usando apenas APIs nativas.
 * Limitação: sem anti-alias extra; simplesmente embeda PNG em um ICO multi-tamanho.
 * Para melhores resultados use uma imagem quadrada transparente >= 256x256.
 */
const fs = require('fs');
const path = require('path');

const SRC_CANDIDATES = [
  'build/icon-source.png',
  'build/logo.png',
  'build/logo-source.png'
];

function ensureSource(){
  for(const c of SRC_CANDIDATES){ if(fs.existsSync(c)) return c; }
  // Tenta variável de ambiente ICON_BASE64
  if(process.env.ICON_BASE64){
    const decoded = Buffer.from(process.env.ICON_BASE64.replace(/^data:image\/(png|jpeg);base64,/i,''),'base64');
    const out = 'build/icon-source.png'; fs.writeFileSync(out, decoded); console.log('Gerado a partir de ICON_BASE64 ->', out); return out;
  }
  // Tenta arquivo base64
  const b64File = 'build/icon-base64.txt';
  if(fs.existsSync(b64File)){
    const raw = fs.readFileSync(b64File,'utf-8').trim();
    const cleaned = raw.replace(/^data:image\/(png|jpeg);base64,/i,'');
    const buf = Buffer.from(cleaned,'base64');
    const out = 'build/icon-source.png'; fs.writeFileSync(out, buf); console.log('Gerado a partir de icon-base64.txt ->', out); return out;
  }
  // Fallback simples pré-gerado (PNG 256x256 placeholder)
  const fallbackB64 = 'iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAIAAADTED8xAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABM5JREFUeNrs3cENgDAMQFHS/39sJw2QAtWkeYqgOuk8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwG2zcnQIAAAAAAAAAAAB8mQIEAAAAAAAAAAB8mQIEAAAAAAAAAAB8mQIEAAAAAAAAAAB8mQIEAAAAAAAAAAB8mQIEAAAAAAAAAAB8mQIEAAAAAAAAAAB8mQIEAAAAAAAAAAB8mQIEAAAAAAAAAAB8mQIEAAAAAAAAAAB8mQIEAAAAAAAAAAB8mQIEAAAAAAAAAAB8mQIEAAAAAAAAAAB8mQIEAAAAAPgXfAABBgAMn+4BVQAAAABJRU5ErkJggg==';
  const out = 'build/icon-source.png';
  fs.writeFileSync(out, Buffer.from(fallbackB64,'base64'));
  console.log('Fonte não encontrada. PNG placeholder gerado em', out);
  console.log('Para usar seu ícone real: coloque build/icon-source.png ou build/icon-base64.txt ou defina ICON_BASE64.');
  return out;
}

// ICO simples: header + directory entries + PNG blobs (aceito pelo Windows moderno)
// Referência: https://en.wikipedia.org/wiki/ICO_(file_format)
function buildIco(pngBuf){
  // Usar mesmo PNG para múltiplos tamanhos (Windows escala); entradas: 256, 128, 64, 48, 32, 16
  const sizes = [256,128,64,48,32,16];
  const dirEntries = [];
  let offset = 6 + (sizes.length * 16); // header + entries
  const blobs = [];
  for(const sz of sizes){
    // Não redimensionamos (exigiria lib externa); apenas duplicamos a mesma imagem.
    const data = pngBuf;
    const entry = Buffer.alloc(16);
    entry[0] = sz === 256 ? 0 : sz; // width (0 = 256)
    entry[1] = sz === 256 ? 0 : sz; // height
    entry[2] = 0; // colors (0 = truecolor)
    entry[3] = 0; // reserved
    entry.writeUInt16LE(1,4); // color planes
    entry.writeUInt16LE(32,6); // bits per pixel (assumindo PNG 32-bit)
    entry.writeUInt32LE(data.length,8); // size of image data
    entry.writeUInt32LE(offset,12); // offset
    offset += data.length;
    dirEntries.push(entry);
    blobs.push(data);
  }
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0,0); // reserved
  header.writeUInt16LE(1,2); // type 1 = icon
  header.writeUInt16LE(sizes.length,4); // count
  return Buffer.concat([header, ...dirEntries, ...blobs]);
}

(async function main(){
  const src = ensureSource();
  const png = fs.readFileSync(src);
  const outDir = 'build';
  if(!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive:true });
  const pngSize = png.length;
  console.log('[icon] Fonte', src, '-', pngSize, 'bytes');
  if(process.env.MULTI_ICON && pngSize < 5000){
    console.warn('[icon] AVISO: arquivo muito pequeno (<5KB). Provavelmente é placeholder ou imagem super comprimida. Recomenda-se PNG >= 256x256 com mais detalhes (ideal 512/1024).');
  }

  if(process.env.MULTI_ICON){
    try {
      const Jimp = require('jimp');
      const pngToIco = require('png-to-ico');
  const sizes = [256,128,64,48,32,16]; // removido 24 para simplificar e tentar evitar travamento
      const variantPaths = [];
      const base = await Jimp.read(png);
      const { width, height } = base.bitmap;
      console.log('[multi-icon] Base carregada', width+'x'+height);
      if(width !== height){
        console.warn('[multi-icon] AVISO: Imagem não é quadrada. Será contida em área quadrada, possível padding.');
      }
      if(width < 128 || height < 128){
        console.warn('[multi-icon] Imagem muito pequena (<128). Abortando multi-res e usando fallback simples. Forneça >=256x256 para melhor qualidade.');
        throw new Error('base-image-too-small');
      }
      for(const s of sizes){
        try {
          console.log('[multi-icon] -> preparando', s);
          const clone = base.clone().cover(s, s, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE);
          const buf = await clone.getBufferAsync(Jimp.MIME_PNG);
          const tmpPath = path.join(outDir, `__tmp_${s}.png`);
          fs.writeFileSync(tmpPath, buf);
          variantPaths.push(tmpPath);
          console.log(`[multi-icon] Gerado tamanho ${s}px (${buf.length} bytes)`);
        } catch (stepErr){
          console.warn('[multi-icon] Falha ao gerar tamanho', s, stepErr);
          throw stepErr;
        }
      }
      console.log('[multi-icon] Gerando ICO final a partir de', variantPaths.length, 'camadas...');
      const icoBuf = await pngToIco(variantPaths);
      fs.writeFileSync(path.join(outDir,'icon.ico'), icoBuf);
      console.log('icon.ico multi-res gerado com sucesso a partir de', src, 'tamanho final', icoBuf.length);
      // Limpa temporários
      for(const p of variantPaths){ try{ fs.unlinkSync(p); }catch(_){} }
      return;
    } catch (e) {
      console.warn('Falha multi-res, usando fallback simples:', e);
    }
  }

  const ico = buildIco(png);
  fs.writeFileSync(path.join(outDir,'icon.ico'), ico);
  console.log('icon.ico (single PNG replication) gerado com sucesso a partir de', src);
})();
