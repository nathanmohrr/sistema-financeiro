// Builda e publica (Windows) a versão atual
const { spawnSync } = require('child_process');

function run(cmd, args, env){
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32', env: { ...process.env, ...env } });
  if(r.status !== 0) process.exit(r.status||1);
}

console.log('> Buildando instalador (electron-builder --win)');
run('npx', ['electron-builder', '--win']);

console.log('> Publicando no GitHub Releases');
run('node', ['scripts/publish-release.js']);

console.log('Concluído.');
