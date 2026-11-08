<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import type { AvenGridProps, AvenGridSlots } from './types.js'
const props = withDefaults(defineProps<AvenGridProps>(), {
  as: 'div',
  columns: 1,
  gap: 'space-4',
  unstyled: false,
})
defineSlots<AvenGridSlots>()
function gapValue(value: string | number): string {
  return typeof value === 'number'
    ? `${value}px`
    : value.startsWith('space-')
      ? `var(--aven-${value})`
      : value
}
const gridStyle = computed<CSSProperties>(() => {
  const c = typeof props.columns === 'number' ? { base: props.columns } : props.columns
  return {
    gap: gapValue(props.gap),
    gridTemplateColumns: 'repeat(var(--aven-grid-columns), minmax(0, 1fr))',
    '--aven-grid-columns': Math.max(1, c?.base ?? 1),
    '--aven-grid-columns-sm': Math.max(1, c?.sm ?? c?.base ?? 1),
    '--aven-grid-columns-md': Math.max(1, c?.md ?? c?.sm ?? c?.base ?? 1),
    '--aven-grid-columns-lg': Math.max(1, c?.lg ?? c?.md ?? c?.sm ?? c?.base ?? 1),
  } as CSSProperties
})
</script>
<template>
  <component
    :is="as"
    v-bind="ui?.root?.attrs"
    :class="['aven-grid', { 'is-unstyled': unstyled }, ui?.root?.class]"
    :style="[gridStyle, ui?.root?.style]"
    ><slot
  /></component>
</template>
<style scoped>
.aven-grid {
  display: grid;
  min-inline-size: 0;
}
@media (min-width: 40rem) {
  .aven-grid {
    --aven-grid-columns: var(--aven-grid-columns-sm);
  }
}
@media (min-width: 48rem) {
  .aven-grid {
    --aven-grid-columns: var(--aven-grid-columns-md);
  }
}
@media (min-width: 64rem) {
  .aven-grid {
    --aven-grid-columns: var(--aven-grid-columns-lg);
  }
}
.is-unstyled {
  gap: 0 !important;
}
</style>
