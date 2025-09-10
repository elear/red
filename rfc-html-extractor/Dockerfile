FROM node:24
LABEL maintainer="IETF Tools Team <tools-discuss@ietf.org>"

RUN mkdir -p /app/rfc-html-extractor
RUN mkdir -p /app/client/app/utilities

WORKDIR /app

COPY client/app/utilities/rfc-validators.ts /app/client/app/utilities/rfc-validators.ts

COPY rfc-html-extractor/ /app/rfc-html-extractor

WORKDIR /app/rfc-html-extrractor

RUN npm ci
