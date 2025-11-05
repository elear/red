<template>
    <ul class="flex flex-col gap-2 leading-[1.75]">
        <li
            v-for="(rfc, rfcIndex) in props.rfcs"
            :key="rfcIndex"
        >
            <Anchor
                :href="infoSeriesPathBuilder(`rfc${rfc.number}`)"
                :class="ANCHOR_TAILWIND_STYLE"
            >
                <RFCTitle :rfc="rfc" />
            </Anchor>
        </li>
    </ul>
</template>

<script setup lang="ts">
import { ANCHOR_TAILWIND_STYLE } from '~/utilities/theme'
import { infoSeriesPathBuilder } from '~/utilities/url'

type Props = {
    rfcs: {
        title: string
        number: number
    }[]
}

const props = defineProps<Props>()
</script>