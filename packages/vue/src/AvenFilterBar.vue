<script setup lang="ts">
import { computed } from 'vue'
import AvenFilterChip from './AvenFilterChip.vue'
import type {
  AvenFilterDefinition,
  AvenFilterBarEvents,
  AvenFilterBarProps,
  AvenFilterBarSlots,
  AvenFilterValue,
} from './types.js'
const props = withDefaults(defineProps<AvenFilterBarProps>(), {
  disabled: false,
  loading: false,
  showClearAll: true,
  label: 'Filters',
  clearLabel: 'Clear all filters',
  unstyled: false,
})
const emit = defineEmits<AvenFilterBarEvents>()
defineSlots<AvenFilterBarSlots>()
const filterScopes = computed(() =>
  props.filters.map((filter) => ({
    filter,
    definition: props.definitions.find((definition) => definition.key === filter.field),
  })),
)
function removeHandler(filter: AvenFilterValue) {
  return (event: MouseEvent) => remove(filter, event)
}
function valueHandler(filter: AvenFilterValue) {
  return (value: AvenFilterValue['value']) => setValue(filter, value)
}
function operatorHandler(filter: AvenFilterValue) {
  return (operator: string) => setOperator(filter, operator)
}
function remove(filter: AvenFilterValue, originalEvent: MouseEvent) {
  if (props.disabled) return
  emit(
    'update:filters',
    props.filters.filter((candidate) => !Object.is(candidate.id, filter.id)),
  )
  emit('remove', { id: filter.id, originalEvent })
}
function setValue(filter: AvenFilterValue, value: AvenFilterValue['value']) {
  if (props.disabled) return
  emit(
    'update:filters',
    props.filters.map((candidate) =>
      Object.is(candidate.id, filter.id) ? { ...candidate, value } : candidate,
    ),
  )
}
function setOperator(filter: AvenFilterValue, operator: string) {
  const definition = props.definitions.find((item) => item.key === filter.field)
  if (props.disabled || !definition?.operators.includes(operator)) return
  emit(
    'update:filters',
    props.filters.map((candidate) =>
      Object.is(candidate.id, filter.id) ? { ...candidate, operator } : candidate,
    ),
  )
}
function optionValue(value: string, definition?: AvenFilterDefinition) {
  return definition?.options?.find((option) => String(option.value) === value)?.value ?? value
}
function setMultipleValues(event: Event, definition?: AvenFilterDefinition) {
  const select = event.target as HTMLSelectElement
  const values = Array.from(select.selectedOptions, (option) =>
    optionValue(option.value, definition),
  )
  return values as Array<string | number>
}
function add(filter: AvenFilterValue) {
  if (props.disabled || props.filters.some((candidate) => Object.is(candidate.id, filter.id)))
    return
  emit('update:filters', [...props.filters, filter])
  emit('add', filter)
}
function clear() {
  if (props.disabled || !props.filters.length) return
  const previousFilters = [...props.filters]
  emit('update:filters', [])
  emit('clear', { previousFilters })
}
</script>
<template>
  <div
    role="group"
    :aria-label="label"
    :aria-busy="loading || undefined"
    :class="['aven-filter-bar', { 'is-unstyled': unstyled }, ui?.root?.class]"
    :style="ui?.root?.style"
    v-bind="ui?.root?.attrs"
  >
    <div
      :class="['filter-list', ui?.filters?.class]"
      :style="ui?.filters?.style"
      v-bind="ui?.filters?.attrs"
    >
      <template v-for="{ filter, definition } in filterScopes" :key="filter.id">
        <div
          :class="['filter-item', ui?.filter?.class]"
          :style="ui?.filter?.style"
          v-bind="ui?.filter?.attrs"
        >
          <slot
            name="filter"
            :filter="filter"
            :definition="definition"
            :remove="removeHandler(filter)"
            :disabled="disabled"
          >
            <AvenFilterChip
              :filter="filter"
              :definition="definition"
              :disabled="disabled"
              :unstyled="unstyled"
              :ui="{ root: ui?.chip }"
              @remove="remove(filter, $event.originalEvent)"
            />
          </slot>
          <slot
            name="editor"
            :definition="definition"
            :value="filter"
            :set-value="valueHandler(filter)"
            :set-operator="operatorHandler(filter)"
            :disabled="disabled"
          >
            <div
              v-if="definition"
              :class="['filter-editor', ui?.editor?.class]"
              :style="ui?.editor?.style"
              v-bind="ui?.editor?.attrs"
            >
              <label v-if="definition.operators.length > 1" class="visually-hidden">
                {{ definition.label }} operator
                <select
                  :value="filter.operator"
                  :disabled="disabled"
                  @change="setOperator(filter, ($event.target as HTMLSelectElement).value)"
                >
                  <option
                    v-for="operator in definition.operators"
                    :key="operator"
                    :value="operator"
                  >
                    {{ operator }}
                  </option>
                </select>
              </label>
              <label class="visually-hidden">
                {{ definition.label }} filter value
                <select
                  v-if="definition.valueType === 'select'"
                  :value="String(filter.value ?? '')"
                  :disabled="disabled"
                  @change="
                    setValue(
                      filter,
                      optionValue(($event.target as HTMLSelectElement).value, definition),
                    )
                  "
                >
                  <option value="" disabled>Select {{ definition.label }}</option>
                  <option
                    v-for="option in definition.options ?? []"
                    :key="String(option.value)"
                    :value="String(option.value)"
                  >
                    {{ option.label }}
                  </option>
                </select>
                <select
                  v-else-if="definition.valueType === 'multi-select'"
                  multiple
                  :value="Array.isArray(filter.value) ? filter.value.map(String) : []"
                  :disabled="disabled"
                  @change="setValue(filter, setMultipleValues($event, definition))"
                >
                  <option
                    v-for="option in definition.options ?? []"
                    :key="String(option.value)"
                    :value="String(option.value)"
                  >
                    {{ option.label }}
                  </option>
                </select>
                <input
                  v-else-if="definition.valueType === 'boolean'"
                  type="checkbox"
                  :checked="filter.value === true"
                  :disabled="disabled"
                  @change="setValue(filter, ($event.target as HTMLInputElement).checked)"
                />
                <input
                  v-else
                  :type="
                    definition.valueType === 'number'
                      ? 'number'
                      : definition.valueType === 'date'
                        ? 'date'
                        : 'text'
                  "
                  :value="filter.value === null ? '' : String(filter.value)"
                  :disabled="disabled"
                  @input="setValue(filter, ($event.target as HTMLInputElement).value)"
                />
              </label>
            </div>
          </slot>
        </div>
      </template>
      <div
        v-if="filters.length === 0 && $slots.empty"
        :class="ui?.empty?.class"
        :style="ui?.empty?.style"
        v-bind="ui?.empty?.attrs"
      >
        <slot name="empty" />
      </div>
      <slot name="add-trigger" :definitions="definitions" :add="add" :disabled="disabled" />
      <button
        v-if="showClearAll && filters.length"
        type="button"
        :class="['filter-clear', ui?.clear?.class]"
        :style="ui?.clear?.style"
        v-bind="ui?.clear?.attrs"
        :disabled="disabled"
        @click="clear"
      >
        {{ clearLabel }}
      </button>
    </div>
    <div
      v-if="filters.length"
      :class="['filter-summary', ui?.summary?.class]"
      :style="ui?.summary?.style"
      v-bind="ui?.summary?.attrs"
    >
      <slot name="summary" :count="filters.length"
        >{{ filters.length }} {{ filters.length === 1 ? 'filter' : 'filters' }}</slot
      >
    </div>
  </div>
