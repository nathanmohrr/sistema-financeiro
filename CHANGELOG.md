# Changelog

## 0.1.24 - 2025-09-25
### Added
- Exibição do valor total de venda do KIT no modal de cadastro/edição de produto (soma dos preços de venda dos componentes × qtd).

### Changed
- Pequenas melhorias de UX no modal de cadastro de produto (limpeza de estado ao cancelar, foco consistente).

### Fixed
- Zera corretamente os valores calculados do KIT ao cancelar/fechar o modal.

## 0.1.22 - 2025-09-24
### Added
- Campo de validade exibido e editável com destaque (badge VENC / dias restantes) e cores de linha para alerta/vencido.
- Ordenação por inclusão (CreatedAt) via botão e atalho Shift+I.

### Changed
- Layout da tabela de produtos: colunas numéricas compactas (Compra/Venda flexíveis), Produto e Marca redistribuídos sem rolagem horizontal.
- Coluna Produto voltou a 1 linha com ellipsis para alinhamento perfeito das linhas.
- Data de validade formatada agora como dd/mm/aaaa e centralizada.
- Posição dos badges padronizada (validade e estoque) para consistência visual.

### Fixed
- Campo de validade não era preenchido ao editar produto existente (agora normaliza e preenche).
- Fundo parcial em linhas com validade vencida (agora a linha inteira recebe a cor, inclusive hover).
- Desalinhamento de altura das linhas devido a clamp multi-linha no Produto.

### Internal / Tech
- Incremento de versão em `package.json` para 0.1.22.

### Next
- Tooltips para texto truncado em Produto e Marca.
- Otimizar fluxo de atualização de estoque em massa.
## 0.1.21 - 2025-09-23
### Added
- Preparação para ícone multi-resolução: script `scripts/make-icon.js` agora tenta gerar ICO real com tamanhos 16–256 usando `jimp` + `png-to-ico` quando `MULTI_ICON=1`.

### Changed
- Pipeline de ícone mantém fallback anterior (duplicação do PNG) caso geração multi-res falhe (erro atual com placeholder reduzido / stream PNG). Logs detalhados adicionados.

### Internal / Tech
- Dependências adicionadas: `jimp`, `png-to-ico`.
- Estrutura de limpeza de arquivos temporários `__tmp_<size>.png` após geração multi-res.

### Next
- Substituir placeholder por logo final em alta resolução (>=512x512) para evitar erro de parsing e permitir ICO multi-camada verdadeiro.
- Ajustar heurística para detectar PNG inválido / muito pequeno e retornar mensagem clara ao invés do erro genérico de stream.

## 0.1.20 - 2025-09-23
### Removed
- Dialog central pós-download (modal "Atualização pronta" com botões Reiniciar agora / OK). Agora só o painel discreto no canto inferior direito permanece.
- Botão/área de Debug no painel de atualização (limpeza visual para usuários finais).

### Changed
- Download concluído continua exibindo botão "Reiniciar e instalar" apenas no painel lateral.

### Internal / Tech
- IPCs de debug permanecem (podem ser reativados via flag futura) mas UI foi ocultada.


## 0.1.19 - 2025-09-23
### Fixed
- Inconsistência de nomenclatura de artefatos: `latest.yml` referenciava `Sistema-Financeiro-Setup-<ver>.exe` enquanto o build gerava `Sistema.Financeiro.Setup.<ver>.exe` (pontos ao invés de hífens). Isso impedia o auto-updater de encontrar o asset.

### Changed
- `artifactName` padronizado para `Sistema-Financeiro-Setup-${version}.${ext}` evitando espaços/pontos e alinhando com padrão esperado pelo feed.

### Next
- Publicar 0.1.19 e validar que cliente 0.1.18/0.1.17 agora baixa corretamente.


## 0.1.18 - 2025-09-23
### Added
- Painel/modo de debug de auto-update: exibe versão instalada, conteúdo bruto de `latest.yml`, URL alvo do provedor GitHub e resultado da checagem mais recente.
- IPC `debug-get-latest-yml` para leitura direta do arquivo `latest.yml` em cache (se baixado) ou fetch ao vivo do feed.
- IPC `debug-force-check` que retorna metadados detalhados (tempo de início/fim, status final, erro se houver) sem interferir em uma checagem já ativa.

### Changed
- Painel de atualização agora possui botão "Debug" (somente em builds empacotados) revelando detalhes avançados para diagnóstico de falhas em clientes antigos.

### Internal / Tech
- Proteção para não realizar múltiplos fetches simultâneos de debug.
- Normalização parcial de logs de erro retornados para o renderer (campo `rawError`).

### Next
- Persistir histórico de eventos de update em arquivo (electron-log) e expor via `debug-list-update-log`.
- Opção para limpar cache do updater e refazer download.

## 0.1.17 - 2025-09-23
### Fixed
- Corrida de eventos do auto-update (estado 'available' seguido rapidamente de 'not-available').

### Added
- Controle de sessão para checagens (`updateSession`, `activeSession`, `isChecking`).
- Descarte de eventos stale e bloqueio de nova checagem enquanto uma está em andamento.

