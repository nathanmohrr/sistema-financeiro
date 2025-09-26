<#
create-gh-secret.ps1

Adiciona o secret GH_TOKEN no repositório usando GitHub CLI (gh).
Requisitos: gh CLI instalado e autenticado (gh auth login)
Uso:
  .\scripts\create-gh-secret.ps1 -Token 'SEU_TOKEN'
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory=$false)] [string]$Token,
  [Parameter(Mandatory=$false)] [string]$Repo = 'nathanmohrr/sistema-financeiro'
)

function Abort($msg){ Write-Error $msg; exit 1 }

# Verifica gh
try{ gh --version | Out-Null } catch { Abort 'GH CLI não encontrado. Instale em https://cli.github.com/ e execute gh auth login.' }

if(-not $Token){
  $Token = Read-Host 'Cole o token (PAT) para GH_TOKEN'
  if([string]::IsNullOrWhiteSpace($Token)){ Abort 'Nenhum token informado.' }
}

Write-Host "Criando secret GH_TOKEN para o repositório $Repo..."
$proc = Start-Process -FilePath 'gh' -ArgumentList @('secret','set','GH_TOKEN','--body',$Token,'--repo',$Repo) -NoNewWindow -Wait -PassThru
if($proc.ExitCode -ne 0){ Abort 'Falha ao criar secret via gh CLI.' }
Write-Host 'Secret criado com sucesso.' -ForegroundColor Green
