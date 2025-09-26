# Como publicar uma nova versão (guia rápido)

Pré-requisitos:
- Defina o segredo `GH_TOKEN` no repositório (Settings → Secrets) com permissão `repo`.
- Tenha uma branch `main` com o código atualizado.

Publicação automática (recomendada):
1) Crie uma tag com a versão desejada (por exemplo v0.1.24) e um release no GitHub.
2) O workflow `.github/workflows/release.yml` será disparado automaticamente e fará o build no Windows e publicará os artefatos.

Publicação manual (local):
- Defina `GH_TOKEN` no seu ambiente local:

```powershell
$env:GH_TOKEN = 'seu_token_aqui'
```

- Rode:

```powershell
npm ci
npx electron-builder --win
node scripts/publish-release.js
```

Se quiser enviar apenas o `.exe` (sem limpeza):

```powershell
$env:ONLY_ASSET='exe'; node scripts/publish-release.js
```

Observações:
- O script `publish-release.js` procura arquivos em `dist/` com nomes gerados pelo electron-builder. Ele criará a release se não existir.
- Se preferir publicar manualmente os artefatos via GitHub UI, o `latest.yml` gerado pelo electron-builder é necessário para auto-update funcionar corretamente.
