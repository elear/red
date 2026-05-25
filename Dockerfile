FROM node:24
LABEL maintainer="IETF Tools Team <tools-discuss@ietf.org>"

RUN mkdir -p /app && \
    chown node:node /app
WORKDIR /app

COPY website/.output ./

USER node:node
CMD ["node", "server/index.mjs"]