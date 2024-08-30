FROM node:20-alpine

RUN apk add -U --no-cache curl bash openssl

WORKDIR /api_rest

# Add dockerize tool
ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

COPY ./build ./build
COPY ["./package.json", "./gulpfile.js", "/.sequelizerc", "./"]

RUN npm install && npm install -g sequelize-cli

EXPOSE 80

CMD dockerize -wait tcp://mysql:3306 -timeout 400s -wait-retry-interval 10s npm run start
