import { assertIsString } from "~/utilities/typescript"
import type { Density } from "~/utilities/typesense"

export const useSearchStore = defineStore('searchStore', {
  state: () => ({
    density: 'full' as Density,
    isSubseries: false,
    searchContents: false,
    subseriesLabel: '',
    subseriesHref: ''
  }),
  persist: {
    pick: ['density', 'searchContents']
  }
})

export const useTypesenseHost = () => {
  const runtimeConfig = useRuntimeConfig()
  const { typesenseHost } = runtimeConfig.public
  assertIsString(typesenseHost)
  if (typesenseHost.length === 0) {
    throw Error('Expected NUXT_PUBLIC_TYPESENSE_HOST to have length > 0.')
  }
  return typesenseHost
}

export const useTypesenseApiKey = () => {
  const runtimeConfig = useRuntimeConfig()
  const { typesenseApiKey } = runtimeConfig.public
  assertIsString(typesenseApiKey)
  if (typesenseApiKey.length === 0) {
    throw Error('Expected NUXT_PUBLIC_TYPESENSE_API_KEY to have length > 0.')
  }
  return typesenseApiKey
}