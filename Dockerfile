FROM electronuserland/builder:wine

# Instala Wine, Mono e libs necessárias para cross-build do Windows
RUN dpkg --add-architecture i386 \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
       wine64 \
       wine32 \
       wine32-preloader \
       winbind \
       mono-devel \
       ca-certificates \
       build-essential \
       python3 \
       git \
       unzip \
       wget \
       p7zip-full \
       icnsutils \
       graphicsmagick \
       xz-utils \
       fuse \
    && rm -rf /var/lib/apt/lists/*

# Garante que Wine está disponível
ENV WINEARCH=win64
ENV WINEDEBUG=-all

WORKDIR /project

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm install -g electron-builder

# Build do React
RUN npm run build:react
# RUN npm run build:app

# Copia servidor local Express
RUN mkdir -p build/server \
    && cp -r public/server build/server

# Comando final: gera instalador Windows
CMD ["npm", "run", "electron:package:win"]


# # Baseado em Node LTS
# FROM node:20-bullseye

# # Instala Wine, Mono e dependências de compilação
# RUN dpkg --add-architecture i386 \
#     && apt-get update \
#     && apt-get install -y --no-install-recommends \
#        wine64 wine32 \
#        mono-devel \
#        ca-certificates \
#        build-essential \
#        python3 \
#        git \
#        unzip \
#        wget \
#     && rm -rf /var/lib/apt/lists/*

# # Instala Yarn globalmente
# RUN corepack enable && corepack prepare yarn@stable --activate

# # Cria diretório da aplicação
# WORKDIR /project

# # Copia package.json e yarn.lock primeiro para cache
# COPY package.json yarn.lock ./

# # Instala dependências (sem rebuild nativo ainda)
# RUN yarn install --frozen-lockfile

# # Copia o resto do código
# COPY . .

# # Instala electron-builder global (para garantir que está no PATH)
# RUN yarn global add electron-builder

# # Comando padrão (pode ser sobrescrito no docker run)
# CMD ["yarn", "electron:package:win"]
