<!-- error.vue -->
<template>
  <Header />
  <main class="pt-10 pb-20 text-center max-w-100 mx-auto">
    <h1 class="text-5xl">Error {{ props.error.status ?? props.error.statusCode }}</h1>
    <p class="mt-4">{{ props.error.message ?? props.error.statusMessage }}</p>

    <ul class="pt-4 pl-6 flex flex-col gap-3">
      <li v-if="props.error.data?.linkUrl">
        <Anchor :href="props.error.data.linkUrl" :class="[ANCHOR_COLOR_TAILWIND_STYLE, 'underline']">
          {{ props.error.data?.linkText ?? 'Click here' }}
        </Anchor>
      </li>
      <li>
        <template v-if="props.error.data?.linkUrl">
          or
        </template>
        <a :href="HOME_PATH" :class="[ANCHOR_COLOR_TAILWIND_STYLE, 'underline']" @click="handleHomepage">
          <template v-if="props.error.data?.linkUrl">
            go
          </template>
          <template v-else>
            Go
          </template>
          to homepage.
        </a>
      </li>
      <li>
        or
        <a :href="SEARCH_PATH" :class="[ANCHOR_COLOR_TAILWIND_STYLE, 'underline']" @click="handleSearch">
          go to search.
        </a>
      </li>
    </ul>
  </main>
  <Footer />
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'
import { ANCHOR_COLOR_TAILWIND_STYLE } from './utilities/theme'
import { HOME_PATH, SEARCH_PATH } from './utilities/url'

type Props = {
  error: NuxtError & {
    data: {
      linkText: string
      linkUrl: string
    }
  }
}
const props = defineProps<Props>()

const handleHomepage = (e: Event) => {
  e.preventDefault?.()
  clearError({ redirect: HOME_PATH })
}

const handleSearch = (e: Event) => {
  e.preventDefault?.()
  clearError({ redirect: SEARCH_PATH })
}
</script>
