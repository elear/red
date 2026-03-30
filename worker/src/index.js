import { IttyRouter } from 'itty-router'
import * as oidc from './oidc'
import { blobs } from './blobs'

const router = IttyRouter()

router
  .get('/oidc', oidc.login)
  .get('/oidc/callback', oidc.callback)
  .get('*', blobs)

export default {
  ...router
}