### Internal / Tech
- Logging de sessão em todos os eventos do auto-updater.
- IPC `check-for-updates` agora retorna motivo `in-progress` quando já há checagem ativa.

### Next
- IPC de debug para inspecionar direto o conteúdo do latest.yml.
- Persistência de logs de atualização em arquivo.

## 0.1.16 - 2025-09-23
### Added
- Modal de confirmação customizado substituindo `window.confirm` para exclusão de marcas (UX consistente com Bootstrap).
- Opção "Não perguntar novamente" com persistência (`localStorage.confirm.suppress.*`) em confirmações.
- IDs estáveis para itens do buffer de produtos (remoção confiável após re-render).
- Captura de leitura de código de barras sem adicionar automaticamente ao buffer (Enter no campo apenas finaliza leitura).

### Changed
- Exclusões de marca agora usam `confirmDialog` com botão `danger`.
- Enter no formulário ignora campo de código de barras para prevenir adição acidental via scanner.

### Internal / Tech
- Listener global de fallback para remoção de itens do buffer.
- Preparação para lookup automático de produto por código de barras (sequência rápida já monitorada).

### Next
- Lookup automático e preenchimento de produto ao escanear código.
- Tela para gerenciar confirmações suprimidas.
- Expiração de supressões por tempo ou versão.

## 0.1.15 - 2025-09-23
### Changed
- Reorganizado fluxo do auto-update: checagem inicial agora dispara somente após todos os listeners estarem registrados, evitando perda de eventos (checking / available / progress) no primeiro lançamento.

### Added
- Logs detalhados `[UPDATE]` (checking, available, not-available, progress, downloaded, error) para diagnosticar problemas de atualização em produção.

### Fixed
- Painel de atualização às vezes não aparecia porque a checagem ocorria antes do binding dos listeners (sintoma: usuário não via progresso, embora update pudesse instalar ao sair).

### Internal / Tech
- Retirada chamada precoce `checkForUpdatesAndNotify` de dentro de `createWindow`; agora usa um pequeno atraso (1.2s) depois da criação da janela principal.

### Next
- Avaliar padronização de artifactName sem espaços/pontos para consistência futura.
- Persistir logs de update em arquivo (electron-log) para suporte remoto.

## 0.1.14 - 2025-09-23
### Added
- Indicador visual de força da senha (barra + dica dinâmica) no cadastro.
- Feedback imediato de confirmação de senha (mensagem verde/vermelha conforme digitação).
- Botões de mostrar senha com comportamento press-and-hold (mouse e toque) para maior segurança e evitar deixar senha exposta permanentemente.

### Changed
- Unificação e limpeza final do fluxo de signup (remoção completa de modal legado de login na nuvem e referências órfãs).
- Melhoria de mensagens de erro e estados do botão de criação (não prossegue com senha < 6 caracteres antes de chamar backend).

### Fixed
- Campos de senha não ficavam editáveis em alguns cenários devido a sobreposição de modais antigos (eliminado ao remover markup duplicado).
- Erros de referência a funções antigas (`cloudUser`, `formCloud`, etc.) que poderiam gerar exceptions silenciosas.

### Internal / Tech
- Reforço da validação de senha também dentro de `authManager.signUp` (defesa em profundidade).
- Organização dos handlers de eventos (mousedown/mouseup/touch) encapsulados em função auxiliar para reutilização.

### Next
- Forçar troca de senha inicial do admin seed.
- Fila de sincronização offline -> nuvem (primeira migração de dados locais após login cloud).
- Limite e backoff em tentativas de signup para mitigar abuso.

## 0.1.13 - 2025-09-23
### Added
- Fallback completo de criação de conta: se Firebase indisponível/offline, cria usuário ADMIN local e autentica.
- Mensagens mais claras no modal de cadastro (senhas diferentes, indisponibilidade de username, modo offline).

### Changed
- Consolidado fluxo de signup em um único handler (`initStaticSignup`) e remoção de bloco duplicado tardio que podia conflitar.
- Validação de confirmação de senha incluída antes de chamar Firebase.

### Fixed
- Criação de usuário na nuvem não ocorria em alguns cenários por checagem rígida de `cloud.inited`; agora processo tenta nuvem e recua para local.
- Risco de múltiplos listeners de submit no mesmo formulário eliminado.

### Internal / Tech
- Simplificação de lógica de verificação de disponibilidade de username (só consulta Firestore quando inited e online).
- Ajustado texto e estados do botão (Criando... / Criar conta) de forma centralizada.

### Next
- Indicador visual de força de senha.
- Forçar redefinição da senha admin local no primeiro login.
- Sincronização parcial inicial (migração do local para nuvem quando usuário cria conta).

## 0.1.12 - 2025-09-22
### Purpose
- Release destinada a validar o fluxo completo de auto‑update partindo da 0.1.11 (instalador funcional após correção do script NSIS).

### Changed / Internal
- Bump de versão sem mudanças funcionais de produto (apenas incremento para teste de atualização automática).
- Mantido script `installer.nsh` simplificado (remoção de labels duplicadas) introduzido no ciclo 0.1.11.

