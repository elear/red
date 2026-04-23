import { PromisePool } from '@supercharge/promise-pool'
import { uploadRfcData } from './tasks/rfc.ts'
import { processExitFromUploadResults, type TaskItem, taskItemWasSkipped, taskItemWasSuccessful } from './utilities/task.ts'

const NUMBER_OF_CONCURRENT_RFC_PROCESSORS = 8

type Result = [number, TaskItem]

const main = async (rfcNumbers: number[]): Promise<void> => {
  console.log(
    `Processing RFCs ${rfcNumbers.join(', ')}. Using ${NUMBER_OF_CONCURRENT_RFC_PROCESSORS} concurrent promises (results may appear out of order).`
  )
  const { results, errors } = await PromisePool.for(rfcNumbers)
    .withConcurrency(NUMBER_OF_CONCURRENT_RFC_PROCESSORS)
    .process(async (rfcNumber): Promise<Result> => {
      try {
        const uploadResults = await uploadRfcData(rfcNumber)
        if (taskItemWasSkipped(uploadResults)) {
          console.log(`[RFC ${rfcNumber}] skipped`)
        } else if (taskItemWasSuccessful(uploadResults)) {
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
    exceptions: errors,
    filename: 'multiple.ts'
  })
}

if (!process.argv[2]) {
  throw Error(
    `Script requires RFC Numbers arg but argv was ${JSON.stringify(
      process.argv
    )}`
  )
}

const rfcNumbers = process.argv[2].split(',').map(rfc => parseInt(rfc.trim(), 10))
if (rfcNumbers.some(rfcNumber => Number.isNaN(rfcNumber))) {
  throw Error(`RFC number list ${JSON.stringify(process.argv[2])} included a NaN`)
}
main(rfcNumbers)
