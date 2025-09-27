const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

// Flag para sabermos quando o encerramento é intencional (update/instalador)
let isQuiting = false;

// Log leve para diferenciar build 0.1.12 (teste de auto-update)
try { console.log('[SF] Inicializando main process - versão', require('../package.json').version); } catch(_) {}

// Caminhos base:
// - App base: onde ficam os arquivos do app (index.html), inclusive dentro do app.asar quando empacotado
// - Resources base: pasta resources do pacote (onde colocamos config.json via extraResources)
function getAppBase(){ return app.getAppPath(); }
function getResourcesBase(){ return process.resourcesPath; }

function createWindow(){
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
  preload: path.join(__dirname, 'preload.js'),
  // Sandbox desativado para permitir Node no preload (contextIsolation mantém segurança)
  sandbox: false,
    }
  });

  // Carrega a SPA local (de dentro do app.asar quando empacotado)
  win.loadFile(path.join(getAppBase(), 'index.html'));

  // Abrir DevTools só quando explicitamente solicitado
  // Para abrir: defina OPEN_DEVTOOLS=1 antes de iniciar (ex.: $env:OPEN_DEVTOOLS='1'; npm run dev)
  if (process.env.OPEN_DEVTOOLS === '1') {
    win.webContents.openDevTools({ mode: 'detach' });
  }

  // Removido disparo imediato de auto-update daqui; agora é feito após registrar listeners
  // para não perder eventos iniciais (checking / available / progress) no primeiro lançamento.

  return win;
}

// Garante single instance (evita múltiplos processos que impedem fechamento pelo instalador)
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
}

