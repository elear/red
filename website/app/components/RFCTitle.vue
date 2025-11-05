<template>
    <component :is="formattedTitle" />: {{ props.rfc.title }}
</template>

<script setup lang="ts">
import { formatTitleAsVNode } from '~/utilities/rfc'

type Props = {
    rfc: {
        number: number
        title: string
    }
}

const props = defineProps<Props>()

const formattedTitle = computed(() => formatTitleAsVNode(`rfc${props.rfc.number}`))
</script>