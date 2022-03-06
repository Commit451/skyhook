FROM node:16 as buildenv

WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM node:16

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
COPY package.json /usr/src/app/
COPY package-lock.json /usr/src/app/
RUN npm install && npm cache clean --force
COPY . /usr/src/app

RUN mkdir dist
COPY --from=buildenv /app/dist /usr/src/app/dist

EXPOSE 3991

CMD [ "npm", "run", "dockerstart" ]
