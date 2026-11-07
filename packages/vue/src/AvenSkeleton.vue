<script setup lang="ts">
import type { AvenUi } from './types.js'
withDefaults(
  defineProps<{
    width?: string | number
    height?: string | number
    lines?: number
    shape?: 'rectangle' | 'circle' | 'rounded'
    animated?: boolean
    unstyled?: boolean
    ui?: AvenUi<'root' | 'line'>
  }>(),
  { lines: 1, shape: 'rectangle', animated: true, unstyled: false },
)
function dim(value?: string | number) {
  return typeof value === 'number' ? `${value}px` : value
}
</script>
<template>
  <div
    :class="[
      'aven-skeleton',
      `shape-${shape}`,
      { 'is-animated': animated, 'is-unstyled': unstyled },
      ui?.root?.class,
    ]"
    :style="[{ inlineSize: dim(width), blockSize: dim(height) }, ui?.root?.style]"
    aria-hidden="true"
  >
    <template v-for="i in Math.max(1, lines)" :key="i"
      ><span
        :class="['skeleton-line', ui?.line?.class]"
        :style="[
          i === lines && lines > 1 ? { inlineSize: '72%' } : undefined,
          ui?.line?.style,
        ]" /></template
    ><slot />
  </div>
</template>
<style scoped>
.aven-skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--aven-space-2);
  min-inline-size: 0;
}
.skeleton-line {
  display: block;
  inline-size: 100%;
  min-block-size: 0.8em;
  border-radius: var(--aven-radius-sm);
  background: var(--aven-color-surface-recessed);
}
.shape-circle {
  inline-size: 3rem;
  block-size: 3rem;
  border-radius: 50%;
  background: var(--aven-color-surface-recessed);
}
.shape-rounded .skeleton-line {
  border-radius: 999px;
}
.is-animated .skeleton-line,
.shape-circle.is-animated {
  background: linear-gradient(
    90deg,
    var(--aven-color-surface-recessed),
    var(--aven-color-surface-hover),
    var(--aven-color-surface-recessed)
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}
.is-unstyled .skeleton-line {
  animation: none;
  background: currentColor;
  opacity: 0.12;
}
@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .is-animated .skeleton-line,
  .shape-circle.is-animated {
    animation: none;
  }
}
</style>
