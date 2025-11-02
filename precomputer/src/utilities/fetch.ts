import { isApiTimeoutError } from './api.ts'
import { sleep } from './sleep.ts'

const NUMBER_OF_FETCH_RETRIES = 3
const DELAY_BETWEEN_REQUESTS_MS = 500

export const fetchRetry = async (
  url: string,
  rfcNumberForDebug: number
): Promise<Response> => {
  let attemptsRemaining = NUMBER_OF_FETCH_RETRIES

  while (attemptsRemaining > 0) {
    try {
      return await fetch(url)
    } catch (e) {
      console.log({
        isTypeError: e instanceof TypeError,
        causeisAggregateError:
          e instanceof TypeError && e.cause instanceof AggregateError,
        isApiTimeoutError: isApiTimeoutError(e)
      })
      console.error(`[RFC ${rfcNumberForDebug}]`, e)
      if (isApiTimeoutError(e)) {
        attemptsRemaining--
        console.warn(
          `[RFC ${rfcNumberForDebug}] fetchRetry API timeout. ${attemptsRemaining} attempts remaining.`
        )
        await sleep(DELAY_BETWEEN_REQUESTS_MS)
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
