<script setup lang="ts">
import { useAttrs } from 'vue'
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
</script>

<template>
  <div
    v-bind="{ ...attrs, ...props.ui?.root?.attrs }"
    :role="props.label ? 'region' : undefined"
    :aria-label="props.label"
    :class="[
      'aven-table-scroll',
      { 'is-unstyled': props.unstyled },
      attrs.class,
      props.ui?.root?.class,
    ]"
    :style="[attrs.style, props.ui?.root?.style]"
  >
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
      :style="props.ui?.table?.style"
    >
      <caption
        v-if="props.caption || $slots.caption"
        :class="props.ui?.caption?.class"
        :style="props.ui?.caption?.style"
      >
        <slot name="caption">{{ props.caption }}</slot>
      </caption>
      <slot />
    </table>
  </div>
</template>

<style scoped>
.aven-table-scroll {
  max-inline-size: 100%;
  overflow: auto;
  color: var(--aven-color-text-primary);
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
