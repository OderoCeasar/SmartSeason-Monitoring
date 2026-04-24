FROM node:20-alpine

WORKDIR /app

RUN corepack enable

COPY package.json ./

RUN pnpm install --no-frozen-lockfile

COPY . .

EXPOSE 5000

CMD ["pnpm", "start"]
