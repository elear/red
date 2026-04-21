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
  const rfcNumbers = allRfcs.map(rfc => rfc.number)
    .sort((a, b) => a - b)

  const rfcNumbersToRender: number[] = []
  console.log(`[${HOMEPAGE_LATEST_PATH}]`, rfcNumbers)

  let remainingRfcsToUpload = NUMBER_OF_LATEST_RFCS_ON_HOMEPAGE
  while (remainingRfcsToUpload > 0 && rfcNumbers.length > 0) {
    const rfcNumber = rfcNumbers.pop()
    if (typeof rfcNumber === 'number') {
      const taskResults = await uploadRfcData(rfcNumber)
      if (taskResults.every(key => key !== false)) {
        remainingRfcsToUpload--
        rfcNumbersToRender.push(rfcNumber)
      } else {
        console.error(`[${HOMEPAGE_LATEST_PATH}]`, `Can't use RFC ${rfcNumber} as target RFC content isn't available.`, taskResults)
      }
    }
  }

  console.log(`[${HOMEPAGE_LATEST_PATH}]`, `Using homepage latest RFCS:`, rfcNumbersToRender)
  const data = await renderHomepageLatest(allRfcs, rfcNumbersToRender)
  await saveToS3(HOMEPAGE_LATEST_PATH, JSON.stringify(data))
  console.log(`[${HOMEPAGE_LATEST_PATH}]`, 'Uploaded', HOMEPAGE_LATEST_PATH)

  return [HOMEPAGE_LATEST_PATH]
}

type HomepageLatest = z.infer<typeof HomepageLatestSchema>

export const renderHomepageLatest = async (
  allRfcs: Readonly<RfcCommon[]>,
  rfcNumbersToRender: number[]
): Promise<HomepageLatest> => {
  const response: HomepageLatest = {
    homepageLatest: allRfcs
      .filter(rfc => rfcNumbersToRender.includes(rfc.number))
      .sort((a, b) => b.number - a.number)
      .map(redactRfc),
    timestampIso: DateTime.now().toUTC().toISO()
  }
  validateDocument(response, HomepageLatestSchema)
  return response
}
