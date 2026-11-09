<script setup lang="ts">
import type { AvenContainerProps, AvenContainerSlots } from './types.js'
import { cssPixelsToRem } from './cssLength.js'
withDefaults(defineProps<AvenContainerProps>(), {
  as: 'div',
  maxWidth: '72rem',
  gutter: 'space-4',
  centered: true,
  unstyled: false,
})
defineSlots<AvenContainerSlots>()
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
    :class="['aven-container', { 'is-unstyled': unstyled }, ui?.root?.class]"
    :style="[
      {
        maxInlineSize: unstyled ? 'none' : maxWidth,
        paddingInline: unstyled ? 0 : gapValue(gutter),
        marginInline: centered ? 'auto' : undefined,
      },
      ui?.root?.style,
    ]"
    ><slot
  /></component>
</template>
<style scoped>
.aven-container {
  box-sizing: border-box;
  inline-size: 100%;
  min-inline-size: 0;
}
.is-unstyled {
  padding-inline: 0 !important;
  margin-inline: 0 !important;
}
</style>
