// Lista assets da release vX.Y.Z
const fetch = global.fetch || ((...args) => import('node-fetch').then(({default:f}) => f(...args)));
const version = require('../package.json').version;
const tag = 'v' + version;
const owner = 'nathanmohrr';
const repo = 'sistema-financeiro';
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
(async () => {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/tags/${tag}`, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'sf-list-assets',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('Erro:', res.status, res.statusText, text);
    process.exit(1);
  }
  const json = await res.json();
  const names = (json.assets || []).map(a => a.name);
  console.log('Tag:', tag);
  console.log('Assets:', names.join(', '));
})();
