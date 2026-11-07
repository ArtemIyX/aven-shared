<script setup lang="ts">
import type { AvenUi } from './types.js'
withDefaults(
  defineProps<{
    as?: 'div' | 'section' | 'article' | 'ul' | 'ol'
    gap?: string | number
    align?: 'start' | 'center' | 'end' | 'stretch'
    justify?: 'start' | 'center' | 'end' | 'between'
    unstyled?: boolean
    ui?: AvenUi<'root'>
  }>(),
  { as: 'div', gap: 'space-4', align: 'stretch', justify: 'start', unstyled: false },
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
    :class="['aven-stack', { 'is-unstyled': unstyled }, ui?.root?.class]"
    :style="[
      {
        gap: gapValue(gap),
        alignItems: align,
        justifyContent: justify === 'between' ? 'space-between' : justify,
      },
      ui?.root?.style,
    ]"
    ><slot
  /></component>
</template>
<style scoped>
.aven-stack {
  display: flex;
  flex-direction: column;
  min-inline-size: 0;
}
.is-unstyled {
  gap: 0 !important;
}
</style>
