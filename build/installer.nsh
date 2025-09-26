!define SF_APP_MATCH "Sistema*Financeiro*.exe"


!macro _SFKillOnce
  nsExec::ExecToStack 'taskkill /F /FI "IMAGENAME eq ${SF_APP_MATCH}"'
  Pop $0
  Pop $1
  nsExec::ExecToStack 'taskkill /F /IM "Sistema Financeiro.exe"'
  Pop $0
  Pop $1
  nsExec::ExecToStack 'taskkill /F /IM "Sistema Financeiro Helper.exe"'
  Pop $0
  Pop $1
!macroend

!macro SFEnsureKilled
  ; Executa até 3 tentativas sequenciais sem usar labels para evitar conflitos de expansão
  !insertmacro _SFKillOnce
  Sleep 350
  !insertmacro _SFKillOnce
  Sleep 350
  !insertmacro _SFKillOnce
!macroend

!macro customInstall
  !insertmacro SFEnsureKilled
!macroend

!macro customUnInit
  !insertmacro SFEnsureKilled
!macroend

; ---- Branding / UI ----
; electron-builder está configurado com oneClick=true. Nesse modo NÃO devemos inserir páginas MUI.
; O erro "macro named MUI_PAGE_WELCOME not found" ocorria porque não havia include da MUI e
; também porque as páginas não são suportadas em oneClick. Vamos apenas incluir idioma.

!ifdef MUI_PAGE_WELCOME
  ; (proteção caso futuro mude para oneClick=false e mantenha este arquivo)
!endif

