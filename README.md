<<<<<<< HEAD
# Sistema Financeiro

App desktop (Electron) com auto-update.
=======
# Sistema Financeiro – Caminho para Nuvem e Instalação no PC

Este guia é para você começar do zero, em passos curtos e claros. Sem siglas difíceis.

## O que você quer
- Instalar no PC (Windows) e funcionar como um app.
- Dados na nuvem para acessar de qualquer computador com login.
- Você consegue enviar atualizações e correções para todos.

## Estratégia simples (em 2 fases)
- Fase 1: Colocar login e dados na nuvem com o mínimo de complexidade (Firebase). Continua rodando no navegador e pode ser “instalado” como app (PWA). Você já terá login e seus dados seguros na nuvem.
- Fase 2: Empacotar como programa de Windows (Electron) com instalador e atualização automática. O sistema continua usando os mesmos dados da nuvem.

Sugerido: faça a Fase 1 hoje. É mais rápida e te dá clientes usando em nuvem. Depois, quando quiser, parte para o instalador (Fase 2).

---

## Fase 1 – Login e dados na nuvem (Firebase)
Você terá:
- Login (e-mail/senha) por usuário.
- Dados guardados na nuvem (Firestore), com cada cliente isolado.
- App “instalável” como PWA (ícone e atalho), sem precisar de instalador tradicional.

Passos (leva ~30–60 min):
1) Crie uma conta no Firebase e um projeto
   - Acesse https://firebase.google.com/ (botão “Ir para console”).
   - Crie um novo projeto (ex.: “sistema-financeiro”).
2) Habilite Authentication (e-mail/senha)
   - No menu “Build” → “Authentication” → “Sign-in method” → ative “Email/Password”.
3) Crie Firestore (banco de dados)
   - “Build” → “Firestore Database” → “Create database” → modo Production.
4) Pegue a Config do app
   - “Project settings” (ícone engrenagem) → “Your apps” → “</> Web App” → registre um app web → copie a configuração (apiKey, authDomain, etc.).
5) Adicione as regras de segurança (isolar dados por empresa)
   - Em “Firestore Database” → “Rules”, cole o exemplo em `docs/fase1-firebase.md` (seção “Regras de segurança”) e publique.
6) Coloque a config no seu projeto
   - Crie um arquivo `config.sample.json` (já temos um exemplo em breve) e depois crie `config.json` com seus dados reais (NÃO comite chaves reais no Git).
7) Integre login e Firestore
   - Use o guia `docs/fase1-firebase.md` para colar 3 scripts do Firebase via CDN no seu `index.html` e inicializar o Auth e o Firestore.
   - Crie a tela de login (exemplo no guia) e, após logar, salve e leia dados do Firestore no lugar (ou junto) do IndexedDB.
8) (Opcional) PWA
   - Transforme seu site em PWA (manifest + service worker). O guia tem um checklist rápido. Isso permite “instalar” o app no Windows com ícone.
# Sistema Financeiro – Caminho para Nuvem e Instalação no PC

Este guia é para você começar do zero, em passos curtos e claros. Sem siglas difíceis.

## O que você quer
- Instalar no PC (Windows) e funcionar como um app.
- Dados na nuvem para acessar de qualquer computador com login.
- Você consegue enviar atualizações e correções para todos.

## Estratégia simples (em 2 fases)
- Fase 1: Colocar login e dados na nuvem com o mínimo de complexidade (Firebase). Continua rodando no navegador e pode ser “instalado” como app (PWA). Você já terá login e seus dados seguros na nuvem.
- Fase 2: Empacotar como programa de Windows (Electron) com instalador e atualização automática. O sistema continua usando os mesmos dados da nuvem.

Sugerido: faça a Fase 1 hoje. É mais rápida e te dá clientes usando em nuvem. Depois, quando quiser, parte para o instalador (Fase 2).

---

