<#
release-local.ps1

Roda build local do Windows (electron-builder) e publica usando scripts/publish-release.js.
Uso:
  # 1) exportar token temporariamente (recomendado):
  $env:GH_TOKEN = 'SEU_TOKEN'
  .\scripts\release-local.ps1

  # Ou passar token como parâmetro (menos seguro no histórico):
  .\scripts\release-local.ps1 -Token 'SEU_TOKEN'
#>
[CmdletBinding()]
param(
  [string]$Token
)

function Abort($msg){ Write-Error $msg; exit 1 }

# Determina token
if(-not $env:GH_TOKEN){
  if($Token){ $env:GH_TOKEN = $Token }
  else{
    Write-Host "GH_TOKEN não encontrado nas variáveis de ambiente." -ForegroundColor Yellow
    $input = Read-Host "Cole o GH_TOKEN aqui (ou pressione Enter para cancelar)"
    if([string]::IsNullOrWhiteSpace($input)){ Abort 'Operação cancelada. Defina GH_TOKEN antes de rodar.' }
    $env:GH_TOKEN = $input
  }
}

Write-Host "Usando GH_TOKEN com comprimento:" ($env:GH_TOKEN.Length) -ForegroundColor Green

# Garantir que node/npm existem
try{ node -v | Out-Null } catch { Abort 'Node.js não encontrado no PATH. Instale Node LTS antes.' }

# Instala dependências
Write-Host "Instalando dependências (npm ci)..." -ForegroundColor Cyan
$rc = & npm ci
if($LASTEXITCODE -ne 0){ Abort 'npm ci falhou.' }

# Build
Write-Host "Rodando electron-builder --win (pode demorar)..." -ForegroundColor Cyan
$rc = & npx electron-builder --win
if($LASTEXITCODE -ne 0){ Abort 'electron-builder falhou. Verifique logs.' }

# Publish via script existente
Write-Host "Build concluído. Iniciando publish via scripts/publish-release.js" -ForegroundColor Cyan
$rc = & node scripts/publish-release.js
if($LASTEXITCODE -ne 0){ Abort 'publish-release.js falhou. Verifique logs.' }

Write-Host "Publicação concluída com sucesso." -ForegroundColor Green
