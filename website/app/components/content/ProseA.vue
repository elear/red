<template>
  <AMaybeRFCLink
    :id="props.id"
    :href="props.href!"
    :class="ANCHOR_TAILWIND_STYLE"
  >
    <slot />
    <Icon
      v-if="!isInternal && !isMailTo && !isHash"
      name="fluent:window-new-20-regular"
      class="text-lg align-middle ml-1"
    />
    <Icon
      v-if="isMailTo"
      name="fluent:mail-all-20-regular"
      class="text-lg align-middle ml-1"
    />
  </AMaybeRFCLink>
</template>

<script setup lang="ts">
import { ANCHOR_TAILWIND_STYLE } from '~/utilities/theme'
import { isHashLink, isInternalLink, isMailToLink } from '~/utilities/url'

const props = defineProps<{ href?: string; id?: string }>()

const isInternal = computed(() => isInternalLink(props.href))
const isMailTo = computed(() => isMailToLink(props.href))
const isHash = computed(() => isHashLink(props.href))
</script>