<script setup lang="ts">
import type { AvenUi } from './types.js'
withDefaults(
  defineProps<{
    align?: 'start' | 'center' | 'end' | 'between'
    sticky?: boolean
    unstyled?: boolean
    ui?: AvenUi<'root' | 'secondary'>
  }>(),
  { align: 'end', sticky: false, unstyled: false },
)
</script>
<template>
  <div
    :class="[
      'aven-form-actions',
      `align-${align}`,
      { 'is-sticky': sticky, 'is-unstyled': unstyled },
      ui?.root?.class,
    ]"
    :style="ui?.root?.style"
  >
    <div v-if="$slots.secondary" :class="ui?.secondary?.class"><slot name="secondary" /></div>
    <div class="primary-actions"><slot /></div>
  </div>
</template>
<style scoped>
.aven-form-actions {
  display: flex;
  align-items: center;
  gap: var(--aven-space-3);
  padding-block-start: var(--aven-space-3);
}
.align-start {
  justify-content: flex-start;
}
.align-center {
  justify-content: center;
}
.align-end {
  justify-content: flex-end;
}
.align-between {
  justify-content: space-between;
}
.primary-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: var(--aven-space-3);
}
.is-sticky {
  position: sticky;
  inset-block-end: 0;
  z-index: 2;
  padding: var(--aven-space-3);
  border-block-start: 1px solid var(--aven-color-border-subtle);
  background: var(--aven-color-surface-base);
}
.is-unstyled {
  padding: 0;
  border: 0;
  background: transparent;
}
</style>