### Test Plan
1. Instalar/confirmar 0.1.11.
2. Publicar 0.1.12 (GitHub release com `latest.yml`).
3. No app 0.1.11: Ajuda > Verificar atualizações.
4. Confirmar download, fechamento e relaunch em 0.1.12.

### Expected
- Auto-update deve encerrar o processo sem erro de arquivo em uso.
- Nova versão exibida em Ajuda > Sobre.

### Next
- Caso sucesso: iniciar ciclo de features (ícone aplicativo, melhoria de UX de update, ícone custom installer).
- Caso falha: capturar logs (`%LOCALAPPDATA%/sistema-financeiro-updater`) e reforçar mecanismos de encerramento.

## 0.1.11 - 2025-09-22
### Internal / Tech
- Ajuste de build: `compression` alterado para `normal` e `differentialPackage` desativado para acelerar geração de instalador e reduzir risco de interrupção.
- Bump para novo ciclo de teste de upgrade (0.1.10 -> 0.1.11) em caminho neutro.

## 0.1.10 - 2025-09-22
### Fixed
- Reforço adicional no processo de upgrade: loops de tentativa e múltiplas fases (init/install/uninstall) para garantir encerramento de processos antes da substituição de arquivos.

### Internal / Tech
- Script `installer.nsh` ampliado (loops, macros `_SFKillOnce`, `SFEnsureKilled`, aplicação em `customInstall`).
- Bump para validar upgrade 0.1.9 -> 0.1.10.

## 0.1.9 - 2025-09-22
### Fixed
- Persistia falha em alguns upgrades (NSIS code 2) por não conseguir desalocar binários; adicionado script `installer.nsh` que força encerramento (`taskkill`) de processos antes e durante uninstall/upgrade.

### Internal / Tech
- Inclusão de `build/installer.nsh` via `nsis.include` no `package.json`.
- Bump de versão para permitir novo ciclo de teste de upgrade (0.1.8 -> 0.1.9).

## 0.1.8 - 2025-09-22
### Fixed
- Processo de instalação/atualização podia falhar ao não conseguir fechar o app em execução (adicionado controle de single instance, flag de encerramento e integração com fluxo de update do Electron).

### Added
- IPC `app-quit` para permitir que o renderer peça encerramento seguro antes de instalações manuais.

### Internal / Tech
- Implementado `requestSingleInstanceLock`, listener `before-quit-for-update` e padronização de encerramento em `electron/main.js`.

### Notes
- Recomenda-se atualizar a partir da 0.1.7 executando a instalação da 0.1.8 direto sobre a versão anterior para validar fechamento automático.

## 0.1.7 - 2025-09-22
### Added
- Modal de cadastro separado (`modalCloudSignup`) acessível tanto do gate inicial quanto do modal de login.
- Campo de confirmação de senha e validação explícita.
- Verificação simples de disponibilidade de username (feedback visual no cadastro).

### Changed
- Removida lógica de alternância de modo (login/signup) dentro do modal de login para reduzir confusão.
- Fluxo de criação de conta agora sempre fecha modal após sucesso e aplica sessão imediatamente.

### Fixed
- Botão “Criar conta” do gate não abria interface de cadastro (agora abre modal correto).
- Possível inconsistência de criação local ao faltar Firebase (fallback consolidado no mesmo handler).

### Internal / Tech
- Reorganização de handlers de signup para isolar responsabilidade e simplificar manutenção.

### Pending / Next
- Forçar troca de senha inicial do admin recém criado.
- Indicador de força da senha e opção mostrar/ocultar.
- Sincronização incremental de dados locais para nuvem.

## 0.1.6 - 2025-09-18
### Added
- Nova área de Personalização redesenhada em cards (dropzones de logo e favicon, previews em tempo real, slider de arredondamento, preview de navbar, mini e favicon).
- Mensagem de primeiro acesso orientando uso de admin/admin ou criação de conta na nuvem.
- Previews dinâmicos de cores, nome da marca e favicon sem precisar salvar.

### Changed
- Sidebar colapsável: botão de toggle reposicionado no topo, layout refinado, altura e ícones padronizados, animação de colapso ajustando conteúdo (margin-left dinâmica).
- Unificação e simplificação dos estilos dos ícones e estados hover/active para consistência visual.
- Organização de scripts de publicação (sem alterações funcionais, apenas uso).

### Fixed
- Percepção de tamanhos diferentes nos botões da sidebar (padronização de box model e sombras).
- Espaço vazio persistente após colapsar a barra lateral.

### Internal / Tech
- Ajustes em listeners e pré-carregamento para garantir criação de usuário seed admin.
- Melhoria do fluxo de criação de conta (modal de nuvem forçado em modo signup a partir do gate quando acionado).

### Pending / Next (não incluído nesta release)
- Forçar troca de senha do admin no primeiro login.
- Extração de paleta automática a partir da logo.
- Modo de auto-expandir sidebar ao hover.

## 0.1.5
- Versão anterior (baseline) com autenticação híbrida, abas reorganizadas e início do recurso de colapso da sidebar.
