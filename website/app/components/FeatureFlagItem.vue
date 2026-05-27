<template>
  <div class="bg-gray-200 mt-3 px-4 py-3 rounded-md mb-6">
    <label class="text-md mt-4 mb-0 pb-0 font-bold cursor-pointer">"{{ props.featureFlagUiRow.title }}" enabled?
      <input type="checkbox" v-model="featureFlagRef" :aria-describedby="descriptionDomId">
    </label>
    <p v-if="descriptionDomId" class="mt-2 pt-0 text-sm">
      {{ featureFlagUiRow.description }}s
    </p>
  </div>
</template>

<script setup lang="ts">
import { useFeatureFlags, type FeatureFlagUIRow, type FeatureFlags } from '../utilities/feature-flags'

type Props = {
  featureFlagKey: keyof FeatureFlags
  featureFlagUiRow: FeatureFlagUIRow
}

const props = defineProps<Props>()

const { featureFlagsRef } = useFeatureFlags()

const descriptionDomId = useId()

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