<template>
  <table
    class="table-fixed w-full divide-y divide-gray-700 dark:divide-neutral-600 shadow border-1 border-separate border-gray-400 dark:border-gray-500 ml-2 mr-2">
    <thead>
      <tr>
        <TableCellHeader background="solid" class="w-[8em] text-nowrap">
          RFC Number
        </TableCellHeader>
        <TableCellHeader background="solid">
          Title
        </TableCellHeader>
        <TableCellHeader background="solid" class="w-[10em] text-nowrap">
          Publish date
        </TableCellHeader>
      </tr>
    </thead>
    <tbody>
      <tr v-for="rfc in rfcs" :key="rfc.number">
        <TableCell class="border-b border-gray-300 dark:border-neutral-600 text-nowrap">
          <Anchor
            :href="infoSeriesPathBuilder(`rfc${rfc.number}`)"
            :class="[ANCHOR_COLOR_TAILWIND_STYLE, 'scroll-m-16']"
            :id="`rfc${rfc.number}`"
          >
            <SubseriesTitle :series="parseSeriesId(`rfc${rfc.number}`)" />
          </Anchor>
        </TableCell>
        <TableCell class="border-b border-gray-400 dark:border-neutral-600">
          {{ rfc.title }}
        </TableCell>
        <TableCell class="border-b border-gray-300 dark:border-neutral-600 text-nowrap">
          <span v-if="rfc.published">{{ formatDate(rfc.published) }}</span>
          <i v-else>(unknown)</i>
        </TableCell>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon'
import { parseSeriesId } from '~/utilities/rfc'
import { formatDatePublished } from '~/utilities/rfc-converters-utils'
import { ANCHOR_COLOR_TAILWIND_STYLE } from '~/utilities/theme'
import { infoSeriesPathBuilder } from '~/utilities/url'

type RfcMiniItem = {
  number: number
  title: string
  published?: string
}

defineProps<{ rfcs: RfcMiniItem[] }>()

const formatDate = (published: string) => formatDatePublished(DateTime.fromISO(published), false)
</script>
