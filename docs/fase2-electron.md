# Fase 2 – Empacotar como App de Windows (Electron) com Auto‑update

Objetivo: gerar instalador (.exe) e permitir atualizações automáticas. Os dados já estão na nuvem (Fase 1), então o app só “embala” seu site.

## Pré‑requisitos
- Instalar Node.js LTS (https://nodejs.org/)
- Ter Git opcionalmente (para releases).

## Passo 1 – Estrutura mínima
Crie estes arquivos na raiz do projeto:

- `package.json` (exemplo mínimo)
```json
{
  "name": "sistema-financeiro",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder -w"
  },
  "devDependencies": {
    "electron": "^31.0.0",
    "electron-builder": "^24.0.0"
  },
  "build": {
    "appId": "com.seu.nome.sistemafinanceiro",
    "productName": "Sistema Financeiro",
    "win": { "target": "nsis" },
    "publish": [{ "provider": "github" }]
  }
}
```

- `main.js` (processo principal do Electron)
```js
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: { nodeIntegration: false, contextIsolation: true }
  });
  // Carrega seu index.html local
  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
```

## Passo 2 – Auto‑update (opcional neste início)
Depois que funcionar local, adicione no `main.js`:
```js
const { autoUpdater } = require('electron-updater');
autoUpdater.checkForUpdatesAndNotify();
```
E configure publicações no GitHub Releases (repo público ou token para privado). Ao criar uma tag/release, o electron‑builder publica os artefatos de update.

## Passo 3 – Build do instalador
- Instale dependências (primeira vez): `npm install`
- Rode: `npm run build` → gerará instalador em `dist/`.

## Passo 4 – Testar
- Instale o `.exe` no Windows e abra. Seu app abrirá dentro de uma janela própria.

Dica: Se você quiser manter a mesma pasta atual, considere mover seus arquivos web (index.html, style.css, script.js) para uma subpasta `app/` e apontar `loadFile('app/index.html')`.

Pronto! Assim você terá um instalador e, quando publicar novas versões, o auto‑update entrega aos clientes.
