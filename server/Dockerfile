FROM node:20-alpine

WORKDIR /app

# Endi to'g'ridan-to'g'ri ko'chiramiz
COPY package*.json ./

RUN npm install --only=production

COPY . .

EXPOSE 8080
ENV PORT=8080

CMD ["node", "server.js"]