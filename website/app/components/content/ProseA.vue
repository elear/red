<template>
  <AMaybeRFCLink
    :id="props.id"
    :href="props.href!"
    :class="ANCHOR_TAILWIND_STYLE"
  >
    <slot />
  </AMaybeRFCLink>
</template>

<script setup lang="ts">
import { ANCHOR_TAILWIND_STYLE } from '~/utilities/theme'

const props = defineProps<{ href?: string; id?: string }>()
</script>
