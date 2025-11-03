import { sleep } from './sleep.ts'

const NUMBER_OF_FETCH_RETRIES = 3
const MINIMUM_DELAY_BETWEEN_REQUESTS_MS = 1000

export const fetchRetry = async (
  url: string,
  rfcNumberForDebug: number
): Promise<Response> => {
  let attemptsRemaining = NUMBER_OF_FETCH_RETRIES

  const errors: unknown[] = []
  while (attemptsRemaining > 0) {
    try {
      return await fetch(url)
    } catch (e) {
      errors.push(e)
      if (isFetchTimeoutError(e)) {
        attemptsRemaining--
        const stepOffMs =
          (-attemptsRemaining + NUMBER_OF_FETCH_RETRIES + 1) *
          MINIMUM_DELAY_BETWEEN_REQUESTS_MS
        console.warn(
          `[RFC ${rfcNumberForDebug}] fetchRetry API timeout. ${attemptsRemaining} attempts remaining. Retrying in ${stepOffMs}ms`
        )
        await sleep(stepOffMs)
      } else {
        const errorMessage = `[RFC ${rfcNumberForDebug}] fetchRetry unhandled API response`
        console.error(e)
        throw Error(`${errorMessage}. See console`)
      }
    }
  }

  console.log(`[RFC ${rfcNumberForDebug}] no fetch attempts remaining. Errors were`, ...errors)
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
