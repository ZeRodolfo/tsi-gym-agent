FROM electronuserland/builder:wine

# Dependências necessárias
RUN dpkg --add-architecture i386 \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
       wine64 wine32 wine32-preloader winbind \
       mono-devel ca-certificates build-essential \
       python3 git unzip wget p7zip-full icnsutils graphicsmagick xz-utils fuse \
    && rm -rf /var/lib/apt/lists/*

RUN npm install --global electron-builder electron-rebuild cpx

# Configurações Wine e Node
ENV WINEARCH=win64
ENV WINEDEBUG=-all
ENV NODE_ENV=production

WORKDIR /project

# Copia arquivos de dependências primeiro para aproveitar cache
COPY package*.json ./
COPY package*.json ./server/

# Instala dependências
RUN npm ci

# Copia e instala as dependências do diretório 'server'
# O uso do && garante que o cd e o npm ci sejam executados na mesma camada
# COPY server/package*.json ./server/
RUN cd server && npm ci

# Copia o restante do código
COPY . .

# Build completo: React + server
# RUN npm run build:all

# Recompila módulos nativos para o Electron usando electron-builder
# RUN electron-builder install-app-deps

# Recompila módulos nativos para o Electron
# "postinstall": "electron-rebuild -f -w sqlite3",
# Usando npx para garantir a versão correta do electron-rebuild
# RUN npx electron-rebuild -f -w sqlite3

# Comando default para gerar .exe
CMD ["npm", "run", "electron:package:win"]

# docker build -t tsi-gym-agent-builder .
# docker run --rm -v ${PWD}/dist:/project/dist tsi-gym-agent-builder


# FROM electronuserland/builder:wine

# # Dependências necessárias
# RUN dpkg --add-architecture i386 \
#     && apt-get update \
#     && apt-get install -y --no-install-recommends \
#        wine64 wine32 wine32-preloader winbind \
#        mono-devel ca-certificates build-essential \
#        python3 git unzip wget p7zip-full icnsutils graphicsmagick xz-utils fuse \
#     && rm -rf /var/lib/apt/lists/*

# RUN npm install --global electron-builder cpx

# # Configurações Wine e Node
# ENV WINEARCH=win64
# ENV WINEDEBUG=-all
# ENV NODE_ENV=production

# WORKDIR /project

# # Copia arquivos de dependências primeiro para aproveitar cache
# COPY package*.json ./
# COPY package*.json ./server/

# # Instala dependências
# RUN npm ci

# # Copia e instala as dependências do diretório 'server'
# # O uso do && garante que o cd e o npm ci sejam executados na mesma camada
# # COPY server/package*.json ./server/
# # RUN cd server && npm ci

# # Copia o restante do código
# COPY . .

# # Build completo: React + server
# # RUN npm run build:all

# # Recompila módulos nativos para o Electron usando electron-builder
# # RUN electron-builder install-app-deps

# # Recompila módulos nativos para o Electron
# # "postinstall": "electron-rebuild -f -w sqlite3",
# # Usando npx para garantir a versão correta do electron-rebuild
# # RUN npx electron-rebuild -f -w sqlite3

# # Comando default para gerar .exe
# CMD ["npm", "run", "electron:package:win"]

# # docker build -t tsi-gym-agent-builder .
# # docker run --rm -v ${PWD}/dist:/project/dist tsi-gym-agent-builder

# # docker run --rm \
# #   -v ${PWD}:/project \
# #   -v ${PWD}/dist:/project/dist \
# #   -v ${PWD}/node_modules:/project/node_modules \
# #   -v ${PWD}/server/node_modules:/project/server/node_modules \
# #   tsi-gym-agent-builder sh -c "npm ci && cd server && npm ci && cd .. && npm run build && electron-builder install-app-deps && npm run electron:package:win"
