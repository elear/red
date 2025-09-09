FROM node:24
LABEL maintainer="IETF Tools Team <tools-discuss@ietf.org>"

RUN mkdir -p /app
WORKDIR /app

COPY rfc-html-extractor/ .

RUN npm ci