</template>
<style scoped>
.aven-filter-bar,
.filter-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--aven-filter-gap, var(--aven-space-2));
  min-inline-size: 0;
}
.filter-item {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--aven-filter-gap, var(--aven-space-2));
  min-inline-size: 0;
  max-inline-size: 100%;
}
.filter-editor {
  display: inline-flex;
  flex-wrap: wrap;
  gap: var(--aven-filter-editor-gap, var(--aven-space-2));
}
.filter-editor input,
.filter-editor select {
  min-block-size: 2.75rem;
  max-inline-size: 100%;
  padding-inline: var(--aven-space-2);
  border: 0.0625rem solid var(--aven-filter-editor-border, var(--aven-color-border-subtle));
  border-radius: var(--aven-filter-editor-radius, var(--aven-radius-sm));
  background: var(--aven-filter-editor-bg, var(--aven-color-surface-card));
  color: var(--aven-filter-editor-fg, var(--aven-color-text-primary));
  font: inherit;
}
.filter-editor input[type='checkbox'] {
  inline-size: 1.25rem;
}
.visually-hidden {
  position: absolute;
  inline-size: 0.0625rem;
  block-size: 0.0625rem;
  padding: 0;
  margin: -0.0625rem;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.filter-summary {
  color: var(--aven-filter-summary-fg, var(--aven-color-text-secondary));
  font-size: var(--aven-font-size-xs);
}
.filter-clear {
  min-block-size: 2.75rem;
  padding-inline: var(--aven-space-2);
  border: 0;
  border-radius: var(--aven-radius-sm);
  background: transparent;
  color: var(--aven-filter-action-fg, var(--aven-color-action-text));
  font: inherit;
  cursor: pointer;
}
.filter-clear:focus-visible {
  outline: 0.125rem solid var(--aven-filter-focus, var(--aven-color-focus-ring));
  outline-offset: 0.125rem;
}
.is-unstyled .filter-clear {
  appearance: none;
  border: 0;
  border-radius: 0;
  background: transparent;
}
</style>
