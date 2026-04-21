import { indices } from './tasks/indices.ts'
import { getApiClient } from './utilities/api.ts'
import { cleanupRedBucket } from './utilities/cleanup.ts'

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

  const didClean = await cleanupRedBucket(s3Keys.filter(key => key !== false))

  if (didClean) {
    console.log('[cron.ts] finished successfully')
  } else {
    console.error(
      '[cron.ts] finished with error(s)' // these errors should be already printed to console
    )
    process.exit(1)
  }
  process.exit(0)
}

main()
