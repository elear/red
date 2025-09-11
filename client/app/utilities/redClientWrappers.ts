import { get } from 'lodash-es'
import { ApiClient } from '../../generated/red-client'
import { needsCloudflareHeaderForApi } from './url'

export const getRedClient = () => {
  const isServer = import.meta.server
  /**
   * FIXME: check to see if this bug is still present and remove the get() if no
   * longer necessary
   *
   * ----
   *
   * Seems like a Nuxt 4.0.3 bug but `vue-tsc` reports a TS error that TS langserver
   * doesn't. The error looks like,
   *
   *   app/utilities/redClientWrappers.ts:8:30 - error TS2339: Property 'env' does not exist
   *                                                           on type 'ImportMeta'.
   *   const isTest = import.meta.env.VITEST
   *                              ~~~
   * We can't use @ts-ignore or @ts-expect-error because whether it's an error depends on
   * whether you're using `vue-tsc` or an IDE. This means @ts-ignore is used on a line
   * without an error which is an error itself, or @ts-expect-error is used on a line
   * without an error which is also an error.
   *
   * So we've obscured the property usage in a lodash get() to work around TS bug.
   *
   * This is horrible.
   *
   * Please delete this asap.
   */
  const isTest = Boolean(get(import.meta, 'env.VITEST'))

  const config = useRuntimeConfig()
  const headers: ApiClient['Config']['headers'] = {}
  const {
    cfServiceTokenId,
    cfServiceTokenSecret,
    public: { datatrackerBase }
  } = config

  if (cfServiceTokenId && typeof cfServiceTokenId === 'string') {
    headers['CF-Access-Client-Id'] = cfServiceTokenId
  }
  if (cfServiceTokenSecret && typeof cfServiceTokenSecret === 'string') {
    headers['CF-Access-Client-Secret'] = cfServiceTokenSecret
  }
  if (typeof datatrackerBase !== 'string') {
    throw Error(
      `Required nuxt.config.ts runtimeConfig.public.datatrackerBase not found (or not a string). Was typeof=${typeof datatrackerBase}. isServer=${isServer}. isTest=${isTest}`
    )
  }

  if (
    needsCloudflareHeaderForApi(datatrackerBase) &&
    (!cfServiceTokenId ||
      typeof cfServiceTokenId !== 'string' ||
      !cfServiceTokenSecret ||
      typeof cfServiceTokenSecret !== 'string')
  ) {
    throw Error(
      `Detected ${datatrackerBase} as prod API but required headers cfServiceTokenId=${typeof cfServiceTokenId} or cfServiceTokenSecret=${typeof cfServiceTokenSecret} were missing. isServer=${isServer}. isTest=${isTest}`
    )
  }

  if (!isServer && !isTest) {
    throw Error(
      `redClientWrapper should only be called serverside or in a test runner. Was isServer=${isServer}. isTest=${isTest}`
    )
  }

  return new ApiClient({
    baseUrl: datatrackerBase,
    headers
  })
}

/** Safety wrapper around docRetrieve access to catch errors  */
export const docRetrieve = async (redApi: ApiClient, rfcNumber: number) => {
  try {
    return await redApi.red.docRetrieve(rfcNumber)
  } catch (e: unknown) {
    // The API client can throw to express 404s... if so, return null
    if (
      e &&
      typeof e === 'object' &&
      'type' in e &&
      e.type === 'client_error' &&
      'errors' in e &&
      Array.isArray(e.errors) &&
      e.errors.length > 0
    ) {
      const error = e.errors[0]
      if ('code' in error && error.code === 'not_found') {
        return null
      }
    }

    const errorMessage = 'Unhandled Red API response'
    console.error(errorMessage, e)
    throw Error(`${errorMessage}. See console`)
  }
}