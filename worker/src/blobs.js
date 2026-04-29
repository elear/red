import { createBlobResponse, createBlobNotFoundResponse, detectContentType } from './helpers'

/**
 * RFC blobs
 * 
 * Should handle urls like,
 * 
 *   "/rfc/rfc9000.html"
 *   "/rfc/rfc9000.pdf"
 *   "/rfc/inline-errata/rfc9000.html"
 * 
 */
export async function blobsRfc(req, env) {
  const RFC_PREFIX = '/rfc/'
  const INLINE_ERRATA_PREFIX = 'inline-errata/'

  // -> Strip /rfc/ from path
  const objectPath = req.normalizedPath.substring(RFC_PREFIX.length)

  // Make an HTTP canonical header
  // Canonical urls help search engines deduplicate search results, allowing
  // them to link a preferred version of duplicate content.
  //
  //   "A canonical URL is the preferred version of a web page that search engines
  //    recognize as the most representative among a set of duplicate or similar
  //    pages. It helps prevent duplicate content issues by indicating which URL
  //    should be indexed and ranked by search engines"
  //    -- https://developers.google.com/search/docs/crawling-indexing/canonicalization
  //
  // rfc-editor.org have a lot of duplicated content. Eg,
  //   * /info/rfcN/
  //   * /rfc/rfcN.html
  //   * /rfc/rfcN.pdf
  //   * /rfc/rfcN.txt
  //   * ...etc.
  //
  // Google say that this also applies to HTML vs PDF vs DOCX etc:
  //    "If you publish content in many file formats, such as PDF or Microsoft Word,
  //     each on their own URL, you can return a rel="canonical" HTTP header to tell
  //     Googlebot what is the canonical URL for the non-HTML files. For example, to
  //     indicate that the PDF version of the .docx version should be canonical"
  //     -- https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls#rel-canonical-header-method
  // 
  // So RFCs in HTML or PDF or TXT should have a canonical URL.
  // And the entry page for RFCs should be the /info/rfcN route which is what we'll
  // link to.
  //
  // Note that this doesn't apply to anything with `rfcN` in the URL. We don't want to
  // apply this to `/refs/refN` as that has distinct content. It's always a judgement
  // call whether the content is sufficiently similar or distinct.
  //
  const { origin } = new URL(req.url)
  let canonicalUrl = ''
  const rfcParts = objectPath.match(/(rfc(\d+))/)
  if (rfcParts && rfcParts[1]) {
    canonicalUrl = `https://${origin}/info/rfc${rfcParts[1]}/`
  }

  if (objectPath.startsWith(INLINE_ERRATA_PREFIX)) {
    if (objectPath.endsWith('.html')) {
      const object = await env.RFC_BUCKET.get(objectPath)
      if (object) {
        return createBlobResponse(object, detectContentType(objectPath))
      }
    }
  } else if (
    // -> Fetch R2 object from RFC bucket
    ['.html', '.json', '.pdf', '.txt', '.xml'].some((ft) => objectPath.endsWith(ft))
  ) {
    const fileType = objectPath.split('.').at(-1)
    const object = await env.RFC_BUCKET.get(`${fileType}/${objectPath}`)
    if (object) {
      return createBlobResponse(object, detectContentType(objectPath), canonicalUrl)
    }
  }

  return createBlobNotFoundResponse()
}

/**
 * Refs blobs
 */
export async function blobsRefs(req, env) {
  const REFS_PREFIX = '/refs/ref'

  if (req.normalizedPath.startsWith(REFS_PREFIX)) {
    // -> Strip /refs/ref from path
    const objectPath = req.normalizedPath.substring(REFS_PREFIX.length)

    // -> Fetch R2 object from RED bucket
    if (objectPath.endsWith('.txt')) {
      const object = await env.RED_BUCKET.get(`rfc-ref/${objectPath}`)
      if (object) {
        return createBlobResponse(object, detectContentType(objectPath))
      }
    }

    return createBlobNotFoundResponse()
  }
}

/**
 * API RFC HTML blobs
 */
export async function blobsApiRfcHtml(req, env) {
  const RFC_HTML_PREFIX = '/api/v1/rfc-html/'

  // -> Strip /api/v1/rfc-html/ from path
  const objectPath = req.normalizedPath.substring(RFC_HTML_PREFIX.length)

  // -> Fetch R2 object
  if (objectPath.endsWith('.json') || objectPath.endsWith('.png')) {
    const object = await env.RED_BUCKET.get(`rfc/${objectPath}`)
    if (object) {
      return createBlobResponse(object, detectContentType(objectPath))
    }
  }

  return createBlobNotFoundResponse()
}

/**
 * API RFC Common blobs
 */
export async function blobsApiRfcCommon(req, env) {
  const RFC_COMMON_PREFIX = '/api/v1/rfc-common/'

  // -> Strip /api/v1/rfc-common/ from path
  const objectPath = req.normalizedPath.substring(RFC_COMMON_PREFIX.length)

  // -> Fetch R2 object
  if (objectPath.endsWith('.json')) {
    const object = await env.RED_BUCKET.get(`rfc-common/${objectPath}`)
    if (object) {
      return createBlobResponse(object, detectContentType(objectPath))
    }
  }

  return createBlobNotFoundResponse()
}

/**
 * API Info Subseries blobs
 */
