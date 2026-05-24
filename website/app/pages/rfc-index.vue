<template>
  <div class="min-h-screen">
    <NuxtLayout name="default">
      <div class="container mx-auto">
        <Heading level="1" style-level="2" class="text-left mt-10 mb-4 pl-5">
          RFC Index
        </Heading>
        <table v-if="rfcIndex" class="divide-y divide-gray-700 dark:divide-neutral-600 shadow border-1 border-separate border-gray-400 dark:border-gray-500 ml-2 mr-2">
          <thead>
            <tr>
              <TableCellHeader background="solid" class="text-nowrap text-sm">
                RFC Number
              </TableCellHeader>
              <TableCellHeader background="solid" class="text-sm">
                Title
              </TableCellHeader>
              <TableCellHeader background="solid" class="text-nowrap text-sm">
                Publish date
              </TableCellHeader>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rfcIndex.miniIndex">
              <TableCell class="text-nowrap text-sm">
                <Anchor :href="infoSeriesPathBuilder(`rfc${row.number}`)" :class="ANCHOR_COLOR_TAILWIND_STYLE">
                  <SubseriesTitle :series="parseSeriesId(`rfc${row.number}`)" />
                </Anchor>
              </TableCell>
              <TableCell class="text-sm">
                {{ row.title }}
              </TableCell>
              <TableCell class="text-nowrap text-sm">
                {{ row.published }}
              </TableCell>
            </tr>
          </tbody>
        </table>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon'
import TableCell from '~/components/TableCell.vue'
import { useRfcEditorHead } from '~/utilities/head'
import { parseSeriesId } from '~/utilities/rfc'
import { RfcMiniIndexSchema } from '~/utilities/rfc-validators'
import { ANCHOR_COLOR_TAILWIND_STYLE } from '~/utilities/theme'
import { API_RFC_MINI_INDEX_PATH, infoSeriesPathBuilder, RFC_INDEX_PATH } from '~/utilities/url'

const route = useRoute()

const canonicalPath = RFC_INDEX_PATH

if (
  // only compare route.path not route.fullPath as that will clobber ?search#id params
  route.path !== canonicalPath
) {
  await navigateTo({
    path: canonicalPath
  })
}

const { data: rfcIndex, error } = useAsyncData('rfc-index-html', async () => {
  const json = await $fetch(API_RFC_MINI_INDEX_PATH)
  const { data: validatedRfcMiniIndex, error: validationError } = RfcMiniIndexSchema.safeParse(json)
  if (validationError) {
    const errorTitle = 'Unable to parse rfc-mini-index'
    console.error(errorTitle, API_RFC_MINI_INDEX_PATH, { json, validationError })
    throw Error(`${errorTitle}. See console for more. ${JSON.stringify(validationError)} `)
  }
  return validatedRfcMiniIndex
})

if (error.value) {
  console.error(error.value)
  throw createError({
    status: 500,
    statusText: `The RFC index is temporarily unavailable. Please try again later.`,
    fatal: true,
  })
}

definePageMeta({
  layout: false
})

const modifiedDateTime =
  rfcIndex.value ?
    DateTime.fromISO(rfcIndex.value.createdOn)
    : undefined

useRfcEditorHead({
  title: 'RFC Index',
  canonicalPath,
  description: 'Every RFC',
  modifiedDateTime,
  contentType: 'article',
})
</script>
