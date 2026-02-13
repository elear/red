import { uploadRfcData } from './tasks/rfc.ts'

const main = async (rfcNumbers: number[]): Promise<void> => {
  console.log(`Processing RFCs ${rfcNumbers.join(', ')}...`)

  // TODO: Do stuff
}

if (!process.argv[2]) {
  throw Error(
    `Script requires RFC Numbers arg but argv was ${JSON.stringify(
      process.argv
    )}`
  )
}

main(process.argv[2].split(',').map(rfc => parseInt(rfc.trim(), 10)))