export async function blobsApiInfoSubseries(req, env) {
  const INFO_SUBSERIES_PREFIX = '/api/v1/info-subseries/'

  // -> Strip /api/v1/info-subseries/ from path
  const objectPath = req.normalizedPath.substring(INFO_SUBSERIES_PREFIX.length)

  // -> Fetch R2 object
  if (objectPath.endsWith('.json')) {
    const object = await env.RED_BUCKET.get(`subseries/${objectPath}`)
    if (object) {
      return createBlobResponse(object, detectContentType(objectPath))
    }
  }

  return createBlobNotFoundResponse()
}

/**
 * API Meta Thumbnail blobs
 */
export async function blobsApiMetaThumbnail(req, env) {
  const META_THUMBNAIL_PREFIX = '/api/v1/meta-thumbnail/'

  // -> Strip /api/v1/meta-thumbnail/ from path
  const objectPath = req.normalizedPath.substring(META_THUMBNAIL_PREFIX.length)

  // -> Fetch R2 object
  if (objectPath.endsWith('.png')) {
    const object = await env.RED_BUCKET.get(`thumbnail/${objectPath}`)
    if (object) {
      return createBlobResponse(object, detectContentType(objectPath))
    }
  }

  return createBlobNotFoundResponse()
}

/**
 * API Favicon blobs
 */
export async function blobsApiFavicon(req, env) {
  const FAVICON_PREFIX = '/api/v1/favicon/'

  // -> Strip /api/v1/favicon/ from path
  const objectPath = req.normalizedPath.substring(FAVICON_PREFIX.length)

  // -> Fetch R2 object
  if (objectPath.endsWith('.png')) {
    const object = await env.RED_BUCKET.get(`other/favicon-${objectPath}`)
    if (object) {
      return createBlobResponse(object, detectContentType(objectPath))
    }
  }

  return createBlobNotFoundResponse()
}

/**
 * API RFC JSON blobs
 */
export async function blobsApiRfcJson(req, env) {
  const RFC_JSON_PREFIX = '/api/v1/rfc/rfc'

  if (req.normalizedPath.startsWith(RFC_JSON_PREFIX)) {
    // -> Extract RFC number from path
    const rfcNumber = req.normalizedPath.match(/^\/api\/v1\/rfc\/rfc(?<num>\d+)$/i)?.groups?.num

    // -> Fetch R2 object from RFC bucket
    if (rfcNumber) {
      const object = await env.RFC_BUCKET.get(`json/rfc${rfcNumber}.json`)
      if (object) {
        return createBlobResponse(object, detectContentType(objectPath))
      }
    }

    return createBlobNotFoundResponse()
  }
}

/**
 * Sitemap blobs
 */
export async function blobsSitemap(req, env) {
  const SITEMAP_NUMBER_PREFIX = '/sitemap-'

  if (req.normalizedPath.startsWith(SITEMAP_NUMBER_PREFIX)) {
    // -> Strip /sitemap- from path
    const objectPath = req.normalizedPath.substring(SITEMAP_NUMBER_PREFIX.length)

    // -> Fetch R2 object from RED bucket
    if (objectPath.endsWith('.xml')) {
      const bucketPath = `other/sitemap-${objectPath}`
      const object = await env.RED_BUCKET.get(bucketPath)
      if (object) {
        return createBlobResponse(object, detectContentType(objectPath))
      }
    }

    return createBlobNotFoundResponse()
  }
}

/**
 * Static mappings to blobs
 */
export async function blobsStatics(req, env) {
  const mappings = [
    {
      from: '/favicon.ico',
      to: 'other/favicon-32x32.png'
    },
    {
      from: '/api/v1/homepage-latest.json',
      to: 'other/homepage-latest.json'
    },
    {
      from: '/api/v1/rfc-mini-index.json',
      to: 'other/rfc-mini-index.json'
    },
    {
      from: '/api/v1/errata.json',
      to: 'other/errata.json'
    },
    {
      from: '/rfc-index.txt',
      to: 'other/rfc-index.txt'
    },
    {
      from: '/rfc-index.xml',
      to: 'other/rfc-index.xml'
    },
    {
      from: '/rfc-index.xsd',
      to: 'other/rfc-index.xsd'
    },
    {
      from: '/std/std-index.txt',
      to: 'other/std-index.txt'
    },
    {
      from: '/bcp/bcp-index.txt',
      to: 'other/bcp-index.txt'
    },
    {
      from: '/fyi/fyi-index.txt',
      to: 'other/fyi-index.txt'
    },
    {
      from: '/rfcrss.xml',
      to: 'other/rfcrss.xml'
    },
    {
      from: '/rfcatom.xml',
      to: 'other/rfcatom.xml'
    },
    {
      from: '/in-notes/rfc-ref.txt',
      to: 'other/in-notes/rfc-ref.txt'
    },
    {
      from: '/robots.txt',
      to: 'other/robots.txt'
    },
    {
      from: '/sitemap.xml',
      to: 'other/sitemap.xml'
    },
    {
      from: '/reports/CurrQstats.txt',
      to: 'other/reports/CurrQstats.txt'
    },
    {
      from: '/api/v1/unusable-rfc-numbers.json',
      to: 'other/unusable-rfc-numbers.json'
    }
  ]

  const mapping = mappings.find((mapping) => mapping.from === req.normalizedPath)
  if (mapping) {
    const objectPath = mapping.to

    // -> Fetch R2 object
    const object = await env.RED_BUCKET.get(objectPath)
    if (object) {
      return createBlobResponse(object, detectContentType(mapping.to))
    }

    return createBlobNotFoundResponse()
  }
}
