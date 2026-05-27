<template>
  <DialogRoot v-model:open="isFeatureFlagsModalVisible">
    <DialogPortal>
      <DialogOverlay class="bg-blue-900/50 data-[state=open]:animate-overlayShow fixed inset-0 z-30" />
      <DialogContent
        class="data-[state=open]:animate-contentShow fixed top-[10%] left-[50%] w-[90vw] max-w-[800px] translate-x-[-50%] rounded-md bg-white dark:bg-blue-900 px-5 py-3 z-[100]">
        <DialogTitle class="text-xl font-bold py-2">
          Feature Flag Experiments
        </DialogTitle>
        <DialogDescription class="leading-6 pb-3 border-b-1 border-b-gray-500">
          <p>
            Feature Flags are experimental website features that
            may <b>or may not</b> become default on rfc-editor.org in the future.
          </p>
          <p>
            Sometimes feature flags are developed to test a concept rather than to indicate
            that a feature will become default sometime in the future, as <b>it may not</b>.
          </p>
          <p>
            This part of the site is intended for a specific audience. It is for those
            interested in using experimental/prototype/beta features of the website and
            giving technical feedback.
          </p>
        </DialogDescription>
        <Heading level="2" style-level="4" class="mt-3 mb-0 pb-0">Website feature flags:</Heading>
        <div class="flex flex-col gap-5 border-b-1 border-b-gray-500">
          <FeatureFlagFieldset v-for="featureFlagUIRow in featureFlagsUIRows" :key="featureFlagUIRow[0]"
            :feature-flag-key="featureFlagUIRow[0] as keyof FeatureFlags" :feature-flag-ui-row="featureFlagUIRow[1]">
          </FeatureFlagFieldset>
        </div>
        <p class="pt-3 text-sm">
          Feature flag choices are saved to <Anchor
            href="https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage" class="monotype">localStorage
          </Anchor>
          (if available).
        </p>
        <DialogClose
          class="absolute border-1 border-gray-400 top-1 right-1 rounded cursor-pointer px-3 py-1 text-black">
          Close
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import { featureFlagsUIRows, isFeatureFlagsModalVisibleKey, type FeatureFlags } from '~/utilities/feature-flags';

const isFeatureFlagsModalVisible = inject(isFeatureFlagsModalVisibleKey)
</script>