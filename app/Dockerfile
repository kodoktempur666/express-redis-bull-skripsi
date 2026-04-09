FROM node:24

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 3020

CMD ["sh", "-c", "node src/index.js & node src/worker/checkout.worker.js"]