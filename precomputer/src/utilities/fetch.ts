import { sleep } from './sleep.ts'

const NUMBER_OF_FETCH_RETRIES = 3
const MINIMUM_DELAY_BETWEEN_REQUESTS_MS = 500

export const fetchRetry = async (
  url: string,
  rfcNumberForDebug: number
): Promise<Response> => {
  let attemptsRemaining = NUMBER_OF_FETCH_RETRIES

  while (attemptsRemaining > 0) {
    try {
      return await fetch(url)
    } catch (e) {
      if (isFetchTimeoutError(e)) {
        attemptsRemaining--
        console.warn(
          `[RFC ${rfcNumberForDebug}] fetchRetry API timeout. ${attemptsRemaining} attempts remaining.`
        )
        const stepOffMs =
          (-attemptsRemaining + NUMBER_OF_FETCH_RETRIES + 1) *
          MINIMUM_DELAY_BETWEEN_REQUESTS_MS
        await sleep(stepOffMs)
      } else {
        const errorMessage = `[RFC ${rfcNumberForDebug}] fetchRetry unhandled API response`
        console.error(e)
        throw Error(`${errorMessage}. See console`)
      }
    }
  }

  throw Error(
    `[RFC ${rfcNumberForDebug}] fetch failed after ${NUMBER_OF_FETCH_RETRIES} retries.`
  )
}

export const isFetchTimeoutError = (error: unknown) => {
  return (
    error instanceof TypeError &&
    error.cause instanceof AggregateError &&
    error.cause.errors.some(
      (error) => 'code' in error && error.code === 'ETIMEDOUT'
    )
  )
}
