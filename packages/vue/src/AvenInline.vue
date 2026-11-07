<script setup lang="ts">
import type { AvenUi } from './types.js'
withDefaults(
  defineProps<{
    as?: 'div' | 'section' | 'nav' | 'ul' | 'ol'
    gap?: string | number
    align?: 'start' | 'center' | 'end' | 'stretch'
    justify?: 'start' | 'center' | 'end' | 'between'
    wrap?: boolean
    unstyled?: boolean
    ui?: AvenUi<'root'>
  }>(),
  { as: 'div', gap: 'space-3', align: 'center', justify: 'start', wrap: true, unstyled: false },
)
function gapValue(value: string | number): string {
  return typeof value === 'number'
    ? `${value}px`
    : value.startsWith('space-')
      ? `var(--aven-${value})`
      : value
}
</script>
<template>
  <component
    :is="as"
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
