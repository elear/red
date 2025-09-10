FROM node:24
LABEL maintainer="IETF Tools Team <tools-discuss@ietf.org>"

RUN mkdir -p /app/rfc-html-extractor

WORKDIR /app

COPY rfc-html-extractor/ ./rfc-html-extractor/

RUN mkdir -p ./client/app/utilities/

COPY client/app/utilities/rfc-validators.ts ./client/app/utilities/rfc-validators.ts

WORKDIR /app/rfc-html-extrractor

RUN npm ci
