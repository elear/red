<div align="center">
  
<img src="https://raw.githubusercontent.com/ietf-tools/common/main/assets/logos/rfced-www.svg" alt="RFC" height="125" />

[![Release](https://img.shields.io/github/release/ietf-tools/rfced-www.svg?style=flat&maxAge=300)](https://github.com/ietf-tools/rfced-www/releases)
[![License](https://img.shields.io/github/license/ietf-tools/rfced-www)](https://github.com/ietf-tools/rfced-www/blob/main/LICENSE)
![Node Version](https://img.shields.io/badge/node.js-20-green?logo=node.js&logoColor=white)
![Nuxt Version](https://img.shields.io/badge/nuxt-4-green?logo=nuxt.js&logoColor=white)
![Vue Version](https://img.shields.io/badge/vue-3-green?logo=vue.js&logoColor=white)

##### Website for the RFC Editor

</div>

# Design

- The [new www.rfc-editor.org design on Figma](https://www.figma.com/design/bCDqtdSnErGOe6Oc87W8pR/RFC-Editor---Design-2). As development continues this is the graphic design that we will be adhering to where possible.

# Contributing

This code repository is under the broader guidance from [IETF CONTRIBUTING.md](https://github.com/ietf-tools/.github/blob/main/CONTRIBUTING.md).

# Development

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install) _(Windows only)_

## Getting Started

### Website

See `/website/`.

It's a Nuxt website ([official Nuxt documentation](https://nuxt.com/docs/getting-started/introduction)).

#### Website content (markdown)

Website content at paths `/about/*`, `/authors/*` and `/series/*` is managed in markdown files.

These markdown files are in `website/content`.

Markdown Frontmatter (metadata) fields supported are listed in [content.config.js](https://github.com/ietf-tools/red/blob/main/website/content.config.ts#L8).

#### Website testing

In `/website/` run `npm run test`

#### Website APIs

The website depends on APIs in the form of:
* Search (via Typesense, managed outside of this repository)
* Precomputed API responses (managed in this repository, in `/precomputer/`)

### Precomputed API responses

See `/precomputer/`.

We precompute the result of many APIs used by the website and upload them to an S3-like bucket.

This is done for performance reasons (some these APIs can take minutes to compute) and it improves resilience.

The `/precomputer/` code is intentionally separate from the website/Nuxt. It has its own `package.json` etc.

The entry point for the precomputer is `precomputer/src` with the 3 items `single.ts`, `all.ts`, and `cron.ts`:

* `single.ts` calculates a single RFC 'info' page API data and RFC-specific APIs such as `/rfc/rfcN.json`. The `all.ts` does the same with batches of specific ranges of RFCs. Currently these scripts are run manually from _Tekton_;
* `cron.ts` handles everything else (all subseries, RFC indexes that list all RFCs, RSS/Atom feeds, website homepage latest 3 RFCs, etc.). As the name `cron.ts` implies this script is run periodically (every 6 hours), however you can also run it manually from _Rancher_.

#### Precomputer tests

In `/precomputer/` run `npm run test`.

## Troubleshooting

### During local dev website doesn't update with changes

Stop the dev server, run `npm run cleanup`, and restart the dev server.
