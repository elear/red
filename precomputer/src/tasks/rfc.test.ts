// @vitest-environment node
import { test, expect } from 'vitest'
import { renderRefsRef } from './rfc.ts'
import { testMockAllRfcs } from '../utilities/rfcs-test-data.ts'

test('renderRfcRef 298', async () => {
  const rfc298 = testMockAllRfcs.find((rfc) => rfc.number === 298)
  if (rfc298 === undefined) {
    throw Error(`Couldn't find RFC 298 in mock data`)
  }
  const rfc298Ref = renderRefsRef(rfc298)
  expect(rfc298Ref).toMatchSnapshot()
})

// 9804 reference rendering 'Rivest, R. and D. Eastlake 3rd, "Simple Public Key Infrastructure (SPKI) S-Expressions", RFC 9804, DOI 10.17487/RFC9804, June 2025, <https://www.rfc-editor.org/info/rfc9804>.'

test('renderRfcRef 9804', async () => {
  const rfc9804 = testMockAllRfcs.find((rfc) => rfc.number === 9804)
  if (rfc9804 === undefined) {
    throw Error(`Couldn't find RFC 9804 in mock data`)
  }
  const rfc9804Ref = renderRefsRef(rfc9804)
  expect(rfc9804Ref).toMatchSnapshot()
})

// 9084 rendering 'Wang, A., Lindem, A., Dong, J., Psenak, P., and K. Talaulikar, Ed., "OSPF Prefix Originator Extensions", RFC 9084, DOI 10.17487/RFC9084, August 2021, <https://www.rfc-editor.org/info/rfc9084>.'

test('renderRfcRef 9084', async () => {
  const rfc9084 = testMockAllRfcs.find((rfc) => rfc.number === 9084)
  if (rfc9084 === undefined) {
    throw Error(`Couldn't find RFC 9084 in mock data`)
  }
  const rfc9084Ref = renderRefsRef(rfc9084)
  expect(rfc9084Ref).toMatchSnapshot()
})
