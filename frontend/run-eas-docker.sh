#!/bin/bash
# run-eas-docker.sh
# Script para rodar o EAS-CLI via Docker (sem instalar Node na máquina local)

echo "🐳 Subindo container Node.js (Alpine)..."
echo "📂 Montando pasta atual em /app..."

# Roda um container Node interativo
# -v "$(pwd):/app": Monta a pasta onde você está rodando o comando para dentro do container
# --net=host: Usa a rede do host (bom para evitar problemas de DNS/Conexão)
docker run --rm -it \
  -v "$(pwd):/app" \
  -w /app \
  node:22-alpine \
  /bin/sh -c "echo '📥 Instalando deps (git)...'; apk add --no-cache git; echo '📥 Instalando eas-cli...'; npm install -g eas-cli; echo '✅ EAS instalado! Para começar:'; echo '  1. eas login'; echo '  2. eas build -p android --profile preview'; echo '---------------------------------------'; /bin/sh"
