import { PromisePool } from '@supercharge/promise-pool'
import { range } from 'es-toolkit'
import { uploadRfcData } from './tasks/rfc.ts'

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
    `Processing ${minRfcNumber}-${maxRfcNumber}. Using ${NUMBER_OF_CONCURRENT_RFC_PROCESSORS} concurrent promises (results will appear out of order)`
  )
  const { errors } = await PromisePool.for(rfcRange)
    .withConcurrency(NUMBER_OF_CONCURRENT_RFC_PROCESSORS)
    .process(async (rfcNumber) => {
      try {
        const isDone = await uploadRfcData(rfcNumber)
        if (isDone) {
          console.log(`[RFC ${rfcNumber}] upload succeeded`)
        } else {
          console.error(
            `[RFC ${rfcNumber}] generation failed. If the RFC was NOT_ISSUED this isn't an error.`
          )
        }
      } catch (err) {
        console.warn(
          `[RFC ${rfcNumber}] threw exception: ${(err as Error).message}`
        )
        throw err
      }
    })

  if (errors.length > 0) {
    console.log('all.ts finished with error(s)')
    console.error(errors)
    process.exit(1)
  } else {
    process.exit(0)
  }
}

if (!process.argv[2] || !process.argv[3]) {
  throw Error(
    `Script requires min and max RFC Number args but argv was ${JSON.stringify(
      process.argv
    )}`
  )
}

main(parseInt(process.argv[2], 10), parseInt(process.argv[3], 10))
