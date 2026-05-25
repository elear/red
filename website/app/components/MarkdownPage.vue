<template>
  <div class="min-h-[100vh] mb-16">
    <BodyLayoutDocument :class="{ 'lg:pr-[300px]': !showToc }">
      <template #sidebar>
        <TableOfContentsMarkdownDesktop v-if="showToc && toc" :toc="toc" />
      </template>
      <div class="wrap-anywhere leading-[1.75]">
        <Breadcrumbs :breadcrumb-items="breadcrumbItems" />
        <component :is="renderedContent" />
      </div>
      <ContentDocModifiedDateTime v-if="modifiedDateTime" :modified-date-time="modifiedDateTime" />
    </BodyLayoutDocument>
  </div>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon'
import { provide, computed } from 'vue'
import _contentMetadata from '../../generated/content-metadata.json'
import type { BreadcrumbItem } from '~/components/BreadcrumbsTypes'
import { tocKey, closeModalAndScrollToId } from '~/utilities/tableOfContents'
import { useRfcEditorHead } from '~/utilities/head'
import { MarkdownPageSchema } from '~/utilities/rfc-validators'
import { apiMarkdownPagePathBuilder, useApiV1UrlOrigin } from '~/utilities/url'
import { renderDocumentPojo } from '~/utilities/renderDocumentPojo'

const route = useRoute()
const apiV1UrlOrigin = useApiV1UrlOrigin()

const normalizedSlug = route.path.replace(/^\//, '').replace(/\/$/, '')

const canonicalPath = `/${normalizedSlug}/`
if (route.path !== canonicalPath) {
  await navigateTo({ path: canonicalPath })
}

const { data: markdownPage, error } = await useAsyncData(
  `markdown-page-${normalizedSlug}`,
  async () => {
    const apiPath = apiMarkdownPagePathBuilder(normalizedSlug)
    const json = await $fetch(apiPath, {
      method: 'GET',
      baseURL: import.meta.server ? apiV1UrlOrigin : undefined,
    })
    const { data, error: validationError } = MarkdownPageSchema.safeParse(json)
    if (validationError) {
      console.error('Failed to validate markdown page', apiPath, validationError)
      throw createError({ statusCode: 500 })
    }
    return data
  }
)

if (error.value || !markdownPage.value) {
  throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
}

const renderedContent = computed(() =>
  renderDocumentPojo(markdownPage.value!.htmlObj)
)

const showToc = false
const toc = undefined
provide(tocKey, { showToc, toc })

let modifiedDateTime: DateTime | undefined = undefined
if (markdownPage.value.timestampIso) {
  modifiedDateTime = DateTime.fromISO(markdownPage.value.timestampIso)
}

const breadcrumbItems = computed((): BreadcrumbItem[] => [
  { url: '/', label: 'Home' },
  { url: undefined, label: markdownPage.value?.title ?? '' }
])

const handleCloseAndNavigate = (_id: string) => {}
provide(closeModalAndScrollToId, handleCloseAndNavigate)

useRfcEditorHead({
  title: markdownPage.value.title ?? '',
  canonicalPath,
  description: markdownPage.value.description ?? '',
  modifiedDateTime,
  contentType: 'article'
})
</script>
