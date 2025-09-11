import { generateHomepageLatest } from './homepage-latest.ts'
import { getAllRFCs, getRedClient } from './redClientGet.ts'

export const processCron = async (): Promise<void> => {
  console.log('Triggered by a cron job')
  const api = getRedClient()
  const allRfcs = await getAllRFCs({ api })

  await generateHomepageLatest(allRfcs)
}
