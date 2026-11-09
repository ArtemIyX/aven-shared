<script setup lang="ts" generic="Key extends string = string">
import { computed, ref, shallowRef, useAttrs } from 'vue'
import type {
  AvenSortControlEvents,
  AvenSortControlProps,
  AvenSortControlSlots,
  AvenSortField,
  AvenSortItem,
} from './types.js'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenSortControlProps<Key> & { id?: string }>(), {
  defaultValue: () => [],
  multiple: false,
  disabled: false,
  label: 'Sort order',
  addLabel: 'Add sort field',
  unstyled: false,
})
const emit = defineEmits<AvenSortControlEvents<Key>>()
const slots = defineSlots<AvenSortControlSlots<Key>>()
const attrs = useAttrs()
const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return { ...rest, ...props.ui?.root?.attrs }
})
const root = ref<HTMLElement>()
const internalValue = shallowRef<AvenSortItem<Key>[]>(
  props.defaultValue.map((item) => ({ ...item })),
)
const value = computed(() => props.modelValue ?? internalValue.value)
const activeDisabled = computed(() => props.disabled)
const availableFields = computed(() =>
  props.fields.filter((field) => !value.value.some((item) => item.key === field.key)),
)
function request(next: AvenSortItem<Key>[]) {
  if (props.modelValue === undefined) internalValue.value = next
  emit('update:modelValue', next)
  emit('change', next)
}
function update(index: number, patch: Partial<AvenSortItem<Key>>) {
  if (activeDisabled.value) return
  const current = value.value[index]
  if (!current) return
  const next = value.value.map((item, itemIndex) =>
    itemIndex === index ? { ...item, ...patch } : item,
  )
  const updated = next[index]
  if (updated && next.some((item, itemIndex) => itemIndex !== index && item.key === updated.key))
    return
  request(next)
}
function add() {
  if (activeDisabled.value || (!props.multiple && value.value.length > 0)) return
  const field = availableFields.value.find((candidate) => !candidate.disabled)
  if (!field) return
  request([...value.value, { key: field.key, direction: 'asc' }])
}
function remove(index: number) {
  if (activeDisabled.value) return
  const item = value.value[index]
  if (!item) return
  request(value.value.filter((_, itemIndex) => itemIndex !== index))
  emit('remove', { key: item.key, index })
}
function move(index: number, offset: -1 | 1) {
  if (activeDisabled.value) return
  const target = index + offset
  if (target < 0 || target >= value.value.length) return
  const next = [...value.value]
  ;[next[index], next[target]] = [next[target]!, next[index]!]
  request(next)
}
function fieldFor(key: Key): AvenSortField<Key> | undefined {
  return props.fields.find((field) => field.key === key)
}
function focus() {
  root.value?.querySelector<HTMLElement>('select, button')?.focus()
}
defineExpose({ focus })
</script>
<template>
  <div
    v-bind="{ ...ui?.root?.attrs, ...rootAttrs }"
    ref="root"
    :id="id"
    role="group"
    :aria-label="label"
    :class="['aven-sort-control', attrs.class, { 'is-unstyled': unstyled }, ui?.root?.class]"
    :style="[attrs.style, ui?.root?.style]"
  >
    <ol :class="['sort-list', ui?.list?.class]" :style="ui?.list?.style" v-bind="ui?.list?.attrs">
      <li
        v-for="(item, index) in value"
        :key="item.key"
        :class="['sort-item', ui?.item?.class]"
        :style="ui?.item?.style"
        v-bind="ui?.item?.attrs"
      >
        <slot
          name="item"
          :field="fieldFor(item.key)"
          :direction="item.direction"
          :index="index"
          :update="(patch: Partial<AvenSortItem<Key>>) => update(index, patch)"
          :remove="() => remove(index)"
        >
          <label
            :class="['sort-field', ui?.field?.class]"
            :style="ui?.field?.style"
            v-bind="ui?.field?.attrs"
          >
            <span class="visually-hidden">Sort priority {{ index + 1 }} field</span>
            <select
              :value="item.key"
              :disabled="activeDisabled"
              @change="update(index, { key: ($event.target as HTMLSelectElement).value as Key })"
            >
              <option
                v-for="field in fields"
                :key="field.key"
                :value="field.key"
                :disabled="
                  field.disabled ||
                  value.some((other, otherIndex) => otherIndex !== index && other.key === field.key)
                "
              >
                {{ field.label }}
              </option>
            </select>
          </label>
          <button
            type="button"
            :class="['sort-direction', ui?.direction?.class]"
            :style="ui?.direction?.style"
            v-bind="ui?.direction?.attrs"
            :disabled="activeDisabled"
            :aria-label="`Sort ${fieldFor(item.key)?.label ?? item.key} ${item.direction}; activate to reverse`"
            :aria-pressed="item.direction === 'desc'"
            @click="update(index, { direction: item.direction === 'asc' ? 'desc' : 'asc' })"
          >
            {{ item.direction === 'asc' ? 'Ascending ↑' : 'Descending ↓' }}
          </button>
          <div
            :class="['sort-actions', ui?.actions?.class]"
            :style="ui?.actions?.style"
            v-bind="ui?.actions?.attrs"
          >
            <button
              type="button"
              :disabled="activeDisabled || index === 0"
              :aria-label="`Move ${fieldFor(item.key)?.label ?? item.key} sort priority up`"
              @click="move(index, -1)"
            >
              Move up
            </button>
            <button
              type="button"
              :disabled="activeDisabled || index === value.length - 1"
              :aria-label="`Move ${fieldFor(item.key)?.label ?? item.key} sort priority down`"
              @click="move(index, 1)"
            >
              Move down
            </button>
            <button
              type="button"
              :disabled="activeDisabled"
              :aria-label="`Remove ${fieldFor(item.key)?.label ?? item.key} sort field`"
              :class="ui?.remove?.class"
              :style="ui?.remove?.style"
              v-bind="ui?.remove?.attrs"
              @click="remove(index)"
            >
              Remove
            </button>
          </div>
        </slot>
      </li>
      <li v-if="value.length === 0" class="sort-empty">
        <slot name="empty">No sort fields selected.</slot>
      </li>
    </ol>
    <slot
      name="add-action"
      :add="add"
      :disabled="
        activeDisabled ||
        !availableFields.some((field) => !field.disabled) ||
        (!multiple && value.length > 0)
      "
    >
      <button
        :class="['sort-add', ui?.add?.class]"
        :style="ui?.add?.style"
        v-bind="ui?.add?.attrs"
        type="button"
        :disabled="
          activeDisabled ||
          !availableFields.some((field) => !field.disabled) ||
          (!multiple && value.length > 0)
        "
        @click="add"
      >
        {{ addLabel }}
      </button>
    </slot>
  </div>
