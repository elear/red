// @vitest-environment node
import { test, expect } from 'vitest'
import { legacyErrataSearchRedirectUrlBuilder } from './legacy-errata-search-redirect'
import { rfcEditorErrataSearchUrl } from './helpers'

test('translateParamsString: just a redirect', () => {
  const errataSearchUrl = rfcEditorErrataSearchUrl()
  expect(legacyErrataSearchRedirectUrlBuilder('?')).toEqual(errataSearchUrl)
  expect(legacyErrataSearchRedirectUrlBuilder('/errata_search.php?')).toEqual(errataSearchUrl)
  expect(legacyErrataSearchRedirectUrlBuilder('/errata_search.php')).toEqual(errataSearchUrl)
})

test('translateParamsString: rfc number', () => {
  const errataSearchUrl = rfcEditorErrataSearchUrl()
  expect(legacyErrataSearchRedirectUrlBuilder('?rfc=9000')).toEqual(`${errataSearchUrl}?rfc=9000`)
})