## Fase 1 – Login e dados na nuvem (Firebase)
Você terá:
- Login (e-mail/senha) por usuário.
- Dados guardados na nuvem (Firestore), com cada cliente isolado.
- App “instalável” como PWA (ícone e atalho), sem precisar de instalador tradicional.

Passos (leva ~30–60 min):
1) Crie uma conta no Firebase e um projeto
   - Acesse https://firebase.google.com/ (botão “Ir para console”).
   - Crie um novo projeto (ex.: “sistema-financeiro”).
2) Habilite Authentication (e-mail/senha)
   - No menu “Build” → “Authentication” → “Sign-in method” → ative “Email/Password”.
3) Crie Firestore (banco de dados)
   - “Build” → “Firestore Database” → “Create database” → modo Production.
4) Pegue a Config do app
   - “Project settings” (ícone engrenagem) → “Your apps” → “</> Web App” → registre um app web → copie a configuração (apiKey, authDomain, etc.).
5) Adicione as regras de segurança (isolar dados por empresa)
   - Em “Firestore Database” → “Rules”, cole o exemplo em `docs/fase1-firebase.md` (seção “Regras de segurança”) e publique.
6) Coloque a config no seu projeto
   - Crie um arquivo `config.sample.json` (já temos um exemplo em breve) e depois crie `config.json` com seus dados reais (NÃO comite chaves reais no Git).
7) Integre login e Firestore
   - Use o guia `docs/fase1-firebase.md` para colar 3 scripts do Firebase via CDN no seu `index.html` e inicializar o Auth e o Firestore.
   - Crie a tela de login (exemplo no guia) e, após logar, salve e leia dados do Firestore no lugar (ou junto) do IndexedDB.
8) (Opcional) PWA
   - Transforme seu site em PWA (manifest + service worker). O guia tem um checklist rápido. Isso permite “instalar” o app no Windows com ícone.

Resultado da Fase 1:
- Seu sistema usa login e salva tudo na nuvem. Seu cliente entra com e-mail/senha em qualquer computador e vê os dados.
- Você atualiza o sistema publicando a nova versão dos arquivos (deploy) e todos recebem automaticamente.

---

## Fase 2 – Instalador de Windows + Auto‑update (Electron)
Quando quiser um instalador tradicional:
- Empacotar seu site dentro do Electron.
- Gerar instalador `.exe` e updates automáticos.

Passos:
1) Preparar Node.js no PC (instalar Node LTS).
2) Adicionar Electron ao projeto e um arquivo `main.js` (modelo no `docs/fase2-electron.md`).
3) Usar electron-builder para criar o instalador e configurar auto-update.
4) Publicar releases (GitHub Releases ou S3). O app dos clientes baixa updates sozinho.

Resultado da Fase 2:
- App com instalador e atualizações automáticas, dados continuam na nuvem.

### Painel de progresso de atualização
- A partir da versão 0.1.5, o app mostra um painel no canto inferior direito ao verificar e baixar uma atualização.
- Estados: verificando, disponível, baixando (com porcentagem e velocidade), baixado (com botão "Reiniciar e instalar"), não disponível e erro.
- Para iniciar manualmente: menu Ajuda > Verificar atualizações.
- Observação: clientes em N verão o painel quando atualizarem para N+1.

---

## Glossário rápido (sem mistério)
- Login/Auth: parte que faz entrar com e-mail/senha.
- Banco na nuvem: lugar onde seus dados ficam (Firestore). A internet é necessária para sincronizar.
- Multi-empresa (multi-tenant): separar os dados de cada cliente. A regra de segurança impede vazamentos.
- PWA: site que vira “aplicativo” instalado com ícone no Windows.
- Electron: tecnologia para empacotar seu site como programa de Windows.

---

## Próximo passo prático
- Quer que eu integre agora o Login + Firestore (Fase 1) no `index.html` com tudo pronto para você testar? Se sim, eu já adiciono o código e deixo um `config.json` de exemplo para você colar suas chaves.
