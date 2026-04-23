// @vitest-environment node
import { test, expect } from 'vitest'
import { renderRefsRef } from './rfc.ts'
import { testMockAllRfcs } from '../utilities/rfcs-test-data.ts'

test('renderRfcRef 1048: single author RFC', async () => {
  const rfc1048 = testMockAllRfcs.find((rfc) => rfc.number === 1048)
  if (rfc1048 === undefined) {
    throw Error(`Couldn't find RFC 1048 in mock data`)
  }
  const rfc1048Ref = renderRefsRef(rfc1048)
  expect(rfc1048Ref).toMatch('Prindeville, P., "BOOTP vendor information extensions", RFC 1048, DOI 10.17487/RFC1048, February 1988, <https://www.rfc-editor.org/info/rfc1048/>.')
})

test('renderRfcRef 9804: two author RFC', async () => {
  const rfc9804 = testMockAllRfcs.find((rfc) => rfc.number === 9804)
  if (rfc9804 === undefined) {
    throw Error(`Couldn't find RFC 9804 in mock data`)
  }
  const rfc9804Ref = renderRefsRef(rfc9804)
  expect(rfc9804Ref).toMatch('Rivest, R. and D. Eastlake, "Simple Public Key Infrastructure (SPKI) S-Expressions", RFC 9804, DOI 10.17487/RFC9804, June 2025, <https://www.rfc-editor.org/info/rfc9804/>.')
})

test('renderRfcRef 9003: three+ author RFC', async () => {
  const rfc9003 = testMockAllRfcs.find((rfc) => rfc.number === 9003)
  if (rfc9003 === undefined) {
    throw Error(`Couldn't find RFC 9003 in mock data`)
  }
  const rfc9003Ref = renderRefsRef(rfc9003)
  expect(rfc9003Ref).toMatch('Snijders, J., Heitz, J., Scudder, J., and A. Azimov, "Extended BGP Administrative Shutdown Communication", RFC 9003, DOI 10.17487/RFC9003, January 2021, <https://www.rfc-editor.org/info/rfc9003/>.')
})
