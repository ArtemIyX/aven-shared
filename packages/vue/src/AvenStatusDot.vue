<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import type { AvenStatusDotProps, AvenStatusDotSlots } from './types.js'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenStatusDotProps>(), {
  tone: 'neutral',
  size: 'sm',
  unstyled: false,
})
defineSlots<AvenStatusDotSlots>()
const attrs = useAttrs()
const forwardedAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return { ...rest, ...props.ui?.root?.attrs }
})
</script>
<template>
  <span
    v-bind="forwardedAttrs"
    :class="[
      'aven-status-dot',
      `tone-${tone}`,
      `size-${size}`,
      { 'is-unstyled': unstyled },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[attrs.style, ui?.root?.style]"
    ><span
      v-bind="ui?.dot?.attrs"
      aria-hidden="true"
      :class="['status-dot', ui?.dot?.class]"
      :style="ui?.dot?.style"
    /><span
      v-if="label || $slots.default"
      v-bind="ui?.label?.attrs"
      :class="ui?.label?.class"
      :style="ui?.label?.style"
      ><slot>{{ label }}</slot></span
    ><span v-else class="sr-only">{{ tone }} status</span></span
  >
</template>
<style scoped>
.aven-status-dot {
  --aven-status-dot-color: var(--aven-color-neutral-solid);
  --aven-status-dot-size: 0.55rem;
  --aven-status-dot-gap: 0.4rem;
  display: inline-flex;
  align-items: center;
  gap: var(--aven-status-dot-gap);
  color: var(--aven-color-text-primary);
}
.status-dot {
  inline-size: var(--aven-status-dot-size);
  block-size: var(--aven-status-dot-size);
  border-radius: 50%;
  background: var(--aven-status-dot-color);
}
.tone-neutral {
  --aven-status-dot-color: var(--aven-color-neutral-solid);
}
.tone-accent {
  --aven-status-dot-color: var(--aven-color-accent-solid);
}
.tone-secondary {
  --aven-status-dot-color: var(--aven-color-secondary-solid);
}
.tone-info {
  --aven-status-dot-color: var(--aven-color-info-solid);
}
.tone-success {
  --aven-status-dot-color: var(--aven-color-success-solid);
}
.tone-warning {
  --aven-status-dot-color: var(--aven-color-warning-solid);
}
.tone-danger {
  --aven-status-dot-color: var(--aven-color-danger-solid);
}
.tone-critical {
  --aven-status-dot-color: var(--aven-color-critical-solid);
}
.size-xs {
  --aven-status-dot-size: 0.4rem;
}
.size-sm {
  --aven-status-dot-size: 0.55rem;
}
.size-md {
  --aven-status-dot-size: 0.65rem;
}
.size-lg {
  --aven-status-dot-size: 0.75rem;
}
.is-unstyled .status-dot {
  background: currentColor;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
