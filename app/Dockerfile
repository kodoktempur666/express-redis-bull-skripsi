FROM node:24

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 3020

CMD ["node", "src/index.js"]