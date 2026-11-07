<script setup lang="ts" generic="Key extends string | number = string">
import { computed, shallowRef, useAttrs } from 'vue'
import type {
  AvenChartLegendEvents,
  AvenChartLegendItem,
  AvenChartLegendProps,
  AvenChartLegendSlots,
} from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenChartLegendProps<Key>>(), {
  interactive: false,
  orientation: 'horizontal',
  defaultHiddenKeys: () => [],
  label: 'Chart series',
  unstyled: false,
})
const emit = defineEmits<AvenChartLegendEvents<Key>>()
defineSlots<AvenChartLegendSlots<Key>>()
const attrs = useAttrs()
const localHidden = shallowRef<Key[]>([
  ...props.defaultHiddenKeys,
  ...props.items.filter((item) => item.hidden).map((item) => item.key),
])
const hiddenKeys = computed(() => props.hiddenKeys ?? localHidden.value)
const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return { ...rest, ...props.ui?.root?.attrs }
})
function visible(item: AvenChartLegendItem<Key>) {
  return !hiddenKeys.value.some((key) => Object.is(key, item.key))
}
function toggle(item: AvenChartLegendItem<Key>) {
  if (!props.interactive || item.disabled) return
  const nextVisible = !visible(item)
  if (props.hiddenKeys === undefined) {
    localHidden.value = nextVisible
      ? localHidden.value.filter((key) => !Object.is(key, item.key))
      : [...localHidden.value, item.key]
  }
  emit('toggleSeries', { key: item.key, visible: nextVisible })
}
function seriesStyle(item: AvenChartLegendItem<Key>) {
  const token =
    item.colorToken && /^--aven-color-chart-[a-z\d-]+$/i.test(item.colorToken)
      ? `var(${item.colorToken})`
      : 'var(--aven-color-chart-series-01, var(--aven-color-accent-border))'
  return { '--aven-chart-legend-series-color': token }
}
</script>
<template>
  <ul
    v-bind="rootAttrs"
    :class="[
      'aven-chart-legend',
      `is-${orientation}`,
      { 'is-interactive': interactive, 'is-unstyled': unstyled },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[attrs.style, ui?.root?.style]"
    :aria-label="label"
  >
    <li
      v-for="item in items"
      :key="item.key"
      :class="[
        'legend-item',
        { 'is-hidden': !visible(item), 'is-disabled': item.disabled },
        ui?.item?.class,
      ]"
      :style="[seriesStyle(item), ui?.item?.style]"
      v-bind="ui?.item?.attrs"
    >
      <slot name="item" :item="item" :visible="visible(item)" :toggle="() => toggle(item)">
        <button
          v-if="interactive"
          type="button"
          class="legend-action"
          :aria-pressed="visible(item)"
          :disabled="item.disabled"
          @click="toggle(item)"
        >
          <span
            class="legend-marker"
            :class="[`shape-${item.shape ?? 'circle'}`, ui?.marker?.class]"
            :style="ui?.marker?.style"
            v-bind="ui?.marker?.attrs"
            aria-hidden="true"
          />
          <span>{{ item.label }}</span
          ><span v-if="item.value !== undefined" class="legend-value">{{ item.value }}</span>
        </button>
        <span v-else class="legend-label"
          ><span
            class="legend-marker"
            :class="[`shape-${item.shape ?? 'circle'}`, ui?.marker?.class]"
            :style="ui?.marker?.style"
            v-bind="ui?.marker?.attrs"
            aria-hidden="true"
          />{{ item.label
          }}<span v-if="item.value !== undefined" class="legend-value">{{ item.value }}</span></span
        >
      </slot>
    </li>
  </ul>
</template>
<style scoped>
.aven-chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--aven-chart-legend-gap, var(--aven-space-3));
  min-inline-size: 0;
  margin: 0;
  padding: 0;
  color: var(--aven-color-chart-legend, var(--aven-color-text-secondary));
  list-style: none;
}
.is-vertical {
  flex-direction: column;
  align-items: flex-start;
}
.legend-label,
.legend-action {
  display: inline-flex;
  align-items: center;
  gap: var(--aven-space-2);
  min-inline-size: 0;
  max-inline-size: 100%;
  overflow-wrap: anywhere;
}
.legend-action {
  min-block-size: 2.75rem;
  padding: var(--aven-space-1) var(--aven-space-2);
  border: 0;
  border-radius: var(--aven-radius-sm);
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: pointer;
}
.legend-action:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 2px;
}
.legend-marker {
  flex: none;
  inline-size: 0.7rem;
  block-size: 0.7rem;
  border-radius: 50%;
  background: var(--aven-chart-legend-series-color);
}
.shape-square {
  border-radius: 0;
}
.shape-diamond {
  border-radius: 0;
  transform: rotate(45deg) scale(0.8);
}
.shape-line {
  inline-size: 1rem;
  block-size: 0.2rem;
  border-radius: 0;
}
.is-hidden {
  color: var(--aven-color-chart-legend-hidden, var(--aven-color-text-tertiary));
  text-decoration: line-through;
}
.is-hidden .legend-marker {
  background: transparent;
  outline: 1px solid currentColor;
}
.legend-value {
  color: var(--aven-color-text-primary);
  font-variant-numeric: tabular-nums;
}
.is-unstyled .legend-action {
  padding: 0;
}
.is-unstyled .legend-marker {
  outline: 1px solid currentColor;
}
@media (forced-colors: active) {
  .legend-marker {
    border: 1px solid CanvasText;
    background: CanvasText;
  }
  .is-hidden .legend-marker {
    background: Canvas;
  }
}
</style>
