# Atualização automática (Windows) – Passo a passo

Com esta configuração, quando você publicar uma nova versão, os apps instalados baixam e aplicam o update sozinhos.

## Requisitos
- Conta no GitHub e um repositório `sistema-financeiro`
- Criar um Personal Access Token (classic ou fine-grained) com permissão para Releases
- No Windows, ter Node.js instalado

## 1) Ajustes no projeto (já feitos)
- `electron/main.js` usa `electron-updater` e escuta eventos (update disponível, progresso, pronto para instalar).
- `electron/preload.js` expõe a leitura do `config.json` (para Firebase, se usar).
- `package.json`: scripts `build`, `release:win` e `build.publish` apontando para GitHub Releases.

## 2) Configurar seu GitHub
1. Crie o repositório `sistema-financeiro` na sua conta (troque `SEU_GITHUB_USERNAME` no package.json).
2. Gere um token em Settings > Developer Settings > Personal access tokens.
3. No PowerShell, defina a variável env para publicar (exemplo):
   `$env:GH_TOKEN = "SEU_TOKEN_AQUI"`

## 3) Publicar uma versão
1. Aumente a versão no `package.json` (ex.: 0.1.1 → 0.1.2)
2. No PowerShell, na pasta do projeto:
   - `npm install`
   - `npm run release:win`
3. Isso cria os artefatos em `dist/` e publica uma Release no GitHub com os arquivos de update.

## 4) Como funciona no cliente
- O app instalado verifica updates (`checkForUpdatesAndNotify`).
- Ao existir update, baixa em background; ao final, mostra “Reiniciar para atualizar”.

## 5) Dicas
- Assine o app para reduzir alertas do Windows SmartScreen.
- Se preferir não usar GitHub, configure `publish` para S3 ou outro servidor.
- Mantenha `artifactName` estável; `autoUpdater` depende dos nomes/arquivos padrão.

Pronto. Agora você só precisa publicar releases; os clientes atualizam automaticamente.
