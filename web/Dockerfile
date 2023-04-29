FROM node:lts-alpine

WORKDIR /src

RUN apk update \
    && apk upgrade \
    && apk add --no-cache --upgrade bash

COPY package.json .
RUN npm install
EXPOSE 3000

COPY . .
CMD ["npm", "run", "dev"]
