FROM node:20-alpine
WORKDIR /app
COPY . /app
RUN npm ci || npm i
EXPOSE 3000
