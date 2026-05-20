FROM oven/bun:1 AS base
WORKDIR /app

# Instala dependências
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copia o restante do código
COPY . .

EXPOSE 3333

CMD ["bun", "run", "src/index.ts"]