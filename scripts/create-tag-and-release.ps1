<#
create-tag-and-release.ps1

Cria tag local, push da tag e cria release no GitHub via gh CLI (repositório padrão: nathanmohrr/sistema-financeiro).
Requisitos: gh CLI e git configurados.
Uso:
  .\scripts\create-tag-and-release.ps1 -Version '0.1.24' -Message 'Notas da release'
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)] [string]$Version,
  [Parameter(Mandatory=$false)] [string]$Message = "Release $Version",
  [Parameter(Mandatory=$false)] [string]$Repo = 'nathanmohrr/sistema-financeiro'
)

function Abort($msg){ Write-Error $msg; exit 1 }

# Confirma branch atual
$branch = git rev-parse --abbrev-ref HEAD 2>$null
if($LASTEXITCODE -ne 0){ Abort 'Erro ao executar git. Certifique-se que git está instalado e você está no diretório do projeto.' }
Write-Host "Branch atual: $branch"

# Cria tag
$tag = "v$Version"
Write-Host "Criando tag $tag..."
git tag $tag
if($LASTEXITCODE -ne 0){ Abort 'Falha ao criar tag local. Talvez já exista.' }

Write-Host 'Enviando tag para origin...'
git push origin $tag
if($LASTEXITCODE -ne 0){ Abort 'Falha ao enviar tag para origin. Verifique permissões.' }

# Cria release via gh
Write-Host "Criando release no GitHub ($Repo)..."
$proc = Start-Process -FilePath 'gh' -ArgumentList @('release','create',$tag,'--title',$tag,'--notes',$Message,'--repo',$Repo) -NoNewWindow -Wait -PassThru
if($proc.ExitCode -ne 0){ Abort 'Falha ao criar release via gh CLI.' }
Write-Host 'Release criada com sucesso.' -ForegroundColor Green
