import { PromisePool } from '@supercharge/promise-pool'
import { difference } from 'es-toolkit'

import { indices } from './tasks/indices.ts'
import { getApiClient } from './utilities/api.ts'
import { deleteFromS3, listS3Files } from './utilities/s3.ts'
import { assertIsString } from './utilities/typescript.ts'

// This is just a hint number, not a hard limit at all
const NUMBER_OF_CONCURRENT_S3_USAGES = 4

export const main = async (): Promise<void> => {
  console.log('[cron.ts] Running job')
  const api = getApiClient()
  const s3Keys = await indices({ api })
  if (s3Keys.some(s3Key => s3Key === false)) {
    console.error(
      'cron.ts finished with error(s)' // these errors should be already printed to console
    )
  } else {
    console.log('[cron.ts] Uploads completed.')
  }
  console.log('[Cleanup] Now cleaning up bucket...')

  const existingBucketObjects = await listS3Files()
  const existingBucketKeys = existingBucketObjects.map(obj => {
    assertIsString(obj.Key, `Bucket object ${JSON.stringify(obj)} has no key.`)
    return obj.Key
  })

  const validBucketKeys = s3Keys.filter(key => key !== false)
  const keysToPurge = difference(existingBucketKeys, validBucketKeys)
  if (keysToPurge.length > 0) {
    console.log(`[Cleanup] File storage purge of ${keysToPurge.length} object(s)`)
    const { errors: purgeErrors } = await PromisePool.for(keysToPurge)
      .withConcurrency(NUMBER_OF_CONCURRENT_S3_USAGES)
      .process(async (keyToPurge) => {
        try {
          console.log('[Cleanup] would delete ', keyToPurge)
          // await deleteFromS3(keyToPurge) // FIXME: enable after testing
          // console.log(`[Cleanup ${keyToPurge}] deleted sucessfully`)
        } catch (err) {
          console.warn(
            `[Cleanup ${keyToPurge}] threw exception: ${(err as Error).message}`
          )
          throw err
        }
      })
    if (purgeErrors.length) {
      console.error("[Cleanup] There were errors purging files.", purgeErrors)
      console.error('[Cleanup] Bucket retains files that it shouldn\'t. This is bad.')
      console.error("Cannot continue. Exiting...")
    }
  } else {
    console.log("[Cleanup] No need to purge any files from S3.")
  }

  if (!s3Keys.some(s3Key => s3Key === false)) {
    console.log('[cron.ts] finished successfully')
  } else {
    console.error(
      '[cron.ts] finished with error(s)' // these errors should be already printed to console
    )
  }
  process.exit(0)
}

main()
