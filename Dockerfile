# syntax = docker/dockerfile:1

ARG NODE_VERSION=20.18.0

FROM node:${NODE_VERSION}-alpine as base

RUN npm install -g typescript

WORKDIR /src

# Build
FROM base as build

WORKDIR /src

COPY ./package.json ./package-lock.json ./
RUN ls -la

RUN npm install

COPY . .
RUN npm run build

# Run
FROM base

WORKDIR /src

ENV NODE_ENV=production

COPY --from=build /src/dist /src/dist
COPY --from=build /src/package.json /src/package.json
COPY --from=build /src/node_modules /src/node_modules
COPY --from=build /src/.env.prod /src/.env

CMD ["npm", "start"]
