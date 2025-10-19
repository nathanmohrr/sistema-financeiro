<#
PowerShell helper script para automatizar a publicação da release 0.1.29.
Uso:
  - Defina a variável de ambiente GH_TOKEN (recomendado) ou insira quando solicitado.
  - Execute este script no diretório do projeto: `powershell -ExecutionPolicy Bypass -File .\scripts\release-0.1.29.ps1`

O script fará:
  - Mostrar `git status` e pedir confirmação.
  - Commitar arquivos relevantes (package.json, CHANGELOG.md, RELEASE-0.1.29.md, index.html) se houver mudanças.
  - Criar tag anotada v0.1.29 (se ainda não existir).
  - Push do branch `main` e da tag `v0.1.29` para `origin`.
  - Rodar `npm run release:all` (este passo exige `$env:GH_TOKEN` definido).

Aviso: não exponha seu GH_TOKEN em logs ou no terminal. Prefira exportar a variável de ambiente antes de rodar.
#>

Write-Host "=== Release helper: 0.1.29 ===" -ForegroundColor Cyan

# Mostra status do git
git status --porcelain
Write-Host "\nEsses são os arquivos que serão considerados. Se estiver correto, pressione Enter para continuar, ou Ctrl+C para cancelar." -ForegroundColor Yellow
Read-Host

$files = @("package.json","CHANGELOG.md","RELEASE-0.1.29.md","index.html")

# Adiciona e commita
try{
    git add $files
    $msg = "chore(release): 0.1.29 — fix(modals): move modals to body and protect handlers"
    git commit -m $msg -q
    Write-Host "Commit criado localmente." -ForegroundColor Green
}catch{
    Write-Host "Nenhum commit criado (possivelmente sem alterações a commitar)." -ForegroundColor Yellow
}

# Cria tag local (se não existir)
$tag = 'v0.1.29'
$tagExists = git tag --list $tag
if(-not $tagExists){
    git tag -a $tag -m "Release $tag — corrige modais que abriam atrás do backdrop"
    Write-Host "Tag $tag criada localmente." -ForegroundColor Green
} else {
    Write-Host "Tag $tag já existe localmente." -ForegroundColor Yellow
}

Write-Host "\nAgora vamos subir o branch e a tag para o origin. Se você prefere revisar antes, saia agora (Ctrl+C)." -ForegroundColor Cyan
Read-Host "Pressione Enter para continuar"

# Push do branch e da tag
try{
    git push origin main
    Write-Host "Branch 'main' enviado para origin." -ForegroundColor Green
}catch{
    Write-Host "Falha ao enviar branch 'main' para origin. Verifique suas credenciais/remote." -ForegroundColor Red
}
try{
    git push origin $tag
    Write-Host "Tag '$tag' enviada para origin." -ForegroundColor Green
}catch{
    Write-Host "Falha ao enviar tag '$tag' para origin. Verifique suas credenciais/remote." -ForegroundColor Red
}

# Publicação: precisa de GH_TOKEN
if(-not $env:GH_TOKEN){
    Write-Host "\nVariável de ambiente GH_TOKEN não definida. Para publicar (npm run release:all) defina e reexecute o script." -ForegroundColor Yellow
    Write-Host "Exemplo (PowerShell): $env:GH_TOKEN='SEU_TOKEN'" -ForegroundColor Gray
    exit 0
}

Write-Host "Executando build e publicação (npm run release:all). Isso pode demorar." -ForegroundColor Cyan
try{
    npm run release:all
    Write-Host "Script de publicação finalizado." -ForegroundColor Green
}catch{
    Write-Host "O comando de publicação falhou. Verifique saída acima e os logs." -ForegroundColor Red
}

Write-Host "=== Fim do helper ===" -ForegroundColor Cyan
