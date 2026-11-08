<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import type { AvenChartFrameEvents, AvenChartFrameProps, AvenChartFrameSlots } from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenChartFrameProps>(), {
  loading: false,
  unstyled: false,
  retryLabel: 'Retry',
  loadingLabel: 'Loading chart',
  emptyLabel: 'No chart data available',
})
const emit = defineEmits<AvenChartFrameEvents>()
defineSlots<AvenChartFrameSlots>()
const attrs = useAttrs()
const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return { ...rest, ...props.ui?.root?.attrs }
})
const errorText = computed(() => (props.error instanceof Error ? props.error.message : props.error))
const ratio = computed(() => {
  const value = props.aspectRatio
  return value && Number.isFinite(value) && value > 0 ? String(value) : undefined
})
const themeScope = computed(() => ({
  theme: props.theme ?? attrs['data-aven-theme'] ?? attrs.theme,
  dir: attrs.dir,
}))
function retry(originalEvent: MouseEvent) {
  if (!props.disabled && !props.loading && errorText.value) emit('retry', { originalEvent })
}
</script>
<template>
  <figure
    v-bind="{ ...ui?.root?.attrs, ...rootAttrs }"
    :class="['aven-chart-frame', { 'is-unstyled': unstyled }, attrs.class, ui?.root?.class]"
    :style="[{ '--aven-chart-frame-ratio': ratio }, attrs.style, ui?.root?.style]"
    :aria-busy="loading || undefined"
    :data-aven-theme="theme ?? attrs['data-aven-theme']"
  >
    <figcaption
      v-if="title || description || $slots.title || $slots.description"
      class="chart-heading"
    >
      <h2 v-if="title || $slots.title">
        <slot name="title" :title="title">{{ title }}</slot>
      </h2>
      <slot name="description" :description="description">
        <p v-if="description">{{ description }}</p>
      </slot>
    </figcaption>
    <div
      class="chart-surface"
      :class="ui?.surface?.class"
      :style="ui?.surface?.style"
      v-bind="ui?.surface?.attrs"
    >
      <div v-if="loading" class="chart-state" role="status" aria-live="polite">
        <slot name="loading">{{ loadingLabel }}</slot>
      </div>
      <div v-else-if="errorText" class="chart-state chart-error" role="alert">
        <slot name="error" :error="error" :retry="retry">
          <p>{{ errorText }}</p>
          <button type="button" :disabled="disabled" @click="retry">{{ retryLabel }}</button>
        </slot>
      </div>
      <div v-else-if="empty" class="chart-state">
        <slot name="empty">{{ emptyLabel }}</slot>
      </div>
      <div v-else class="chart-content">
        <slot :theme="themeScope" />
        <slot name="tooltip" :items="tooltipItems ?? []" />
      </div>
    </div>
    <div v-if="$slots.legend" class="chart-legend">
      <slot name="legend" :items="legendItems ?? []" />
    </div>
    <div v-if="$slots['accessible-table']" class="chart-accessible-table">
      <slot name="accessible-table" />
    </div>
  </figure>
</template>
<style scoped>
.aven-chart-frame {
  min-inline-size: 0;
  margin: 0;
  color: var(--aven-color-chart-label, var(--aven-color-text-primary));
}
.chart-heading {
  margin-block-end: var(--aven-space-3);
  overflow-wrap: anywhere;
}
.chart-heading h2,
.chart-heading p {
  margin: 0;
}
.chart-heading p {
  margin-block-start: var(--aven-space-1);
  color: var(--aven-color-text-secondary);
}
.chart-surface {
  position: relative;
  min-inline-size: 0;
  aspect-ratio: var(--aven-chart-frame-ratio, auto);
  overflow: auto;
  border: 1px solid
    var(--aven-chart-frame-border, var(--aven-color-chart-frame, var(--aven-color-border-subtle)));
  border-radius: var(--aven-chart-frame-radius, var(--aven-radius-md));
  background: var(
    --aven-chart-frame-bg,
    var(--aven-color-chart-background, var(--aven-color-surface-chart))
  );
}
.chart-content {
  min-inline-size: 0;
  min-block-size: 8rem;
}
.chart-state {
  display: grid;
  min-block-size: 8rem;
  place-content: center;
  gap: var(--aven-space-2);
  padding: var(--aven-space-4);
  color: var(--aven-color-chart-label, var(--aven-color-text-secondary));
  text-align: center;
  overflow-wrap: anywhere;
}
.chart-state p {
  margin: 0;
}
.chart-state button {
  min-block-size: 2.75rem;
  justify-self: center;
  padding-inline: var(--aven-space-3);
  border: 1px solid var(--aven-color-chart-frame, var(--aven-color-border-default));
  border-radius: var(--aven-radius-sm);
  background: var(--aven-color-surface-card);
  color: var(--aven-color-text-primary);
  font: inherit;
}
.chart-state button:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 2px;
}
.chart-legend,
.chart-accessible-table {
  min-inline-size: 0;
  margin-block-start: var(--aven-space-3);
}
.is-unstyled .chart-surface {
  border: 0;
  border-radius: 0;
  background: transparent;
}
@media (forced-colors: active) {
  .chart-surface,
  .chart-state button {
    border-color: CanvasText;
  }
}
@media print {
  .chart-surface {
    overflow: visible;
    border-color: CanvasText;
  }
}
</style>
