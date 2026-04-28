import { PromisePool } from '@supercharge/promise-pool'
import { processExitFromUploadResults, processRfcUploadTask } from './utilities/task.ts'

const NUMBER_OF_CONCURRENT_RFC_PROCESSORS = 8

const main = async (rfcNumbers: number[]): Promise<void> => {
  console.log(
    `Processing RFCs ${rfcNumbers.join(', ')}. Using ${NUMBER_OF_CONCURRENT_RFC_PROCESSORS} concurrent promises (results may appear out of order).`
  )
  const { results, errors } = await PromisePool.for(rfcNumbers)
    .withConcurrency(NUMBER_OF_CONCURRENT_RFC_PROCESSORS)
    .process(processRfcUploadTask)

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
