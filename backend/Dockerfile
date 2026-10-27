
FROM node:20-alpine

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install --omit=dev

COPY backend/ ./
COPY database/schema-safe.sql /app/database/schema-safe.sql

EXPOSE 5000

CMD ["node", "src/server.js"]
