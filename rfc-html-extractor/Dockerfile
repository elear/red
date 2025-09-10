FROM node:24
LABEL maintainer="IETF Tools Team <tools-discuss@ietf.org>"

RUN mkdir -p /app
WORKDIR /app

COPY rfc-html-extractor/ .

RUN mkdir -p /client/app/utilities/
COPY client/app/utilities/rfc-validators.ts client/app/utilities/rfc-validators.ts

RUN npm ci
