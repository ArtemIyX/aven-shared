<script setup lang="ts">
import type { AvenStatProps, AvenStatSlots } from './types.js'
import AvenFormattedValue from './AvenFormattedValue.vue'
withDefaults(defineProps<AvenStatProps>(), {
  tone: 'neutral',
  trend: 'flat',
  format: 'number',
  unstyled: false,
})
defineSlots<AvenStatSlots>()
</script>
<template>
  <article
    v-bind="ui?.root?.attrs"
    :class="['aven-stat', `tone-${tone}`, { 'is-unstyled': unstyled }, ui?.root?.class]"
    :style="ui?.root?.style"
  >
    <p
      v-bind="ui?.label?.attrs"
      :class="['stat-label', ui?.label?.class]"
      :style="ui?.label?.style"
    >
      {{ label }}
    </p>
    <p
      v-bind="ui?.value?.attrs"
      :class="['stat-value', ui?.value?.class]"
      :style="ui?.value?.style"
    >
      <slot :value="value"
        ><AvenFormattedValue :value="value" :kind="format" :currency="currency" :locale="locale"
      /></slot>
    </p>
    <p
      v-bind="ui?.trend?.attrs"
      v-if="trendLabel || $slots.trend"
      :class="['stat-trend', ui?.trend?.class]"
      :style="ui?.trend?.style"
    >
      <slot name="trend" :trend="trend"
        ><span aria-hidden="true">{{ trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→' }}</span>
        {{ trendLabel }}</slot
      >
    </p>
    <p
      v-bind="ui?.description?.attrs"
      v-if="description"
      :class="['stat-description', ui?.description?.class]"
      :style="ui?.description?.style"
    >
      {{ description }}
    </p>
  </article>
</template>
<style scoped>
.aven-stat {
  display: grid;
  gap: var(--aven-space-2);
  min-inline-size: 0;
  padding: var(--aven-space-4);
  border: 0.0625rem solid var(--aven-color-border-subtle);
  border-radius: var(--aven-radius-lg);
  background: var(--aven-color-surface-card);
  color: var(--aven-color-text-primary);
}
.stat-label,
.stat-value,
.stat-trend,
.stat-description {
  margin: 0;
}
.stat-label {
  color: var(--aven-color-text-secondary);
  font-size: 0.875rem;
}
.stat-value {
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 650;
  line-height: 1.2;
  overflow-wrap: anywhere;
}
.stat-trend {
  font-size: 0.875rem;
}
.stat-description {
  color: var(--aven-color-text-secondary);
  font-size: 0.8125rem;
}
.tone-success .stat-trend {
  color: var(--aven-color-success-text);
}
.tone-danger .stat-trend,
.tone-critical .stat-trend {
  color: var(--aven-color-danger-text);
}
.is-unstyled {
  gap: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
}
</style>
