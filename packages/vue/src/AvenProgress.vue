<script setup lang="ts">
import { computed } from 'vue'
import type { AvenProgressSlots, AvenUi } from './types.js'
defineSlots<AvenProgressSlots>()
const props = withDefaults(
  defineProps<{
    value: number | null
    min?: number
    max?: number
    label?: string
    showValue?: boolean
    formatValue?: (value: number, percent: number) => string
    unstyled?: boolean
    ui?: AvenUi<'root' | 'track' | 'fill' | 'value'>
  }>(),
  { min: 0, max: 100, showValue: false, unstyled: false },
)
const percent = computed(() =>
  props.value === null
    ? null
    : Math.max(0, Math.min(100, ((props.value - props.min) / (props.max - props.min)) * 100)),
)
const text = computed(() =>
  props.value === null
    ? ''
    : (props.formatValue?.(props.value, percent.value ?? 0) ??
      `${Math.round(percent.value ?? 0)}%`),
)
</script>
<template>
  <div
    v-bind="ui?.root?.attrs"
    :class="['aven-progress', { 'is-unstyled': unstyled }, ui?.root?.class]"
    :style="ui?.root?.style"
    role="progressbar"
    :aria-label="label"
    :aria-valuemin="min"
    :aria-valuemax="max"
    :aria-valuenow="value === null ? undefined : value"
    :aria-valuetext="value === null ? undefined : text"
  >
    <span v-if="$slots.label" class="progress-label"
      ><slot name="label" :value="value" :percent="percent"
    /></span>
    <div
      v-bind="ui?.track?.attrs"
      :class="['progress-track', ui?.track?.class]"
      :style="ui?.track?.style"
    >
      <div
        v-bind="ui?.fill?.attrs"
        :class="['progress-fill', { 'is-indeterminate': value === null }, ui?.fill?.class]"
        :style="[{ inlineSize: percent === null ? undefined : `${percent}%` }, ui?.fill?.style]"
      />
    </div>
    <span
      v-bind="ui?.value?.attrs"
      v-if="showValue && value !== null"
      :class="['progress-value', ui?.value?.class]"
      ><slot name="value" :value="value" :percent="percent ?? 0">{{ text }}</slot></span
    >
  </div>
</template>
<style scoped>
.aven-progress {
  display: flex;
  align-items: center;
  gap: var(--aven-space-3);
  min-inline-size: 0;
}
.progress-track {
  overflow: hidden;
  flex: 1;
  block-size: 0.5rem;
  border-radius: 999rem;
  background: var(--aven-color-surface-recessed);
}
.progress-fill {
  block-size: 100%;
  border-radius: inherit;
  background: var(--aven-color-accent-solid);
  transition: inline-size 0.2s ease;
}
.is-indeterminate {
  inline-size: 35%;
  animation: progress 1.4s ease-in-out infinite;
}
.progress-value {
  font-variant-numeric: tabular-nums;
  color: var(--aven-color-text-secondary);
  font-size: var(--aven-font-size-sm);
}
.is-unstyled .progress-track {
  border-radius: 0;
  background: transparent;
  border: 0.0625rem solid currentColor;
}
.is-unstyled .progress-fill {
  background: currentColor;
}
@keyframes progress {
  from {
    transform: translateX(-110%);
  }
  to {
    transform: translateX(300%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .progress-fill {
    transition: none;
  }
  .is-indeterminate {
    animation: none;
    inline-size: 100%;
    opacity: 0.6;
  }
}
</style>
