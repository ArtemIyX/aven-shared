<script setup lang="ts">
import type { AvenFilterChipEvents, AvenFilterChipProps, AvenFilterChipSlots } from './types.js'
const props = withDefaults(defineProps<AvenFilterChipProps>(), {
  disabled: false,
  unstyled: false,
})
const emit = defineEmits<AvenFilterChipEvents>()
defineSlots<AvenFilterChipSlots>()
function displayValue() {
  const value = props.filter.value
  return Array.isArray(value) ? value.join(', ') : value === null ? '' : String(value)
}
function remove(originalEvent: MouseEvent) {
  if (!props.disabled) emit('remove', { id: props.filter.id, originalEvent })
}
</script>
<template>
  <span
    :class="['aven-filter-chip', { 'is-unstyled': unstyled }, ui?.root?.class]"
    :style="ui?.root?.style"
    v-bind="ui?.root?.attrs"
  >
    <span
      :class="['filter-label', ui?.label?.class]"
      :style="ui?.label?.style"
      v-bind="ui?.label?.attrs"
    >
      <slot :filter="filter" :definition="definition">
        <strong>{{ definition?.label ?? filter.field }}</strong> {{ filter.operator }}
        {{ displayValue() }}
      </slot>
    </span>
    <button
      type="button"
      :class="['filter-remove', ui?.remove?.class]"
      :style="ui?.remove?.style"
      v-bind="ui?.remove?.attrs"
      :disabled="disabled"
      :aria-label="removeLabel ?? `Remove ${definition?.label ?? filter.field} filter`"
      @click="remove($event)"
    >
      <slot name="remove-icon">×</slot>
    </button>
  </span>
</template>
<style scoped>
.aven-filter-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--aven-space-1);
  max-inline-size: 100%;
  min-block-size: 2rem;
  padding-inline-start: var(--aven-space-2);
  border: 0.0625rem solid var(--aven-filter-chip-border, var(--aven-color-border-subtle));
  border-radius: var(--aven-filter-chip-radius, 999rem);
  background: var(--aven-filter-chip-bg, var(--aven-color-surface-subtle));
  color: var(--aven-filter-chip-fg, var(--aven-color-text-primary));
}
.filter-label {
  min-inline-size: 0;
  overflow-wrap: anywhere;
}
.filter-remove {
  display: inline-grid;
  flex: none;
  place-items: center;
  inline-size: 2.75rem;
  min-block-size: 2.75rem;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.filter-remove:focus-visible {
  outline: 0.125rem solid var(--aven-filter-focus, var(--aven-color-focus-ring));
  outline-offset: -0.125rem;
}
.filter-remove:disabled {
  color: var(--aven-color-text-disabled);
  cursor: not-allowed;
}
.is-unstyled {
  border: 0;
  border-radius: 0;
  background: transparent;
}
@media (forced-colors: active) {
  .aven-filter-chip {
    border-color: CanvasText;
  }
}
</style>
