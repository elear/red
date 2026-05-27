import { z } from 'zod'
import { type Ref } from 'vue'

export const FeatureFlagsSchema = z.object({
  // Ensure all top-level fields are optional so that browsers
  // with old versions of localStorage values can still load
  isDidYouMeanActive: z.boolean().optional(),
  isCardHoverFocusTint: z.boolean().optional(),
})

export type FeatureFlags = z.infer<typeof FeatureFlagsSchema>

export const featureFlagsKey = Symbol() as InjectionKey<Ref<FeatureFlags>>

export type FeatureFlagUIRow = {
  title: string
  description?: string
  storageType: 'boolean'
}

const featureFlagsUI: Record<keyof FeatureFlags, FeatureFlagUIRow> = {
  isDidYouMeanActive: {
    title: 'Homepage direct RFC/subseries links',
    description: 'Homepage search feature suggesting direct links to RFCs and other subseries, bypassing search.',
    storageType: 'boolean'
  },
  isCardHoverFocusTint: {
    title: 'Website cards hover/focus tint ',
    storageType: 'boolean'
  }
}

export const featureFlagsUIRows = Object.entries(featureFlagsUI)

export type WatchInputForFeatureFlagExperimentsProps = {
  inputValueRef: Ref<string>,
  isFeatureFlagsModalVisibleRef: Ref<boolean>,
}

const LOCALSTORAGE_KEY = 'feature-flag-experiments'

export const loadFeatureFlagsFromLocalStorage = (featureFlagsRef: Ref<FeatureFlags>) => {
  try {
    const valString = window.localStorage.getItem(LOCALSTORAGE_KEY)
    if (!valString) {
      // no value in local storage
      return
    }
    const val = JSON.parse(valString)
    const { data, error } = FeatureFlagsSchema.safeParse(val)
    if (error || !data) {
      const errorTitle = 'Unable to parse feature flag'
      console.log(errorTitle, valString)
      throw Error(errorTitle)
    }
    featureFlagsRef.value = data
  } catch (e: unknown) {
    console.log(`Error loading localStorage (this is expected behaviour if localStorage is disabled). Feature flag experiment config can't be loaded.`, e)
  }
}

const ENABLE_FEATURE_FLAGS_INPUT_VALUE = '//feature-flag-experiments'

export const watchInputForFeatureFlagExperiments = ({
  inputValueRef,
  isFeatureFlagsModalVisibleRef,
}: WatchInputForFeatureFlagExperimentsProps): void => {
  watch(inputValueRef, () => {
    const { value } = inputValueRef
    if (
      value.trim() === ENABLE_FEATURE_FLAGS_INPUT_VALUE
    ) {
      console.log("Opening feature flag experiments modal")
      isFeatureFlagsModalVisibleRef.value = true
    }
  })
}

export const isFeatureFlagsModalVisibleKey = Symbol() as InjectionKey<Ref<boolean>>

export const useFeatureFlags = () => {
  const featureFlagsRef = inject(featureFlagsKey)

  if (!featureFlagsRef) {
    throw Error('Expected provide(featureFlagsKey) above in component tree.')
  }

  watch(
    () => featureFlagsRef?.value ?? undefined,
    () => {
      if (!featureFlagsRef) {
        throw Error('Expected inject(featureFlagsKey) to be available')
      }
      try {
        // localStorage APIs can throw Errors if browser storage is disabled or storage is full etc
        window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(featureFlagsRef.value))
      } catch (e: unknown) {
        console.log(`Error saving to localStorage (this is expected behaviour if localStorage is disabled or full). Feature flag experiment config can't be saved.`, e)
      }
    })

  return featureFlagsRef
}