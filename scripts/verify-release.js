#!/usr/bin/env node
/**
 * Verifica se o latest.yml aponta para um asset realmente existente no release mais recente.
 * Uso:
 *   node scripts/verify-release.js [owner] [repo]
 * Default: owner=nathanmohrr repo=sistema-financeiro
 * Opcional: export GH_TOKEN para aumentar limite de rate (repo público não exige).
 */
const https = require('https');
const owner = process.argv[2] || 'nathanmohrr';
const repo = process.argv[3] || 'sistema-financeiro';

function fetch(url, headers={}){
  return new Promise((resolve,reject)=>{
    const opts = new URL(url);
    opts.headers = Object.assign({ 'User-Agent':'verify-release-script' }, headers);
    https.get(opts, res => {
      if(res.statusCode >=300 && res.statusCode <400 && res.headers.location){
        return resolve(fetch(res.headers.location, headers));
      }
      if(res.statusCode !== 200){ return reject(new Error('HTTP '+res.statusCode+' '+url)); }
      let data=''; res.on('data',d=>data+=d); res.on('end',()=>resolve(data));
    }).on('error', reject);
  });
}

(async ()=>{
  try {
    const latestYmlUrl = `https://github.com/${owner}/${repo}/releases/latest/download/latest.yml`;
    const ymlRaw = await fetch(latestYmlUrl).catch(e=>{ throw new Error('Falha baixar latest.yml: '+e.message); });

    // Parse simplista do YAML (chaves que precisamos)
    const lines = ymlRaw.split(/\r?\n/);
    let version = null; const urls=[];
    for(const ln of lines){
      const mVer = ln.match(/^version:\s*(.+)$/); if(mVer) version = mVer[1].trim();
      const mUrl = ln.match(/url:\s*(.+)$/); if(mUrl) urls.push(mUrl[1].trim());
    }
    if(!version) throw new Error('Não encontrou campo version no latest.yml');
    if(urls.length===0) throw new Error('Não encontrou nenhum campo url no latest.yml');

    // Chama API GitHub para assets
    const apiHeaders = { 'Accept':'application/vnd.github+json' };
    if(process.env.GH_TOKEN){ apiHeaders.Authorization = `Bearer ${process.env.GH_TOKEN}`; }
    const apiRaw = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, apiHeaders);
    let api;
    try { api = JSON.parse(apiRaw); } catch(e){ throw new Error('Falha parse JSON release API'); }
    if(!api || !Array.isArray(api.assets)) throw new Error('Resposta sem assets na API');

    const assetNames = api.assets.map(a=>a.name);
    const missing = [];
    for(const u of urls){ if(!assetNames.includes(u)) missing.push(u); }

    const ok = missing.length===0;
    console.log('Versão latest.yml:', version);
    console.log('URLs no latest.yml:', urls.join(', '));
    console.log('Assets do release:', assetNames.join(', '));
    if(ok){
      console.log('\n✅ Consistência OK: todos os arquivos referenciados existem no release.');
      process.exit(0);
    } else {
      console.error('\n❌ Inconsistência: arquivos referenciados ausentes:', missing.join(', '));
      process.exit(2);
    }
  } catch (e) {
    console.error('Erro:', e.message || e);
    process.exit(1);
  }
})();
