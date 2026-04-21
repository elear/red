// @vitest-environment node
import { test, expect, vi } from 'vitest'
import { NUMBER_OF_LATEST_RFCS_ON_HOMEPAGE, renderHomepageLatest } from './homepage-latest.ts'
import { testMockAllRfcs } from '../utilities/rfcs-test-data.ts'

test('homepage latest RFCs', async () => {
  const date = new Date(2025, 0, 14)
  vi.setSystemTime(date)
  const rfcsToRender = testMockAllRfcs.slice(-NUMBER_OF_LATEST_RFCS_ON_HOMEPAGE).map(rfc => rfc.number)
  const response = await renderHomepageLatest(testMockAllRfcs, rfcsToRender)
  expect(response).toMatchSnapshot()
  expect(response.homepageLatest.length).toBe(3)
})
