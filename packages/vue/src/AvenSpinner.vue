<script setup lang="ts">
import { computed } from 'vue'
import type { AvenUi } from './types.js'
withDefaults(
  defineProps<{
    size?: 'xs' | 'sm' | 'md' | 'lg' | number
    label?: string
    unstyled?: boolean
    ui?: AvenUi<'root' | 'indicator'>
  }>(),
  { size: 'md', unstyled: false },
)
</script>
<template>
  <span
    v-bind="ui?.root?.attrs"
    :class="[
      'aven-spinner',
      { 'is-unstyled': unstyled },
      typeof size === 'string' ? `size-${size}` : null,
      ui?.root?.class,
    ]"
    :style="[
      typeof size === 'number' ? { inlineSize: `${size}px`, blockSize: `${size}px` } : undefined,
      ui?.root?.style,
    ]"
    role="status"
    :aria-label="label || undefined"
    ><span
      v-bind="ui?.indicator?.attrs"
      aria-hidden="true"
      :class="['spinner-indicator', ui?.indicator?.class]"
      :style="ui?.indicator?.style"
    /><span v-if="label || $slots.default" class="spinner-label"
      ><slot>{{ label }}</slot></span
    ></span
  >
</template>
<style scoped>
.aven-spinner {
  display: inline-flex;
  align-items: center;
  gap: var(--aven-space-2);
  color: var(--aven-color-accent-solid);
}
.spinner-indicator {
  inline-size: 1.25rem;
  block-size: 1.25rem;
  border: 2px solid currentColor;
  border-inline-end-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
.size-xs .spinner-indicator {
  inline-size: 0.75rem;
  block-size: 0.75rem;
}
.size-sm .spinner-indicator {
  inline-size: 1rem;
  block-size: 1rem;
}
.size-lg .spinner-indicator {
  inline-size: 1.75rem;
  block-size: 1.75rem;
}
.spinner-label {
  color: var(--aven-color-text-secondary);
  font-size: var(--aven-font-size-sm);
}
.is-unstyled .spinner-indicator {
  animation: none;
  border-inline-end-color: currentColor;
}
@keyframes spin {
  to {
    transform: rotate(1turn);
  }
}
@media (prefers-reduced-motion: reduce) {
  .spinner-indicator {
    animation: none;
    border-inline-end-color: transparent;
    border-top-color: transparent;
  }
}
</style>
