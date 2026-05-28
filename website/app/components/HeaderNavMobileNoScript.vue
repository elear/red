<template>
  <div v-html="noScriptHtml" class="w-full lg:hidden px-7 py-2 text-sm"></div>
</template>

<script setup lang="ts">
import { renderNoScriptMenuItem, useMenuData } from './HeaderNavData'
import { useFeatureFlags } from '~/utilities/feature-flags'

const menuData = useMenuData("mobile")

const featureFlags = useFeatureFlags()

// Vue can't render <noscript> elements except in `v-html`, so we need to generate
// a menu in basic menu in HTML on the server
const noScriptHtml = computed(() => {
  if (!featureFlags.value.isMockNonJSMenu) {
    return ''
  }
  return `<div data-element-will-be-noscript><ul>${menuData.value.map(menuItem => renderNoScriptMenuItem(menuItem, {
    renderListDisc: true,
    menuHeaderTopSpacing: true
  })).join('')}</ul></div>`
})
</script>
