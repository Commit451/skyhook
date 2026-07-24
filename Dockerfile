FROM node:24 AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:24-slim

WORKDIR /usr/src/app

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY public ./public
COPY examples ./examples

EXPOSE 8080
CMD ["node", "dist/index.js"]
