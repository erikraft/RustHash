#!/bin/sh
set -e

# RustHash CLI installer for Linux and macOS

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "${BLUE}==================================================${NC}"
echo "${BLUE}             Instalador RustHash CLI              ${NC}"
echo "${BLUE}==================================================${NC}"

# 1. Detect OS
OS="$(uname -s)"
case "$OS" in
    Linux)
        OS_NAME="linux"
        ;;
    Darwin)
        OS_NAME="macos"
        ;;
    *)
        echo "${RED}Erro: Sistema operacional '$OS' não suportado.${NC}"
        exit 1
        ;;
esac

# 2. Detect Architecture
ARCH="$(uname -m)"
case "$ARCH" in
    x86_64|amd64)
        ARCH_NAME="x86_64"
        ;;
    arm64|aarch64)
        ARCH_NAME="aarch64"
        ;;
    *)
        echo "${RED}Erro: Arquitetura '$ARCH' não suportada.${NC}"
        exit 1
        ;;
esac

# 3. Map to Target Triple
if [ "$OS_NAME" = "linux" ]; then
    if [ "$ARCH_NAME" = "x86_64" ]; then
        TARGET="x86_64-unknown-linux-gnu"
    else
        TARGET="aarch64-unknown-linux-gnu"
    fi
elif [ "$OS_NAME" = "macos" ]; then
    if [ "$ARCH_NAME" = "x86_64" ]; then
        TARGET="x86_64-apple-darwin"
    else
        TARGET="aarch64-apple-darwin"
    fi
fi

echo "Plataforma detectada: $OS_NAME ($ARCH_NAME) -> Target: $TARGET"

# 4. Determine Version
VERSION="v0.1.0"
echo "Obtendo a versão mais recente do RustHash..."
LATEST_RELEASE_URL="https://api.github.com/repos/erikraft/RustHash/releases/latest"

if command -v curl >/dev/null 2>&1; then
    VERSION_FETCHED=$(curl -fsSL "$LATEST_RELEASE_URL" | grep '"tag_name":' | sed -E 's/.*"tag_name": "([^"]+)".*/\1/' || true)
    if [ -n "$VERSION_FETCHED" ]; then
        VERSION="$VERSION_FETCHED"
    fi
elif command -v wget >/dev/null 2>&1; then
    VERSION_FETCHED=$(wget -qO- "$LATEST_RELEASE_URL" | grep '"tag_name":' | sed -E 's/.*"tag_name": "([^"]+)".*/\1/' || true)
    if [ -n "$VERSION_FETCHED" ]; then
        VERSION="$VERSION_FETCHED"
    fi
fi

echo "Versão selecionada: $VERSION"

# 5. Define Directories and Files
INSTALL_DIR="$HOME/.local/bin"
mkdir -p "$INSTALL_DIR"

TEMP_DIR=$(mktemp -d)
clean_up() {
    rm -rf "$TEMP_DIR"
}
trap clean_up EXIT

TARBALL_URL="https://github.com/erikraft/RustHash/releases/download/$VERSION/rusthash-$TARGET.tar.gz"
CHECKSUM_URL="https://github.com/erikraft/RustHash/releases/download/$VERSION/rusthash-$TARGET.tar.gz.sha256"

# 6. Download Tarball
echo "Baixando pacote do RustHash..."
if command -v curl >/dev/null 2>&1; then
    curl -fsSL -o "$TEMP_DIR/rusthash.tar.gz" "$TARBALL_URL"
    curl -fsSL -o "$TEMP_DIR/rusthash.tar.gz.sha256" "$CHECKSUM_URL" || true
elif command -v wget >/dev/null 2>&1; then
    wget -qO "$TEMP_DIR/rusthash.tar.gz" "$TARBALL_URL"
    wget -qO "$TEMP_DIR/rusthash.tar.gz.sha256" "$CHECKSUM_URL" || true
else
    echo "${RED}Erro: 'curl' ou 'wget' são necessários para instalação.${NC}"
    exit 1
fi

# 7. Verify Checksum
if [ -f "$TEMP_DIR/rusthash.tar.gz.sha256" ]; then
    echo "Verificando integridade do download..."
    EXPECTED_SHA=$(cat "$TEMP_DIR/rusthash.tar.gz.sha256" | awk '{print $1}')
    if command -v sha256sum >/dev/null 2>&1; then
        CALCULATED_SHA=$(sha256sum "$TEMP_DIR/rusthash.tar.gz" | awk '{print $1}')
    elif command -v shasum >/dev/null 2>&1; then
        CALCULATED_SHA=$(shasum -a 256 "$TEMP_DIR/rusthash.tar.gz" | awk '{print $1}')
    fi

    if [ -n "$CALCULATED_SHA" ] && [ "$CALCULATED_SHA" != "$EXPECTED_SHA" ]; then
        echo "${RED}Erro: Falha na verificação de integridade (Checksum Mismatch).${NC}"
        exit 1
    else
        echo "${GREEN}Integridade verificada com sucesso!${NC}"
    fi
fi

# 8. Extract and Install
echo "Instalando binário..."
tar -xzf "$TEMP_DIR/rusthash.tar.gz" -C "$TEMP_DIR"

# Move the executable to bin directory
if [ -f "$TEMP_DIR/rusthash" ]; then
    mv "$TEMP_DIR/rusthash" "$INSTALL_DIR/rusthash"
    chmod +x "$INSTALL_DIR/rusthash"
elif [ -f "$TEMP_DIR/rusthash-cli" ]; then
    mv "$TEMP_DIR/rusthash-cli" "$INSTALL_DIR/rusthash"
    chmod +x "$INSTALL_DIR/rusthash"
else
    echo "${RED}Erro: Binário não encontrado no pacote extraído.${NC}"
    exit 1
fi

echo "${GREEN}RustHash CLI instalado com sucesso em $INSTALL_DIR/rusthash${NC}"

# 9. Configure PATH
SHELL_CONFIGS=""
case "$SHELL" in
    */bash)
        SHELL_CONFIGS="$HOME/.bashrc $HOME/.bash_profile"
        ;;
    */zsh)
        SHELL_CONFIGS="$HOME/.zshrc"
        ;;
    */fish)
        SHELL_CONFIGS="$HOME/.config/fish/config.fish"
        ;;
    *)
        SHELL_CONFIGS="$HOME/.profile"
        ;;
esac

PATH_ADDED=false
if ! echo "$PATH" | grep -q "$INSTALL_DIR"; then
    echo "Configurando variável PATH de forma segura..."
    for config_file in $SHELL_CONFIGS; do
        if [ -f "$config_file" ]; then
            if ! grep -q "$INSTALL_DIR" "$config_file"; then
                if echo "$config_file" | grep -q "fish"; then
                    echo "set -U fish_user_paths $INSTALL_DIR \$fish_user_paths" >> "$config_file"
                else
                    echo "" >> "$config_file"
                    echo "# RustHash CLI" >> "$config_file"
                    echo "export PATH=\"\$PATH:$INSTALL_DIR\"" >> "$config_file"
                fi
                echo "PATH configurado em: $config_file"
                PATH_ADDED=true
            fi
        fi
    done
fi

if [ "$PATH_ADDED" = "true" ]; then
    echo "${YELLOW}Por favor, reinicie seu terminal ou execute 'source <seu-shell-config>' para atualizar o PATH.${NC}"
fi

echo "${GREEN}Instalação concluída! Digite 'rusthash --version' para começar.${NC}"
