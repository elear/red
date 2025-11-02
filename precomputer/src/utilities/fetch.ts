const NUMBER_OF_FETCH_RETRIES = 3

export const fetchRetry = async (url: string, rfcNumberForDebug: number): Promise<Response> => {
  let attemptsRemaining = NUMBER_OF_FETCH_RETRIES

  while (attemptsRemaining > 0) {
    try {
      return await fetch(url)
    } catch (e) {
        console.error(e)
        // attemptsRemaining --
        throw e
    }
  }

  throw Error(`[RFC ${rfcNumberForDebug}] fetch failed after ${NUMBER_OF_FETCH_RETRIES} retries.`)
}
