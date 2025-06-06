FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY .. .

EXPOSE 8081

CMD ["sh", "-c", "npx prisma migrate dev --name init && npx ts-node-dev --respawn --transpile-only src/server/server.ts"]