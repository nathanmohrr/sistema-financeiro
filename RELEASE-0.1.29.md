Release 0.1.29 — Notas e instruções de publicação

O que há de novo
- Correção de stacking-context que fazia modais abrirem atrás do backdrop (tela cinza) em vários pontos do app.
- Proteções em handlers de modal para evitar que erros async impeçam a abertura.
- Bump de versão para 0.1.29.

Como publicar (passos locais)
1) Verifique alterações e faça commit:

```powershell
git add package.json CHANGELOG.md CHANGELOG.md RELEASE-0.1.29.md index.html
git commit -m "chore(release): 0.1.29 — fix(modals): move modals to body and protect handlers"
```

2) Crie tag e publique no GitHub:

```powershell
git tag v0.1.29
git push origin main --follow-tags
```

3) Criar Release e publicar build (opcional automatizado):
- O projeto já contém scripts para empacotar e publicar. Se você quiser que o script publique o instalador no GitHub Releases, defina a variável de ambiente `GH_TOKEN` (token com permissão repo) e execute:

```powershell
$env:GH_TOKEN = 'seu_token_aqui'
npm run release:all
```

- Ou para publicar somente o executável (útil para testes):

```powershell
$env:GH_TOKEN = 'seu_token_aqui'
npm run publish-exe-only
```

Importante
- Não inclua seu `GH_TOKEN` em repositórios públicos. Use variáveis de ambiente.
- Os scripts `build-and-publish.js` e `publish-release.js` esperam artefatos gerados pelo `electron-builder`. Verifique `dist/` após o build.

Se quiser, eu posso:
- Gerar e testar localmente o build (requer Node/electron no seu ambiente). Posso instruir passo a passo.
- Criar a tag e, se você me der permissão (ou fornecer GH_TOKEN temporário), executar a publicação. Sem o token eu apenas te guio.
