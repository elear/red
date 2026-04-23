import https from 'https'
import { usePublicSiteUrlOrigin } from '~/utilities/url'

/**
 * Health check
 */
export default defineEventHandler(async (event) => {
  const publicSiteUrlOrigin = usePublicSiteUrlOrigin()

  const pathsToCheck = [
    '/',
    '/api/v1/homepage-latest.json',
    '/robots.txt',
    '/sitemap.xml',
    '/rfcrss.xml',
    '/api/v1/info-subseries/bcp4.json', // just a randomly chosen subseries
    '/api/v1/rfc-html/8.json', // randomly chosen RFC PDF
    '/api/v1/rfc-html/8-page-1.png', // randomly RFC PDF page
    '/api/v1/rfc-html/7876.json', // randomly chosen RFC with HTML contents
    '/about/rfc-editor/' // randomly chosen markdown page
  ]

  const oks = await Promise.all(pathsToCheck.map(pathToCheck => httpOk(
    new URL(pathToCheck, publicSiteUrlOrigin).toString()
  )))

  const allOk = oks.every(ok => ok)

  const failedPaths = oks.map((ok, index) => {
    if (!ok) {
      return pathsToCheck[index]
    }
    return undefined
  }).filter(Boolean).join(', ')

  setResponseStatus(event, allOk ? 200 : 500)

  return {
    ok: allOk,
    message: allOk ? undefined : `Health check failed on ${publicSiteUrlOrigin}: ${failedPaths}`,
  }
})

const httpOk = (url: string) => {
  return new Promise<boolean>((resolve, reject) => {
    https
      .request(url, { method: 'HEAD' }, (res) => {
        const { statusCode } = res
        if (statusCode === undefined) {
          reject()
          return
        }
        resolve(
          // using fetch response 'ok' definition of ok
          // https://developer.mozilla.org/en-US/docs/Web/API/Response/ok
          statusCode >= 200 && statusCode <= 299
        )
      }).on('error', (err) => reject())
      .end();
  })
}
