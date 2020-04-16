FROM node:12-alpine as ts-builder
WORKDIR /app
COPY . /app
RUN npm install --ignore-scripts \
  && mkdir dist && mkdir dist/database/ \
  && npm run build


FROM node:12-alpine

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories && \
    echo "Asia/Shanghai" > /etc/timezone

WORKDIR /app

RUN apk add --no-cache --update build-base python2

# container init
RUN wget -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.1/dumb-init_1.2.1_amd64 && \
    echo "057ecd4ac1d3c3be31f82fc0848bf77b1326a975b4f8423fe31607205a0fe945  /usr/local/bin/dumb-init" | sha256sum -c - && \
    chmod 755 /usr/local/bin/dumb-init

COPY package.json /app
RUN npm install --production

COPY . /app
COPY --from=ts-builder /app/dist /app/dist

VOLUME [ "/app/data" ]

ENTRYPOINT ["/usr/local/bin/dumb-init", "--"]
CMD ["npm", "start"]