</template>
<style scoped>
.aven-sort-control {
  display: grid;
  gap: var(--aven-sort-gap, var(--aven-space-2));
  min-inline-size: 0;
  color: var(--aven-sort-fg, var(--aven-color-text-primary));
}
.sort-list {
  display: grid;
  gap: var(--aven-sort-gap, var(--aven-space-2));
  min-inline-size: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}
.sort-item {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--aven-space-2);
  min-inline-size: 0;
  padding: var(--aven-space-2);
  border: 0.0625rem solid var(--aven-sort-border, var(--aven-color-border-subtle));
  border-radius: var(--aven-sort-radius, var(--aven-radius-sm));
  background: var(--aven-sort-bg, var(--aven-color-surface-card));
}
.sort-field select,
.sort-item button,
.sort-add {
  min-block-size: 2.75rem;
  max-inline-size: 100%;
  padding-inline: var(--aven-space-2);
  border: 0.0625rem solid var(--aven-sort-border, var(--aven-color-border-subtle));
  border-radius: var(--aven-radius-sm);
  background: var(--aven-sort-bg, var(--aven-color-surface-card));
  color: inherit;
  font: inherit;
}
.sort-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--aven-space-1);
  margin-inline-start: auto;
}
.sort-item :focus-visible,
.sort-add:focus-visible {
  outline: 0.125rem solid var(--aven-sort-focus, var(--aven-color-focus-ring));
  outline-offset: 0.125rem;
}
.sort-item button:disabled,
.sort-add:disabled {
  color: var(--aven-color-text-disabled);
}
.sort-empty {
  color: var(--aven-color-text-secondary);
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
.is-unstyled .sort-item {
  border: 0;
  border-radius: 0;
  background: transparent;
}
.is-unstyled .sort-field select,
.is-unstyled .sort-item button,
.is-unstyled .sort-add {
  border: 0;
  border-radius: 0;
  background: transparent;
}
@media (forced-colors: active) {
  .sort-item,
  .sort-field select,
  .sort-item button,
  .sort-add {
    border-color: CanvasText;
  }
}
</style>
