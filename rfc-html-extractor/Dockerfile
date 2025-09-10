FROM node:24
LABEL maintainer="IETF Tools Team <tools-discuss@ietf.org>"

RUN mkdir -p /app
RUN mkdir -p /client/app/utilities/

COPY client/app/utilities/rfc-validators.ts client/app/utilities/rfc-validators.ts

WORKDIR /app

COPY rfc-html-extractor/ .

RUN npm ci
