# FROM electronuserland/builder:wine

# # Dependências necessárias
# RUN dpkg --add-architecture i386 \
#     && apt-get update \
#     && apt-get install -y --no-install-recommends \
#        wine64 wine32 wine32-preloader winbind \
#        mono-devel ca-certificates build-essential \
#        python3 git unzip wget p7zip-full icnsutils graphicsmagick xz-utils fuse \
#     && rm -rf /var/lib/apt/lists/*

# RUN npm install --global electron-builder electron-rebuild cpx

# # Configurações Wine e Node
# ENV WINEARCH=win64
# ENV WINEDEBUG=-all
# ENV NODE_ENV=production

# # 🔹 Forçar local de cache do electron-builder (vamos montar volume depois)
# ENV ELECTRON_BUILDER_CACHE=/project/.cache/electron-builder
# # ENV ELECTRON_BUILDER_CACHE=/root/.cache/electron-builder
# # "cache": "node_modules/.cache/electron-builder"


# WORKDIR /project

# # Cria e entra no diretório 'build'
# RUN mkdir build
# WORKDIR /project/build

# # Copia os arquivos package*.json para a pasta 'build'
# COPY package*.json ./

# # Instala as dependências na pasta 'build'
# RUN npm ci

# # Copia o restante do código para o diretório de trabalho do estágio
# WORKDIR /project

# # Copia os arquivos package*.json para a pasta 'build'
# COPY package*.json ./

# # Instala as dependências na pasta 'build'
# RUN npm ci

# COPY . .

# # Build completo
# # RUN npm run build:all
# # RUN electron-builder install-app-deps

# # 3. Recompila as dependências nativas (incluindo a sqlite3) para o Electron
# # Isso garante que o binário node_sqlite3.node seja compilado corretamente para a plataforma de destino (Windows, via Wine)
# # RUN npm rebuild --runtime=electron --target=$(node -p "require('./package.json').devDependencies['electron']") --dist-url=https://atom.io/download/electron

# # 4. Instala as dependências do aplicativo, se houver, e do electron-builder
# RUN electron-builder install-app-deps

# # Comando padrão: gerar .exe
# CMD ["npm", "run", "electron:package:win"]


FROM electronuserland/builder:wine

RUN dpkg --add-architecture i386 \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
       wine64 wine32 wine32-preloader winbind \
       mono-devel ca-certificates build-essential \
       python3 python3-pip python3-distutils g++ make \
       libudev-dev git unzip wget p7zip-full icnsutils graphicsmagick xz-utils fuse \
    && rm -rf /var/lib/apt/lists/*

RUN npm install --global electron-builder electron-rebuild cpx

ENV WINEARCH=win64
ENV WINEDEBUG=-all
ENV NODE_ENV=production
ENV PYTHON=/usr/bin/python3
ENV npm_config_python=/usr/bin/python3
ENV npm_config_build_from_source=false
ENV ELECTRON_BUILDER_CACHE=/project/.cache/electron-builder

WORKDIR /project

COPY package*.json ./
RUN npm ci

COPY . .

# Primeiro builda React e backend
RUN npm run build:react && npm run build:server

# Instala dependências nativas do Electron
RUN electron-builder install-app-deps

# Gera o .exe (Windows)
CMD ["npm", "run", "electron:package:win"]


# docker build -t tsi-gym-agent-builder .
# docker run --rm -v ${PWD}/dist:/project/dist tsi-gym-agent-builder
# docker run --rm \
#   -v $PWD/dist:/project/dist \
#   -v $PWD/.cache/electron-builder:/project/node_modules/.cache/electron-builder \
#   tsi-gym-agent-builder

#   -v $HOME/.cache/electron-builder:/root/.cache/electron-builder \
