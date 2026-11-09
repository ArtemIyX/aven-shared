<script setup lang="ts">
import { computed, useAttrs, type Component } from 'vue'
import { cssPixelsToRem } from './cssLength.js'
import { useAvenConfig } from './provider.js'
import type { AvenIconRuntimeProps, AvenIconSlots } from './types.js'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenIconRuntimeProps>(), {
  size: 'md',
  strokeWidth: 2,
  decorative: true,
  spin: false,
  unstyled: false,
})
defineSlots<AvenIconSlots>()
const attrs = useAttrs()
const config = useAvenConfig()
const resolved = computed(() =>
  props.name ? (config.resolveIcon?.(props.name) as Component | undefined) : undefined,
)
const style = computed(() => [
  typeof props.size === 'number' ? { '--aven-icon-size': cssPixelsToRem(props.size) } : undefined,
  { '--aven-icon-stroke-width': props.strokeWidth },
  attrs.style,
  props.ui?.root?.style,
])
const forwardedAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return { ...rest, ...props.ui?.root?.attrs }
})
</script>
<template>
  <span
    v-bind="{ ...ui?.root?.attrs, ...forwardedAttrs }"
    :class="[
      'aven-icon',
      typeof size === 'string' ? `size-${size}` : null,
      tone && `tone-${tone}`,
      { 'is-spinning': spin, 'is-unstyled': unstyled },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="style"
    :aria-hidden="decorative ? true : undefined"
    :role="decorative ? undefined : 'img'"
    :aria-label="decorative ? undefined : label"
    ><component
      :is="resolved"
      v-if="resolved"
      v-bind="ui?.svg?.attrs"
      :class="ui?.svg?.class"
      :style="ui?.svg?.style" /><slot v-else
  /></span>
</template>
<style scoped>
.aven-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  inline-size: var(--aven-icon-size, 1em);
  block-size: var(--aven-icon-size, 1em);
  flex: none;
  color: var(--aven-icon-color, var(--aven-color-icon-primary));
  vertical-align: middle;
}
.size-xs {
  --aven-icon-size: 0.75rem;
}
.size-sm {
  --aven-icon-size: 1rem;
}
.size-md {
  --aven-icon-size: 1.25rem;
}
.size-lg {
  --aven-icon-size: 1.5rem;
}
.aven-icon :deep(svg) {
  inline-size: 100%;
  block-size: 100%;
  stroke-width: var(--aven-icon-stroke-width, 2);
  fill: currentColor;
}
.tone-accent {
  color: var(--aven-color-accent-text);
}
.tone-secondary {
  color: var(--aven-color-secondary-text);
}
.tone-info {
  color: var(--aven-color-info-text);
}
.tone-success {
  color: var(--aven-color-success-text);
}
.tone-warning {
  color: var(--aven-color-warning-text);
}
.tone-danger {
  color: var(--aven-color-danger-text);
}
.tone-critical {
  color: var(--aven-color-critical-text);
}
.is-spinning {
  animation: spin 0.8s linear infinite;
}
.is-unstyled {
  color: inherit;
  animation: none;
}
@keyframes spin {
  to {
    transform: rotate(1turn);
  }
}
@media (prefers-reduced-motion: reduce) {
  .is-spinning {
    animation: none;
  }
}
</style>
