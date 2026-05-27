<template>
  <fieldset>
    <legend class="text-md mt-3 mb-0 pb-0 font-bold">{{ props.featureFlagUiRow.title }}</legend>
    <p class="mt-0 pt-0 text-sm">{{ featureFlagUiRow.description }}</p>
    <label>
      enabled?
      <input type="checkbox" v-model="featureFlagRef">
    </label>
  </fieldset>
</template>

<script setup lang="ts">
import { useFeatureFlags, type FeatureFlagUIRow, type FeatureFlags } from '../utilities/feature-flags'

type Props = {
  featureFlagKey: keyof FeatureFlags
  featureFlagUiRow: FeatureFlagUIRow
}

const props = defineProps<Props>()

const { featureFlagsRef } = useFeatureFlags()

const featureFlagRef = computed({
  get: () => featureFlagsRef?.value[props.featureFlagKey],
  set: (value) => {
    if (!featureFlagsRef) {
      throw Error('Expected inject(featureFlagsKey) to be available')
    }
    featureFlagsRef.value = {
      ...featureFlagsRef.value,
      [props.featureFlagKey]: value
    }
  }
})

</script>