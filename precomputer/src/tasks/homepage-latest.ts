import { z } from 'zod'
import { DateTime } from 'luxon'
import { HOMEPAGE_LATEST_PATH, saveToS3 } from '../utilities/s3.ts'
import { HomepageLatestSchema } from '../../../website/app/utilities/rfc-validators.ts'
import type { RfcCommon } from '../../../website/app/utilities/rfc-validators.ts'
import { validateDocument } from '../utilities/validate-zod.ts'
import { redactRfc, uploadRfcData } from './rfc.ts'
import { type AsyncTaskItem } from '../utilities/task.ts'

export const NUMBER_OF_LATEST_RFCS_ON_HOMEPAGE = 3

export const uploadHomepageLatest = async (
  allRfcs: Readonly<RfcCommon[]>
): AsyncTaskItem => {
  const data = await renderHomepageLatest(allRfcs)
  await saveToS3(HOMEPAGE_LATEST_PATH, JSON.stringify(data))
  console.log('Uploaded', HOMEPAGE_LATEST_PATH)

  // Upload the referenced 'homepage latest' RFCs so that the links to RFCs
  // at /info/rfcN/ will work.
  // The list of `allRfcs` should already be filtered to those that have bucket files,
  // html or pdf etc. If there's an error caused by missing RFC files it probably means
  // that `allRfcs` wasn't filtered correctly.
  const referencedKeys = await Promise.all(data.homepageLatest.map((rfc) => uploadRfcData(rfc.number)))

  return [HOMEPAGE_LATEST_PATH, ...referencedKeys.flat()]
}

type HomepageLatest = z.infer<typeof HomepageLatestSchema>

export const renderHomepageLatest = async (
  allRfcs: Readonly<RfcCommon[]>
): Promise<HomepageLatest> => {
  const response: HomepageLatest = {
    homepageLatest: allRfcs
      .slice(-NUMBER_OF_LATEST_RFCS_ON_HOMEPAGE)
      .sort((a, b) => b.number - a.number)
      .map(redactRfc),
    timestampIso: DateTime.now().toUTC().toISO()
  }
  validateDocument(response, HomepageLatestSchema)
  return response
}