app.whenReady().then(() => {
  // IPC: ler config.json
  ipcMain.handle('get-config', async () => {
    try {
  const cfgPath = path.join(getResourcesBase(), 'config.json');
      const raw = fs.readFileSync(cfgPath, 'utf-8');
      return JSON.parse(raw);
    } catch (err) {
      return null;
    }
  });

  // IPC: obter versão do app
  ipcMain.handle('get-version', async () => {
    try { return app.getVersion(); } catch (_) { return '0.0.0'; }
  });

  const win = createWindow();

  // Encaminha mensagens de console do renderer para o terminal do main process
  try{
    win.webContents.on && win.webContents.on('console-message', (e, level, message, line, sourceId) => {
      try{ console.log('[RENDERER]', level, message, sourceId+':'+line); }catch(_){ /* noop */ }
    });
  }catch(_){ }

  // Helper para enviar status de update ao renderer
  const sendUpdate = (status, payload = {}) => {
    try { win.webContents.send('update-status', { status, ...payload }); } catch(_) {}
  };

  // Menu da aplicação (Ajuda > Sobre / Verificar atualizações)
  const template = [
    // Em plataformas com menu de app (macOS), adiciona um menu básico
    ...(process.platform === 'darwin'
      ? [{
          label: app.name,
          submenu: [
            { role: 'about', label: 'Sobre' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideothers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
          ]
        }]
      : []),
    {
      label: 'Ajuda',
      role: 'help',
      submenu: [
        {
          label: 'Verificar atualizações',
          click: async () => {
            if (!app.isPackaged) {
              dialog.showMessageBox(win, {
                type: 'info',
                title: 'Atualizações',
                message: 'A verificação de atualizações só funciona no app instalado.',
              });
              return;
            }
            // Dispara a checagem e notifica o renderer para abrir o painel
            try {
              sendUpdate('checking');
              await autoUpdater.checkForUpdates();
            } catch (e) {
              // Se falhar (ex.: provider inexistente), repassa erro silencioso ao renderer
              sendUpdate('error', { message: String(e?.message || e || 'Falha ao verificar atualizações') });
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Sobre',
          click: () => {
            const details = [
              `Versão do app: ${app.getVersion()}`,
              `Electron: ${process.versions.electron}`,
              `Chrome: ${process.versions.chrome}`,
              `Node: ${process.versions.node}`,
              `Plataforma: ${process.platform} ${process.arch}`
            ].join('\n');
            dialog.showMessageBox(win, {
              type: 'info',
              title: 'Sobre — Sistema Financeiro',
              message: 'Sistema Financeiro',
              detail: details,
            });
          }
        }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // IPC para verificações manuais vindas do renderer
  ipcMain.handle('check-for-updates', async () => {
    if (!app.isPackaged) return { ok: false, reason: 'not-packaged' };
    try {
      sendUpdate('checking');
      await autoUpdater.checkForUpdates();
      return { ok: true };
    } catch (e) {
      sendUpdate('error', { message: String(e?.message || e) });
      return { ok: false, error: String(e?.message || e) };
    }
  });

  ipcMain.handle('restart-and-install', async () => {
    try {
      isQuiting = true; // marca encerramento intencional
      setImmediate(() => autoUpdater.quitAndInstall());
      return { ok: true };
    }
    catch (e) { return { ok: false, error: String(e?.message || e) }; }
  });

  // IPC de debug: obter conteúdo latest.yml (cache local ou fetch direto)
  ipcMain.handle('debug-get-latest-yml', async () => {
    const result = { ok: false, source: null, content: null, error: null };
    if (!app.isPackaged) { result.error = 'not-packaged'; return result; }
    try {
      // Caminho típico de cache do electron-updater (Win): %LOCALAPPDATA%/app-name-updater/pending/latest.yml
      // Também pode estar em: \AppData\Local\{appname}-updater\pending
      const userData = app.getPath('appData') || app.getPath('userData');
      // Heurística: montar possíveis caminhos
      const guessDirs = [
        path.join(process.env.LOCALAPPDATA || userData, (app.getName().toLowerCase().replace(/\s+/g,'-'))+'-updater'),
        path.join(process.env.LOCALAPPDATA || userData, app.getName()+'-updater'),
      ];
      let foundPath = null;
      for (const base of guessDirs) {
        try {
          const p1 = path.join(base, 'pending', 'latest.yml');
            if (fs.existsSync(p1)) { foundPath = p1; break; }
          const p2 = path.join(base, 'latest.yml');
            if (!foundPath && fs.existsSync(p2)) { foundPath = p2; break; }
        } catch(_){}
      }
      if (foundPath) {
        try {
          result.content = fs.readFileSync(foundPath, 'utf-8');
          result.ok = true; result.source = 'cache';
          return result;
        } catch(err){ result.error = 'read-cache-failed: '+(err?.message||err); }
      }
      // Fallback: tentar baixar diretamente do feed GitHub (public releases)
      try {
        const repoOwner = 'nathanmohrr';
        const repoName = 'sistema-financeiro';
        const latestUrl = `https://github.com/${repoOwner}/${repoName}/releases/latest/download/latest.yml`;
        const https = require('https');
        const fetched = await new Promise((resolve, reject) => {
          https.get(latestUrl, (res) => {
            if (res.statusCode !== 200) { return reject(new Error('HTTP '+res.statusCode)); }
            let data=''; res.on('data', d=> data+=d); res.on('end', ()=> resolve(data));
          }).on('error', reject);
        });
        result.content = fetched; result.ok = true; result.source = 'network';
      } catch(err){ result.error = 'fetch-failed: '+(err?.message||err); }
      return result;
    } catch (e) {
      result.error = String(e?.message || e);
      return result;
    }
  });

  // IPC de debug: força uma checagem detalhada (sem iniciar outra se já houver)
  ipcMain.handle('debug-force-check', async () => {
    const meta = { ok:false, started: Date.now(), finished:null, status:null, error:null, rawError:null, version: app.getVersion() };
    if (!app.isPackaged) { meta.error = 'not-packaged'; meta.finished=Date.now(); return meta; }
    try {
      // Usa checkForUpdates (não AndNotify) para obter objeto UpdateCheckResult
      const r = await autoUpdater.checkForUpdates();
      meta.status = (r && r.updateInfo && r.updateInfo.version && r.updateInfo.version !== app.getVersion()) ? 'update-available' : 'up-to-date';
      meta.ok = true;
    } catch(err){ meta.error = err?.message || String(err); meta.rawError = String(err); }
    meta.finished = Date.now();
    return meta;
  });

  // IPC de debug: limpar cache local do updater (força re-download de latest.yml / executável)
  ipcMain.handle('debug-clear-updater-cache', async () => {
    const res = { ok:false, removed:[], error:null };
    try {
      const base = process.env.LOCALAPPDATA || app.getPath('userData');
      const variants = [
        app.getName()+'-updater',
        app.getName().toLowerCase().replace(/\s+/g,'-')+'-updater'
      ];
      for (const v of variants) {
        const dir = path.join(base, v);
        try {
          if (fs.existsSync(dir)) { fs.rmSync(dir, { recursive:true, force:true }); res.removed.push(dir); }
        } catch(e){ /* coleta parcial de erros mas continua */ }
      }
      res.ok = true;
    } catch(e){ res.error = String(e?.message||e); }
    return res;
  });

  // IPC explícito para fechar app (pode ser usado pelo renderer antes de instalar manualmente)
  ipcMain.handle('app-quit', () => {
    isQuiting = true;
    setImmediate(() => app.quit());
    return { ok: true };
  });

  // Auto-update: listeners básicos (apenas quando empacotado)
  if (app.isPackaged) {
    try {
      // Controle para evitar múltiplas checagens simultâneas gerando eventos fora de ordem
      let updateSession = 0; // id crescente por checagem
      let activeSession = 0; // sessão atual válida
      let isChecking = false;
      function beginSession(){ activeSession = ++updateSession; isChecking = true; return activeSession; }
      function endSession(id){ if(id === activeSession) isChecking = false; }
      function isStale(id){ return id !== activeSession; }
      // Configurações antes de iniciar qualquer checagem
      autoUpdater.autoDownload = true;
      autoUpdater.autoInstallOnAppQuit = true; // instala ao fechar o app
      // (Opcional futuro) - permitir definir canal ou header privado
      // if(process.env.GH_PRIVATE_TOKEN) autoUpdater.requestHeaders = { Authorization: `Bearer ${process.env.GH_PRIVATE_TOKEN}` };

      autoUpdater.on('checking-for-update', () => {
        const id = beginSession();
        console.log('[UPDATE] checking-for-update session=', id);
        sendUpdate('checking');
      });

      autoUpdater.on('update-available', (info) => {
        console.log('[UPDATE] update-available', info?.version, 'session=', activeSession);
        if(isStale(activeSession)) { console.log('[UPDATE] (stale available ignored)'); return; }
        sendUpdate('available', { info });
      });

      autoUpdater.on('update-not-available', (info) => {
        console.log('[UPDATE] update-not-available (versão atual =', app.getVersion(), ') session=', activeSession);
        endSession(activeSession);
        if(isStale(activeSession)) { console.log('[UPDATE] (stale not-available ignored)'); return; }
        sendUpdate('not-available', { info });
      });

      autoUpdater.on('download-progress', (p) => {
        if(p && typeof p.percent === 'number') {
          if(Math.round(p.percent) % 5 === 0) console.log('[UPDATE] download-progress', Math.round(p.percent)+'%');
        }
        // Sessão permanece ativa até update-downloaded ou erro terminal
        const progress = (p && typeof p.percent === 'number') ? p.percent / 100 : 0;
        win.setProgressBar(progress);
        sendUpdate('downloading', {
          percent: p?.percent,
          transferred: p?.transferred,
          total: p?.total,
          bytesPerSecond: p?.bytesPerSecond
        });
      });

      autoUpdater.on('update-downloaded', (info) => {
        console.log('[UPDATE] update-downloaded', info?.version);
        endSession(activeSession);
        win.setProgressBar(-1);
        // Apenas notifica o renderer para que o painel "canto inferior" ofereça o botão de reinício.
        sendUpdate('downloaded', { info });
      });

      // Antes de sair para instalar update (evento especial do electron-updater)
      autoUpdater.on('before-quit-for-update', () => {
        isQuiting = true;
      });

      autoUpdater.on('error', (err) => {
        win.setProgressBar(-1);
        const msg = String(err || 'Falha ao atualizar.');
        endSession(activeSession);
        // (Removido silenciamento para permitir diagnóstico completo)
        console.error('[UPDATE] error', msg);
        sendUpdate('error', { message: msg });
        dialog.showMessageBox(win, {
          type: 'error',
          title: 'Erro de atualização',
          message: msg
        });
      });

      // Dispara checagem inicial somente agora (listeners prontos)
      if (process.env.AUTO_UPDATE_DISABLE !== '1') {
        setTimeout(() => {
          try {
            if(!isChecking){
              console.log('[UPDATE] check inicial disparada (versão atual', app.getVersion(), ')');
              autoUpdater.checkForUpdatesAndNotify();
            } else {
              console.log('[UPDATE] check inicial abortada: já há checagem em andamento');
            }
          } catch (e) {
            console.warn('[UPDATE] falha ao iniciar checagem inicial:', e?.message || e);
          }
        }, 1200);
      }

      // Garante que a ação manual não dispare concorrência (interceptar IPC existente)
      ipcMain.handle('check-for-updates', async () => {
        if (!app.isPackaged) return { ok: false, reason: 'not-packaged' };
        if (isChecking) {
          console.log('[UPDATE] check ignorada: já em andamento');
          return { ok:false, reason:'in-progress' };
        }
        try {
          sendUpdate('checking');
          autoUpdater.checkForUpdates();
          return { ok: true };
        } catch (e) {
          sendUpdate('error', { message: String(e?.message || e) });
          return { ok:false, error: String(e?.message || e) };
        }
      });
    } catch (_) { /* noop */ }
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (!isQuiting) {
      // Encerramento normal solicitado pelo usuário ou pelo sistema
      app.quit();
    } else {
      // Já estamos em fluxo de update/quit intencional
      app.exit(0);
    }
  }
});

// Intercepta tentativa de fechar janela principal para garantir app.quit consistente (especialmente no Windows)
app.on('before-quit', () => { isQuiting = true; });
