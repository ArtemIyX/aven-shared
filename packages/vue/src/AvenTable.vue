<script setup lang="ts">
import { onBeforeUnmount, onMounted, onUpdated, ref, useAttrs } from 'vue'
import type { AvenTableProps, AvenTableSlots } from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenTableProps>(), {
  density: 'comfortable',
  bordered: false,
  striped: false,
  stickyHeader: false,
  unstyled: false,
})
defineSlots<AvenTableSlots>()
const attrs = useAttrs()
const viewport = ref<HTMLElement | null>(null)
const hasStartScroll = ref(false)
const hasEndScroll = ref(false)
let resizeObserver: ResizeObserver | undefined

function updateScrollShadows() {
  const element = viewport.value
  if (!element) return
  const maxScroll = Math.max(0, element.scrollWidth - element.clientWidth)
  hasStartScroll.value = maxScroll > 1 && element.scrollLeft > 1
  hasEndScroll.value = maxScroll > 1 && element.scrollLeft < maxScroll - 1
}

onMounted(() => {
  updateScrollShadows()
  if (typeof ResizeObserver !== 'undefined' && viewport.value) {
    resizeObserver = new ResizeObserver(updateScrollShadows)
    resizeObserver.observe(viewport.value)
  }
})
onUpdated(updateScrollShadows)
onBeforeUnmount(() => resizeObserver?.disconnect())
</script>

<template>
  <div
    v-bind="{ ...attrs, ...props.ui?.root?.attrs }"
    :role="props.label ? 'region' : undefined"
    :aria-label="props.label"
    :class="[
      'aven-table-scroll',
      {
        'is-unstyled': props.unstyled,
        'has-start-scroll': hasStartScroll,
        'has-end-scroll': hasEndScroll,
      },
      attrs.class,
      props.ui?.root?.class,
    ]"
    :style="[attrs.style, props.ui?.root?.style]"
  >
    <div ref="viewport" class="aven-table-viewport" @scroll="updateScrollShadows">
      <table
        :class="[
          'aven-table',
          `is-${props.density}`,
          {
            'is-bordered': props.bordered,
            'is-striped': props.striped,
            'has-sticky-header': props.stickyHeader,
            'is-unstyled': props.unstyled,
          },
          props.ui?.table?.class,
        ]"
        v-bind="props.ui?.table?.attrs"
        :style="props.ui?.table?.style"
      >
        <caption
          v-if="props.caption || $slots.caption"
          v-bind="props.ui?.caption?.attrs"
          :class="props.ui?.caption?.class"
          :style="props.ui?.caption?.style"
        >
          <slot name="caption">{{ props.caption }}</slot>
        </caption>
        <slot />
      </table>
    </div>
    <span v-if="hasStartScroll" class="scroll-shadow scroll-shadow-start" aria-hidden="true" />
    <span v-if="hasEndScroll" class="scroll-shadow scroll-shadow-end" aria-hidden="true" />
  </div>
</template>

<style scoped>
.aven-table-scroll {
  position: relative;
  max-inline-size: 100%;
  min-inline-size: 0;
  color: var(--aven-color-text-primary);
}
.aven-table-viewport {
  max-inline-size: 100%;
  overflow: auto;
}
.scroll-shadow {
  position: absolute;
  inset-block: 0;
  z-index: 4;
  inline-size: 0.65rem;
  pointer-events: none;
}
.scroll-shadow-start {
  inset-inline-start: 0;
  box-shadow: inset 5px 0 7px -6px var(--aven-color-shadow-ambient);
}
.scroll-shadow-end {
  inset-inline-end: 0;
  box-shadow: inset -5px 0 7px -6px var(--aven-color-shadow-ambient);
}
:dir(rtl) .scroll-shadow-start {
  box-shadow: inset -5px 0 7px -6px var(--aven-color-shadow-ambient);
}
:dir(rtl) .scroll-shadow-end {
  box-shadow: inset 5px 0 7px -6px var(--aven-color-shadow-ambient);
}
.is-unstyled .scroll-shadow {
  display: none;
}
.aven-table {
  --aven-table-padding: var(--aven-space-3) var(--aven-space-4);
  --aven-table-row: var(--aven-color-surface-table-body);
  inline-size: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: var(--aven-color-surface-table-body);
  color: inherit;
  text-align: start;
}
.is-compact {
  --aven-table-padding: var(--aven-space-2) var(--aven-space-3);
}
.aven-table th,
.aven-table td {
  padding: var(--aven-table-padding);
  border-block-end: 1px solid var(--aven-color-separator-row);
  text-align: start;
  vertical-align: middle;
}
.aven-table th {
  background: var(--aven-color-surface-raised);
  font-weight: var(--aven-font-weight-semibold);
}
.is-striped tbody tr:nth-child(even) {
  background: var(--aven-color-surface-row-alternate);
}
.is-bordered th,
.is-bordered td {
  border-inline-end: 1px solid var(--aven-color-separator-column);
}
.has-sticky-header thead th {
  position: sticky;
  inset-block-start: 0;
  z-index: 1;
}
.aven-table caption {
  padding: var(--aven-space-3) var(--aven-space-4);
  color: var(--aven-color-text-secondary);
  text-align: start;
}
.is-unstyled {
  background: transparent;
}
.is-unstyled th,
.is-unstyled td {
  border-color: transparent;
  background: transparent;
}
@media (forced-colors: active) {
  .aven-table th,
  .aven-table td {
    border-color: CanvasText;
  }
  .is-striped tbody tr:nth-child(even) {
    outline: 1px solid CanvasText;
  }
}
@media print {
  .aven-table-scroll {
    overflow: visible;
  }
  .aven-table-viewport {
    overflow: visible;
  }
  .aven-table {
    color: #000;
    background: transparent;
  }
  .aven-table th,
  .aven-table td {
    border-color: #777;
    background: transparent;
  }
}
</style>
