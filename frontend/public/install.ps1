# RustHash CLI Installer for Windows (PowerShell)

$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Blue
Write-Host "             Instalador RustHash CLI              " -ForegroundColor Blue
Write-Host "==================================================" -ForegroundColor Blue

# 1. Detect Architecture
$Arch = $env:PROCESSOR_ARCHITECTURE
if ($Arch -eq "AMD64") {
    $Target = "x86_64-pc-windows-msvc"
} elseif ($Arch -eq "ARM64") {
    $Target = "x86_64-pc-windows-msvc" # Emulation fallback or native
} else {
    Write-Host "Erro: Arquitetura '$Arch' não suportada." -ForegroundColor Red
    Exit 1
}

Write-Host "Arquitetura detectada: $Arch -> Target: $Target"

# 2. Determine Version
$Version = "v0.1.0"
Write-Host "Obtendo a versão mais recente do RustHash..."
$LatestReleaseUrl = "https://api.github.com/repos/erikraft/RustHash/releases/latest"

try {
    # Set TLS 1.2
    [Net::ServicePointManager]::SecurityProtocol = [Net::SecurityProtocolType]::Tls12
    $GithubResponse = Invoke-RestMethod -Uri $LatestReleaseUrl -UseBasicParsing -TimeoutSec 5
    if ($GithubResponse -and $GithubResponse.tag_name) {
        $Version = $GithubResponse.tag_name
    }
} catch {
    Write-Host "Aviso: Não foi possível obter a versão mais recente via API. Usando fallback: $Version" -ForegroundColor Yellow
}

Write-Host "Versão selecionada: $Version"

# 3. Define Directories and Files
$InstallDir = Join-Path $Home "AppData\Local\rusthash\bin"
if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
}

$TempDir = Join-Path [System.IO.Path]::GetTempPath() ([System.IO.Path]::GetRandomFileName())
New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

$ZipUrl = "https://github.com/erikraft/RustHash/releases/download/$Version/rusthash-$Target.zip"
$ChecksumUrl = "https://github.com/erikraft/RustHash/releases/download/$Version/rusthash-$Target.zip.sha256"

$ZipPath = Join-Path $TempDir "rusthash.zip"
$ChecksumPath = Join-Path $TempDir "rusthash.zip.sha256"
$BinaryDest = Join-Path $InstallDir "rusthash.exe"

# 4. Download Zip
Write-Host "Baixando pacote do RustHash..."
try {
    Invoke-WebRequest -Uri $ZipUrl -OutFile $ZipPath -UseBasicParsing
    try {
        Invoke-WebRequest -Uri $ChecksumUrl -OutFile $ChecksumPath -UseBasicParsing
    } catch {
        # Checksum might not be published yet, ignore
    }
} catch {
    Write-Host "Erro: Falha no download do pacote." -ForegroundColor Red
    Remove-Item $TempDir -Recurse -Force -ErrorAction SilentlyContinue
    Exit 1
}

# 5. Verify Checksum
if (Test-Path $ChecksumPath) {
    Write-Host "Verificando integridade do download..."
    $ExpectedHash = (Get-Content $ChecksumPath).Split(" ")[0].Trim().ToLower()
    $CalculatedHash = (Get-FileHash -Path $ZipPath -Algorithm SHA256).Hash.ToLower()

    if ($CalculatedHash -ne $ExpectedHash) {
        Write-Host "Erro: Falha na verificação de integridade (Checksum Mismatch)." -ForegroundColor Red
        Remove-Item $TempDir -Recurse -Force -ErrorAction SilentlyContinue
        Exit 1
    } else {
        Write-Host "Integridade verificada com sucesso!" -ForegroundColor Green
    }
}

# 6. Extract and Install
Write-Host "Instalando binário..."
try {
    Expand-Archive -Path $ZipPath -DestinationPath $TempDir -Force

    $ExtractedExe = Join-Path $TempDir "rusthash.exe"
    if (-not (Test-Path $ExtractedExe)) {
        $ExtractedExe = Join-Path $TempDir "rusthash-cli.exe"
    }

    if (Test-Path $ExtractedExe) {
        # If binary already exists in destination, remove it first
        if (Test-Path $BinaryDest) {
            Remove-Item $BinaryDest -Force
        }
        Move-Item -Path $ExtractedExe -Destination $BinaryDest -Force
    } else {
        Write-Host "Erro: Executável 'rusthash.exe' não encontrado no pacote extraído." -ForegroundColor Red
        Remove-Item $TempDir -Recurse -Force -ErrorAction SilentlyContinue
        Exit 1
    }
} catch {
    Write-Host "Erro na extração ou instalação do binário: $_" -ForegroundColor Red
    Remove-Item $TempDir -Recurse -Force -ErrorAction SilentlyContinue
    Exit 1
}

# Clean up temp files
Remove-Item $TempDir -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "RustHash CLI instalado com sucesso em: $BinaryDest" -ForegroundColor Green

# 7. Configure PATH
Write-Host "Configurando variável PATH do usuário..."
try {
    $UserPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($UserPath -notlike "*$InstallDir*") {
        $NewUserPath = "$UserPath;$InstallDir"
        # Clean up double semicolons if any
        $NewUserPath = $NewUserPath -replace ";+", ";"
        [Environment]::SetEnvironmentVariable("Path", $NewUserPath, "User")
        Write-Host "Diretório adicionado ao PATH do Usuário." -ForegroundColor Yellow
        Write-Host "Por favor, reinicie seu terminal PowerShell para aplicar as mudanças do PATH." -ForegroundColor Yellow
    } else {
        Write-Host "O diretório já está configurado no PATH." -ForegroundColor Green
    }
} catch {
    Write-Host "Não foi possível atualizar o PATH automaticamente. Adicione manualmente: $InstallDir" -ForegroundColor Yellow
}

Write-Host "Instalação concluída! Digite 'rusthash --version' para começar." -ForegroundColor Green
