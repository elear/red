#!/bin/bash

# if [ -z "$GITHUB_ACTION" ]; then
#   echo "DO NOT RUN THIS SCRIPT IN DEV. THIS IS FOR DEPLOYMENT ONLY."
#   exit 1
# fi

fx wrangler.jsonc 'x => {
  for (const envr in x.env) {
    if (envr === "production") {
      x.env.production.routes = x.env.staging.routes.map(r => ({
        ...r,
        pattern: r.pattern.replace(/staging\./, "")
      }))
    } else {
      x.env[envr].routes = x.env.staging.routes.map(r => ({
        ...r,
        pattern: r.pattern.replace(/staging/, envr)
      }))
    }
  }
  return x
}' save
