/**
 * Create a redirect response handler
 *
 * @param {string} targetUrl Redirect path or full URL
 * @param {number} status Status code
 * @returns {Response} Redirect response
 */
export function redirectTo(targetUrl, status = 302) {
  return (req, _env) => {
    if (
      // is it a relative url
      targetUrl.startsWith('/')
    ) {      
      const newUrl = new URL(targetUrl, req.url)
      return Response.redirect(newUrl.href, status)
    } else {
      return Response.redirect(targetUrl, status)
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
export function createBlobResponse(object, contentType, canonicalUrl) {
  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)
  headers.set('Cf-R2-Served', '1')
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Content-Encoding', 'gzip')
  if (contentType) {
    headers.set('Content-Type', contentType)
  }
  if (canonicalUrl) {
    const formattedCanonicalUrl = formatCanonicalHeader(canonicalUrl)
    if (formattedCanonicalUrl) {
      headers.set('Link', formattedCanonicalUrl)
    }
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

export function detectContentType(path) {
  if (!path.includes('.')) {
    return
  }

  const extension = path.substring(path.lastIndexOf('.'))
  switch (extension) {
    case '.json':
      return 'application/json;charset=utf-8'
    case '.ico':
      return 'image/png'
    case '.txt':
      return 'text/plain;charset=utf-8'
    case '.png':
      return 'image/png'
    case '.css':
      return 'text/css; charset=utf-8'
    case '.js':
      // should this be limited to specific trusted paths in buckets?
      // if we host JS that was exploited (eg buckets have build artifacts, dependencies,
      // out of our control) that would gain access to the cookies etc of that domain (origin).
      return 'text/javascript; charset=utf-8'
    case '.xml':
      if (path.endsWith('rfcatom.xml')) {
        // Atom has a specific mime type
        return 'application/atom+xml;charset=utf-8'
      } else {
        // Note that RSS doesn't have a mime type from IANA (but Atom does!)
        // see https://www.iana.org/assignments/media-types/media-types.xhtml
        //
        // per RFC 7303 don't use `text/xml` and instead use `application/xml`.
        return 'application/xml;charset=utf-8'
      }
  }
}

function formatCanonicalHeader(url) {
  try {
      const sanitisedUrl = new URL(url).toString() // can throw on invalid urls, which is preferable over adding an http header that might exploit some syntax quirk
      // canonical header is surrounded by '<' and '>' chars, so special characters must be escaped.
      // encodeURI handles spaces, special characters, but not / : ? = &, so protocol prefix is left
      // untouched
      const encodedUrl = encodeURI(url)
        .replace(/</g, '%3C') // manually replace < and > just in case they are in the URL string
        .replace(/>/g, '%3E')

      return `<${encodedUrl}>; rel="canonical"`;
  } catch (e) {
    return undefined
  }
}