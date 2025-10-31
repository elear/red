import { z } from 'zod'
import { HOMEPAGE_LATEST_PATH, saveToS3 } from '../utilities/s3.ts'
import { HomepageLatestSchema } from '../../../website/app/utilities/rfc-validators.ts'
import type { RfcCommon } from '../../../website/app/utilities/rfc-validators.ts'
import { validateDocument } from '../utilities/validate-zod.ts'
import { uploadRfcData } from './rfc.ts'

export const uploadHomepageLatest = async (
  allRfcs: Readonly<RfcCommon[]>
): Promise<boolean> => {
  const data = await renderHomepageLatest(allRfcs)
  await saveToS3(HOMEPAGE_LATEST_PATH, JSON.stringify(data))
  console.log('Uploaded', HOMEPAGE_LATEST_PATH)

  // also upload the 'homepage latest' RFCs so that the links to RFCs will work
  await Promise.all(data.homepageLatest.map(rfc => uploadRfcData(rfc.number)))
  
  return true
}

type HomepageLatest = z.infer<typeof HomepageLatestSchema>

export const renderHomepageLatest = async (
  allRfcs: Readonly<RfcCommon[]>
): Promise<HomepageLatest> => {
  const response = {
    homepageLatest: allRfcs.slice(-3).sort((a, b) => b.number - a.number)
  }
  validateDocument(response, HomepageLatestSchema)
  return response
}
