import { ApiClient } from '../../client/generated/red-client.ts'
import { parseRfcStatusSlug } from '../../client/app/utilities/rfc-converter-status.ts'
import { blankRfcCommon } from './rfc.ts'
import type { Rfc } from '../../client/generated/red-client.ts'
import type { RfcCommon } from '../../client/app/utilities/rfc-validators.ts'
import { assertIsString } from './utilities/typescript.ts'

const redApiBase =
  process.env.RED_API_BASE ?? 'http://datatracker-rpc.datatracker.svc/'

export const getRedClient = () => {
  console.log('getting api client with base', redApiBase)

  const NUXT_PUBLIC_DATATRACKER_BASE = process.env.NUXT_PUBLIC_DATATRACKER_BASE
  const NUXT_CF_SERVICE_TOKEN_ID = process.env.NUXT_CF_SERVICE_TOKEN_ID
  const NUXT_CF_SERVICE_TOKEN_SECRET = process.env.NUXT_CF_SERVICE_TOKEN_SECRET

  assertIsString(NUXT_PUBLIC_DATATRACKER_BASE, "datatracker base wasn't a string")
  assertIsString(NUXT_CF_SERVICE_TOKEN_ID, "cloudflare token wasn't a string")
  assertIsString(NUXT_CF_SERVICE_TOKEN_SECRET, "cloudflare secret wasn't a string")

  const headers: ApiClient['Config']['headers'] = {
    'CF-Access-Client-Id':  NUXT_CF_SERVICE_TOKEN_ID,
    'CF-Access-Client-Secret': NUXT_CF_SERVICE_TOKEN_SECRET,
  }

  return new ApiClient({
    baseUrl: NUXT_PUBLIC_DATATRACKER_BASE,
    headers
  })
}

export const getRfcCommon = async (rfcNumber: number): Promise<RfcCommon> => {
  console.log('Getting API client')
  const api = getRedClient()
  console.log('Got API client', api)
  console.log('docRetrive', rfcNumber)
  try {
    const rfc = await api.red.docRetrieve(rfcNumber)
    console.log('after docRetrieve', api)
    const rfcCommon = rfcToRfcCommon(rfc)
    console.log('after docRetrieve common', api)
    return rfcCommon
  } catch (e) {
    console.error('docRetrive catch()', e)
    throw e
  }
}

export const rfcToRfcCommon = (rfc: Rfc): RfcCommon => {
  return {
    ...blankRfcCommon,
    number: rfc.number,
    abstract: rfc.abstract,
    published: rfc.published,
    status: parseRfcStatusSlug(rfc.status.slug),
    pages: rfc.pages,
    authors: rfc.authors,
    group: rfc.group,
    area: rfc.area,
    stream: rfc.stream,
    identifiers: rfc.identifiers,
    obsoleted_by: rfc.obsoleted_by,
    updated_by: rfc.updated_by,
    title: rfc.title
  }
}
