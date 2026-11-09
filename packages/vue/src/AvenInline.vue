<script setup lang="ts">
import { cssPixelsToRem } from './cssLength.js'
import type { AvenInlineProps, AvenInlineSlots } from './types.js'
withDefaults(defineProps<AvenInlineProps>(), {
  as: 'div',
  gap: 'space-3',
  align: 'center',
  justify: 'start',
  wrap: true,
  unstyled: false,
})
defineSlots<AvenInlineSlots>()
function gapValue(value: string | number): string {
  return typeof value === 'number'
    ? cssPixelsToRem(value)
    : value.startsWith('space-')
      ? `var(--aven-${value})`
      : value
}
</script>
<template>
  <component
    :is="as"
    v-bind="ui?.root?.attrs"
    :class="['aven-inline', { 'is-unstyled': unstyled }, ui?.root?.class]"
    :style="[
      {
        gap: gapValue(gap),
        alignItems: align,
        justifyContent: justify === 'between' ? 'space-between' : justify,
        flexWrap: wrap ? 'wrap' : 'nowrap',
      },
      ui?.root?.style,
    ]"
    ><slot
  /></component>
</template>
<style scoped>
.aven-inline {
  display: flex;
  min-inline-size: 0;
}
.is-unstyled {
  gap: 0 !important;
}
</style>
