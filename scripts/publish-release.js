// Publica release e artefatos no GitHub Releases usando GH_TOKEN
// Requisitos: definir GH_TOKEN no ambiente; repositório deve existir.
// Usa API do GitHub (octokit/rest via fetch) sem dependências extras.

const fs = require('fs');
const path = require('path');

const OWNER = 'nathanmohrr';
const REPO = 'sistema-financeiro';

async function main() {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('ERRO: defina a variável de ambiente GH_TOKEN com escopo repo/public_repo.');
    process.exit(1);
  }

  const version = require('../package.json').version;
  const tag = `v${version}`;
  const name = `v${version}`;

  const dist = path.resolve(__dirname, '..', 'dist');
  // Permite filtrar qual asset enviar via env ONLY_ASSET: exe | blockmap | yml | nome-do-arquivo
  function computeFiles() {
    // Suporta novo padrão (hífens) e antigo (espaços) – escolhe dinamicamente o que existir.
    const candidates = [
      { exe: `Sistema-Financeiro-Setup-${version}.exe`, block: `Sistema-Financeiro-Setup-${version}.exe.blockmap` },
      { exe: `Sistema Financeiro Setup ${version}.exe`, block: `Sistema Financeiro Setup ${version}.exe.blockmap` },
    ];
    let chosen = null;
    for (const c of candidates) {
      if (fs.existsSync(path.join(dist, c.exe))) { chosen = c; break; }
    }
    if (!chosen) chosen = candidates[0]; // fallback
    const base = [chosen.exe, chosen.block, 'latest.yml'];
    const only = (process.env.ONLY_ASSET || '').toLowerCase();
    if (!only) return base;
    if (only === 'exe') return [chosen.exe];
    if (only === 'blockmap') return [chosen.block];
    if (only === 'yml' || only === 'yaml' || only === 'latest.yml') return ['latest.yml'];
    return base.filter(f => f.toLowerCase().includes(only));
  }
  const files = computeFiles();

  for (const f of files) {
    const full = path.join(dist, f);
    if (!fs.existsSync(full)) {
      console.error(`ERRO: arquivo não encontrado: ${full}`);
      process.exit(2);
    }
  }

  const fetch = global.fetch || (await import('node-fetch')).default; // Node 18+ já possui fetch

  const gh = async (url, opts = {}) => {
    const res = await fetch(`https://api.github.com${url}`, {
      ...opts,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'sistema-financeiro-publish-script',
        ...opts.headers,
      },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`${res.status} ${res.statusText}: ${body}`);
    }
    return res.json();
  };

  // Garante que o repositório tenha ao menos um commit em uma branch (main)
  await ensureRepoInitialized(token);

  // Verifica se a release (tag) já existe
  let release;
  try {
    release = await gh(`/repos/${OWNER}/${REPO}/releases/tags/${encodeURIComponent(tag)}`);
    console.log(`Release existente encontrada: ${release.html_url}`);
  } catch (e) {
    console.log('Release não encontrada, criando nova...');
    try {
      release = await gh(`/repos/${OWNER}/${REPO}/releases`, {
        method: 'POST',
        body: JSON.stringify({
          tag_name: tag,
          name,
          body: 'Publicação automática do instalador e artefatos do Sistema Financeiro.',
          draft: false,
          prerelease: false,
          target_commitish: 'main',
          generate_release_notes: true,
        }),
      });
    } catch (err) {
      // Se ainda falhar, tenta novamente após garantir init do repo
      await ensureRepoInitialized(token);
      release = await gh(`/repos/${OWNER}/${REPO}/releases`, {
        method: 'POST',
        body: JSON.stringify({
          tag_name: tag,
          name,
          body: 'Publicação automática do instalador e artefatos do Sistema Financeiro.',
          draft: false,
          prerelease: false,
          target_commitish: 'main',
          generate_release_notes: true,
        }),
      });
    }
    console.log(`Release criada: ${release.html_url}`);
  }

  // Upload de assets
  const uploadUrlTemplate = release.upload_url; // ex: https://uploads.github.com/repos/:owner/:repo/releases/:id/assets{?name,label}
  const uploadBase = uploadUrlTemplate.split('{')[0];

  for (const f of files) {
    const full = path.join(dist, f);
    // Mantém exatamente o nome gerado pelo electron-builder (NÃO renomear) para casar com latest.yml
    const uploadName = path.basename(f);
    const nameParam = encodeURIComponent(uploadName);
    const stat = fs.statSync(full);
    const isYml = f.toLowerCase().endsWith('.yml');

    const stream = fs.createReadStream(full);
    const url = `${uploadBase}?name=${nameParam}`;

    // Tenta deletar asset com mesmo nome, se existir (e também variantes antigas com hífens/pontos)
    try {
      const assets = await gh(`/repos/${OWNER}/${REPO}/releases/${release.id}/assets`);
      console.log('Assets atuais:', assets.map(a => a.name));
      if (!process.env.NO_CLEANUP) {
        // Removemos variantes do MESMO arquivo (origem com espaços e destino com hífens)
        for (const a of assets) {
          if (a.name === uploadName) {
            await gh(`/repos/${OWNER}/${REPO}/releases/assets/${a.id}`, { method: 'DELETE' });
            console.log(`Asset existente removido: ${a.name}`);
          }
        }
      } else {
        console.log('NO_CLEANUP ativo: não removendo nenhum asset existente.');
      }
    } catch (_) {}

    console.log(`Enviando ${uploadName}...`);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': isYml ? 'text/yaml' : 'application/octet-stream',
        'Content-Length': stat.size.toString(),
        Authorization: `Bearer ${token}`,
        'User-Agent': 'sistema-financeiro-publish-script',
      },
      body: stream,
      // Node 18+ requer duplex ao enviar ReadableStream
      duplex: 'half',
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Falha no upload de ${f}: ${res.status} ${res.statusText}\n${body}`);
    }

    const json = await res.json();
    console.log(`Upload ok: ${json.name} -> ${json.browser_download_url}`);
  }

  // Lista final de assets para conferência
  try {
    const finalAssets = await gh(`/repos/${OWNER}/${REPO}/releases/${release.id}/assets`);
    console.log('Assets finais:', finalAssets.map(a => a.name));
  } catch (e) {
    console.log('Não foi possível listar assets finais:', e.message);
  }

  console.log('Publicação concluída com sucesso.');
}

async function ensureRepoInitialized(token) {
  const fetch = global.fetch;
  const gh = async (url, opts = {}) => {
    const res = await fetch(`https://api.github.com${url}`, {
      ...opts,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'sistema-financeiro-publish-script',
        ...opts.headers,
      },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`${res.status} ${res.statusText}: ${body}`);
    }
    return res.json();
  };

  // Checa se já existe ref heads/main
  const refUrl = `/repos/${OWNER}/${REPO}/git/ref/heads/main`;
  try {
    await gh(refUrl);
    return; // já inicializado
  } catch (_) {}

  // Caso não exista, vamos criar um commit inicial via Contents API
  console.log('Inicializando repositório (criando branch main e commit inicial via Contents API)...');
  const readmeContent = Buffer.from('# Sistema Financeiro\n\nApp desktop (Electron) com auto-update.').toString('base64');
  // Cria README.md na branch main
  await gh(`/repos/${OWNER}/${REPO}/contents/README.md`, {
    method: 'PUT',
    body: JSON.stringify({
      message: 'chore: commit inicial',
      content: readmeContent,
      branch: 'main',
    }),
  });
  // Define default branch
  try {
    await gh(`/repos/${OWNER}/${REPO}`, {
      method: 'PATCH',
      body: JSON.stringify({ default_branch: 'main' }),
    });
  } catch (_) {}
  console.log('Repositório inicializado com sucesso.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
