/**
 * Create a redirect response handler
 *
 * @param {string} urlPath Redirect path or full URL
 * @param {number} status Status code
 * @returns {Response} Redirect response
 */
export function redirectTo(urlPath, status = 302) {
  return (req, _env) => {
    if (urlPath.startsWith('/')) {
      const newUrl = new URL(req.url)
      newUrl.pathname = urlPath
      return Response.redirect(newUrl.href, status)
    } else {
      return Response.redirect(urlPath, status)
    }
  }
}

/**
 * Add normalizedPath property with trailing slash removed
 * @param {string} req
 */
export function addNormalizedPath(req) {
  const url = new URL(req.url)
  req.normalizedPath = decodeURIComponent(url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname)
}

/**
 * Create blob object response
 *
 * @param {*} object Blob Object
 * @param {string} [contentType] Content-Type
 * @returns {Response} Blob Response
 */
export function createBlobResponse(object, contentType) {
  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)
  headers.set('Cf-R2-Served', '1')
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Content-Encoding', 'gzip')
  if (contentType) {
    headers.set('Content-Type', contentType)
  }

  return new Response(object.body, {
    headers
  })
}

/**
 * Create blob not found response
 *
 * @returns {Response} Not Found Response
 */
export function createBlobNotFoundResponse() {
  return new Response('404 - Not found', {
    status: 404,
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }
  })
}
