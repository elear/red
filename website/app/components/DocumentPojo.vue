<template>
  <Component :is="vnodes" />
</template>

<script setup lang="ts">
import { renderDocumentPojo, defaultRenderer } from '~/utilities/renderDocumentPojo'
import type { ElementRenderers } from '~/utilities/renderDocumentPojo'
import type { DocumentPojo } from '~/utilities/rfc-validators'
import Anchor from '#components'

type Props = {
  value: DocumentPojo
}

const props = defineProps<Props>()

const renderer: ElementRenderers = {
  Anchor: (node, childrenForVue) => h(Anchor, node.attributes, childrenForVue),
  ...defaultRenderer
}

const vnodes = computed(() => renderDocumentPojo(props.value, renderer))
</script>
