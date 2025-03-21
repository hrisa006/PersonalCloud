FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY .. .

EXPOSE 8081

CMD ["npx", "ts-node-dev", "--respawn", "--transpile-only", "src/server/server.ts"]