<script setup lang="ts">
import type { AvenUi } from './types.js'
withDefaults(
  defineProps<{
    orientation?: 'horizontal' | 'vertical'
    decorative?: boolean
    inset?: string
    unstyled?: boolean
    ui?: AvenUi<'root' | 'label'>
  }>(),
  { orientation: 'horizontal', decorative: true, unstyled: false },
)
</script>
<template>
  <div
    :class="['aven-separator', `is-${orientation}`, { 'is-unstyled': unstyled }, ui?.root?.class]"
    :style="[{ marginInlineStart: inset }, ui?.root?.style]"
    :role="decorative ? undefined : 'separator'"
    :aria-orientation="decorative ? undefined : orientation"
    :aria-hidden="decorative || undefined"
  >
    <span v-if="$slots.label" :class="ui?.label?.class"><slot name="label" /></span><slot />
  </div>
</template>
<style scoped>
.aven-separator {
  display: flex;
  align-items: center;
  gap: var(--aven-space-3);
  color: var(--aven-color-text-secondary);
}
.aven-separator::before,
.aven-separator::after {
  content: '';
  flex: 1;
  background: var(--aven-color-border-subtle);
}
.is-horizontal {
  inline-size: 100%;
  min-block-size: 1px;
}
.is-horizontal::before,
.is-horizontal::after {
  block-size: 1px;
}
.is-vertical {
  align-self: stretch;
  flex-direction: column;
  min-inline-size: 1px;
}
.is-vertical::before,
.is-vertical::after {
  inline-size: 1px;
}
.is-unstyled::before,
.is-unstyled::after {
  display: none;
}
</style>
