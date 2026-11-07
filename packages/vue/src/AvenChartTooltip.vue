<script setup lang="ts" generic="Key extends string | number = string">
import { computed, useAttrs } from 'vue'
import type { AvenChartTooltipItem, AvenChartTooltipProps, AvenChartTooltipSlots } from './types.js'

const props = withDefaults(defineProps<AvenChartTooltipProps<Key>>(), {
  placement: 'top',
  unstyled: false,
})
defineOptions({ inheritAttrs: false })
defineSlots<AvenChartTooltipSlots<Key>>()
const attrs = useAttrs()
const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return { ...rest, ...props.ui?.root?.attrs }
})
const coordinates = computed(() => ({
  '--aven-chart-tooltip-x': `${Math.max(0, props.x)}px`,
  '--aven-chart-tooltip-y': `${Math.max(0, props.y)}px`,
}))
</script>
<template>
  <div
    v-bind="{ ...ui?.root?.attrs, ...rootAttrs }"
    v-if="open && items.length"
    role="tooltip"
    :class="[
      'aven-chart-tooltip',
      `place-${placement}`,
      { 'is-unstyled': unstyled },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[coordinates, attrs.style, ui?.root?.style]"
    :aria-label="label"
  >
    <slot :items="items" :x="x" :y="y">
      <dl class="tooltip-items">
        <div
          v-for="item in items"
          :key="item.key"
          class="tooltip-row"
          :class="ui?.item?.class"
          :style="ui?.item?.style"
          v-bind="ui?.item?.attrs"
        >
          <dt>
            <span
              class="tooltip-marker"
              :style="{
                '--aven-chart-tooltip-series-color':
                  item.colorToken && /^--aven-color-chart-[a-z\d-]+$/i.test(item.colorToken)
                    ? `var(${item.colorToken})`
                    : 'var(--aven-color-chart-series-01, var(--aven-color-accent-border))',
              }"
              aria-hidden="true"
            />{{ item.label }}
          </dt>
          <dd>{{ item.value }}</dd>
        </div>
      </dl>
    </slot>
  </div>
</template>
<style scoped>
.aven-chart-tooltip {
  position: absolute;
  z-index: 2;
  inset-inline-start: var(--aven-chart-tooltip-x);
  inset-block-start: var(--aven-chart-tooltip-y);
  inline-size: max-content;
  max-inline-size: min(20rem, calc(100% - 1rem));
  padding: var(--aven-chart-tooltip-padding, var(--aven-space-3));
  border: 1px solid var(--aven-color-chart-tooltip-border, var(--aven-color-border-strong));
  border-radius: var(--aven-radius-sm);
  background: var(--aven-color-chart-tooltip-fill, var(--aven-color-surface-floating));
  color: var(--aven-color-chart-tooltip-text, var(--aven-color-text-primary));
  box-shadow: 0 3px 12px var(--aven-color-shadow-ambient);
  overflow-wrap: anywhere;
  pointer-events: none;
  transform: translate(-50%, -100%);
}
.place-bottom {
  transform: translate(-50%, 0);
}
.place-start {
  transform: translate(0, -50%);
}
.place-end {
  transform: translate(-100%, -50%);
}
.tooltip-items {
  display: grid;
  gap: var(--aven-space-1);
  margin: 0;
}
.tooltip-row {
  display: flex;
  justify-content: space-between;
  gap: var(--aven-space-3);
}
.tooltip-row dt {
  display: flex;
  align-items: center;
  gap: var(--aven-space-2);
  color: var(--aven-color-chart-legend, var(--aven-color-text-secondary));
}
.tooltip-row dd {
  margin: 0;
  font-variant-numeric: tabular-nums;
}
.tooltip-marker {
  flex: none;
  inline-size: 0.65rem;
  block-size: 0.65rem;
  border-radius: 50%;
  background: var(--aven-chart-tooltip-series-color);
}
.is-unstyled {
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}
@media (forced-colors: active) {
  .aven-chart-tooltip {
    border-color: CanvasText;
    box-shadow: none;
  }
  .tooltip-marker {
    outline: 1px solid CanvasText;
  }
}
@media print {
  .aven-chart-tooltip {
    position: static;
    transform: none;
    box-shadow: none;
  }
}
</style>
