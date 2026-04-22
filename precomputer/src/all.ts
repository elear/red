import { PromisePool } from '@supercharge/promise-pool'
import { range } from 'es-toolkit'
import { uploadRfcData } from './tasks/rfc.ts'
import { processExitFromUploadResults, taskItemWasSuccessful, type UploadResult } from './utilities/task.ts'

const NUMBER_OF_CONCURRENT_RFC_PROCESSORS = 8

const main = async (
  minRfcNumber: number,
  maxRfcNumber: number
): Promise<void> => {
  if (Number.isNaN(minRfcNumber)) {
    throw Error(`Min RFC number (${minRfcNumber}) must be a number but was NaN`)
  }
  if (Number.isNaN(maxRfcNumber)) {
    throw Error(`Max RFC number (${maxRfcNumber}) must be a number but was NaN`)
  }
  if (minRfcNumber >= maxRfcNumber) {
    throw Error(
      `Min RFC number (${minRfcNumber}) must be smaller than max RFC number (${maxRfcNumber})`
    )
  }

  const rfcRange = range(minRfcNumber, maxRfcNumber)

  console.log(
    `Processing ${minRfcNumber}-${maxRfcNumber}. Using ${NUMBER_OF_CONCURRENT_RFC_PROCESSORS} concurrent promises (results may appear out of order)`
  )

  const { results, errors } = await PromisePool.for(rfcRange)
    .withConcurrency(NUMBER_OF_CONCURRENT_RFC_PROCESSORS)
    .process(async (rfcNumber): Promise<UploadResult> => {
      try {
        const uploadResults = await uploadRfcData(rfcNumber)
        if (taskItemWasSuccessful(uploadResults)) {
          console.log(`[RFC ${rfcNumber}] upload succeeded`)
        }
        return [rfcNumber, uploadResults]
      } catch (err) {
        console.warn(
          `[RFC ${rfcNumber}] threw exception: ${String(err)}`
        )
        throw err
      }
    })

  processExitFromUploadResults({
    uploadResults: results,
    errors,
    filename: 'all.ts'
  })
}

if (!process.argv[2] || !process.argv[3]) {
  throw Error(
    `Script requires min and max RFC Number args but argv was ${JSON.stringify(
      process.argv
    )}`
  )
}

main(parseInt(process.argv[2], 10), parseInt(process.argv[3], 10))
