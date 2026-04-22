import { uploadRfcData } from './tasks/rfc.ts'
import { taskItemWasSuccessful } from './utilities/task.ts'

const main = async (rfcNumber: number): Promise<void> => {
  console.log(`Processing RFC ${rfcNumber}...`)
  try {
    const uploadResults = await uploadRfcData(rfcNumber)
    if (taskItemWasSuccessful(uploadResults)) {
      console.log(`Pushed RFC ${rfcNumber} to bucket successfully.`)
      process.exit(0)
    } else {
      console.error(`Unable to process RFC ${rfcNumber}. If the RFC was NOT_ISSUED this isn't an error. Results: `,
        uploadResults
      )
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(
        `Failed to process RFC ${rfcNumber}: `,
        err.message,
        err.stack
      )
    } else {
      console.error(`Failed to process RFC ${rfcNumber}:`, err)
    }
  }
  process.exit(1)
}

if (!process.argv[2]) {
  throw Error(
    `Script requires RFC Number arg but argv was ${JSON.stringify(
      process.argv
    )}`
  )
}

main(parseInt(process.argv[2], 10))
