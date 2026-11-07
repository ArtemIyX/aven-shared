<script setup lang="ts" generic="T extends string | number">
import { computed, onBeforeUnmount, ref, useAttrs, watch } from 'vue'
import { useAvenId } from './composables.js'
import type { AvenListboxEvents, AvenListboxProps, AvenListboxSlots } from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenListboxProps<T>>(), {
  defaultValue: null,
  multiple: false,
  orientation: 'vertical',
  selectionBehavior: 'toggle',
  loop: false,
  disabled: false,
  readonly: false,
  unstyled: false,
})
const emit = defineEmits<AvenListboxEvents<T>>()
defineSlots<AvenListboxSlots<T>>()
const attrs = useAttrs()
const listId = useAvenId(props.id, 'listbox')
const localValue = ref<T | T[] | null>(props.defaultValue ?? null)
const activeIndex = ref(-1)
const optionElements = ref<Array<HTMLDivElement | undefined>>([])
const root = ref<HTMLDivElement>()
const typeahead = ref('')
let typeaheadTimer: ReturnType<typeof setTimeout> | undefined
const value = computed(() => (props.modelValue !== undefined ? props.modelValue : localValue.value))
const selectedValues = computed<T[]>(() => {
  if (value.value === null) return []
  return Array.isArray(value.value) ? (value.value as T[]) : [value.value as T]
})
const activeId = computed(() =>
  activeIndex.value >= 0 ? `${listId}-option-${activeIndex.value}` : undefined,
)
const groups = computed(() => {
  const result: Array<{
    group: string | number | undefined
    options: Array<{ option: (typeof props.options)[number]; index: number }>
  }> = []
  props.options.forEach((option, index) => {
    const group = option.group
    let entry = result[result.length - 1]
    if (!entry || !Object.is(entry.group, group)) {
      entry = { group, options: [] }
      result.push(entry)
    }
    entry.options.push({ option, index })
  })
  return result
})

watch(
  () => props.modelValue,
  (next) => {
    if (next !== undefined) localValue.value = next
  },
)
watch(
  () => props.options,
  () => {
    if (
      activeIndex.value >= props.options.length ||
      (activeIndex.value >= 0 && props.options[activeIndex.value]?.disabled)
    ) {
      activeIndex.value = firstEnabled()
    }
  },
  { deep: true },
)
onBeforeUnmount(() => {
  if (typeaheadTimer) clearTimeout(typeaheadTimer)
})

function isSelected(key: T) {
  return selectedValues.value.some((item) => Object.is(item, key))
}
function isDisabled(index: number) {
  return props.disabled || !!props.options[index]?.disabled
}
function firstEnabled() {
  return props.options.findIndex((_, index) => !isDisabled(index))
}
function setActive(index: number, event: Event) {
  if (index < 0 || index >= props.options.length || isDisabled(index)) return
  activeIndex.value = index
  emit('highlight', { value: props.options[index]!.value, index, originalEvent: event })
}
function commit(index = activeIndex.value) {
  const option = props.options[index]
  if (!option || isDisabled(index) || props.readonly) return
  const key = option.value
  let next: T | T[] | null
  if (!props.multiple) next = key
  else if (props.selectionBehavior === 'replace') next = [key]
  else {
    const already = isSelected(key)
    next = already
      ? selectedValues.value.filter((item) => !Object.is(item, key))
      : [...selectedValues.value, key]
  }
  const unchanged = Array.isArray(next)
    ? Array.isArray(value.value) &&
      next.length === value.value.length &&
      next.every((item, i) => Object.is(item, value.value?.[i]))
    : !Array.isArray(value.value) && Object.is(next, value.value)
  if (unchanged) return
  localValue.value = next
  emit('update:modelValue', next)
  emit('change', next)
}
function moveActive(delta: number, event: KeyboardEvent) {
  const enabled = props.options.map((_, index) => index).filter((index) => !isDisabled(index))
  if (!enabled.length) return
  let position = enabled.indexOf(activeIndex.value)
  if (position < 0) position = delta > 0 ? -1 : enabled.length
  let nextPosition = position + delta
  if (props.loop) nextPosition = (nextPosition + enabled.length) % enabled.length
  else nextPosition = Math.max(0, Math.min(enabled.length - 1, nextPosition))
  const next = enabled[nextPosition]
  if (next === undefined) return
  const reachedNewEnd = next === enabled[enabled.length - 1] && next !== activeIndex.value
  setActive(next, event)
  if (reachedNewEnd) emit('endReached', { lastKey: props.options[next]!.value })
  optionElements.value[next]?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
}
function onKeydown(event: KeyboardEvent) {
  if (props.disabled || props.readonly) return
  const forward = props.orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'
  const backward = props.orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'
  if (event.key === forward || event.key === backward) {
    event.preventDefault()
    moveActive(event.key === forward ? 1 : -1, event)
    return
  }
  if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault()
    const enabled = props.options.map((_, index) => index).filter((index) => !isDisabled(index))
    const next = event.key === 'Home' ? enabled[0] : enabled.at(-1)
    if (next !== undefined) setActive(next, event)
    return
  }
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    commit()
    return
  }
  if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
    typeahead.value += event.key.toLocaleLowerCase()
    if (typeaheadTimer) clearTimeout(typeaheadTimer)
    typeaheadTimer = setTimeout(() => {
      typeahead.value = ''
    }, 500)
    const start = Math.max(0, activeIndex.value + 1)
    const ordered = [...props.options.slice(start), ...props.options.slice(0, start)]
    const option = ordered.find(
      (item) => !item.disabled && item.label.toLocaleLowerCase().startsWith(typeahead.value),
    )
    if (option) setActive(props.options.indexOf(option), event)
  }
}
function focusRoot() {
  root.value?.focus()
}
defineExpose({ focus: focusRoot })
</script>

<template>
  <div
    ref="root"
    v-bind="{ ...attrs, ...ui?.root?.attrs }"
    :id="listId"
    role="listbox"
    :aria-label="label || undefined"
    :aria-multiselectable="multiple || undefined"
    :aria-orientation="orientation"
    :aria-activedescendant="activeId"
    :aria-disabled="disabled || undefined"
    :aria-readonly="readonly || undefined"
    :tabindex="disabled ? -1 : 0"
    :class="[
      'aven-listbox',
      { 'is-disabled': disabled, 'is-unstyled': unstyled },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[attrs.style, ui?.root?.style]"
    @keydown="onKeydown"
    @focus="
      (event) => {
        if (activeIndex < 0 && firstEnabled() >= 0) setActive(firstEnabled(), event)
      }
    "
  >
    <slot name="header" />
    <slot v-if="options.length === 0" name="empty"
      ><div :class="ui?.empty?.class">No options</div></slot
    >
    <template
      v-for="group in groups"
      :key="group.group === undefined ? 'ungrouped' : `${typeof group.group}:${group.group}`"
    >
      <div
        v-if="group.group !== undefined"
        role="group"
        :aria-label="String(group.group)"
        :class="ui?.group?.class"
        :style="ui?.group?.style"
        v-bind="ui?.group?.attrs"
      >
        <slot name="group" :group="group.group">{{ group.group }}</slot>
        <div
          v-for="entry in group.options"
          :id="`${listId}-option-${entry.index}`"
          :key="`${typeof entry.option.value}:${String(entry.option.value)}`"
          :ref="
            (el) => {
              optionElements[entry.index] = (el as HTMLDivElement) || undefined
            }
          "
          role="option"
          :aria-selected="isSelected(entry.option.value)"
          :aria-disabled="isDisabled(entry.index) || undefined"
          :class="[
            'listbox-option',
            {
              'is-selected': isSelected(entry.option.value),
              'is-active': activeIndex === entry.index,
              'is-disabled': isDisabled(entry.index),
            },
            ui?.option?.class,
          ]"
          :style="ui?.option?.style"
          v-bind="ui?.option?.attrs"
          @click="commit(entry.index)"
          @mouseenter="(event) => !isDisabled(entry.index) && setActive(entry.index, event)"
        >
          <slot
            name="item"
            :item="entry.option"
            :key="entry.option.value"
            :index="entry.index"
            :selected="isSelected(entry.option.value)"
            :active="activeIndex === entry.index"
            :disabled="isDisabled(entry.index)"
            >{{ entry.option.label }}</slot
          >
          <slot name="indicator" :selected="isSelected(entry.option.value)"
            ><span
              v-if="isSelected(entry.option.value)"
              aria-hidden="true"
              :class="ui?.indicator?.class"
              >✓</span
            ></slot
          >
        </div>
      </div>
      <template v-else>
        <div
          v-for="entry in group.options"
          :id="`${listId}-option-${entry.index}`"
          :key="`${typeof entry.option.value}:${String(entry.option.value)}`"
          :ref="
            (el) => {
              optionElements[entry.index] = (el as HTMLDivElement) || undefined
            }
          "
          role="option"
          :aria-selected="isSelected(entry.option.value)"
          :aria-disabled="isDisabled(entry.index) || undefined"
          :class="[
            'listbox-option',
            {
              'is-selected': isSelected(entry.option.value),
              'is-active': activeIndex === entry.index,
              'is-disabled': isDisabled(entry.index),
            },
            ui?.option?.class,
          ]"
          :style="ui?.option?.style"
          v-bind="ui?.option?.attrs"
          @click="commit(entry.index)"
          @mouseenter="(event) => !isDisabled(entry.index) && setActive(entry.index, event)"
        >
          <slot
            name="item"
            :item="entry.option"
            :key="entry.option.value"
            :index="entry.index"
            :selected="isSelected(entry.option.value)"
            :active="activeIndex === entry.index"
            :disabled="isDisabled(entry.index)"
            >{{ entry.option.label }}</slot
          >
          <slot name="indicator" :selected="isSelected(entry.option.value)"
            ><span
              v-if="isSelected(entry.option.value)"
              aria-hidden="true"
              :class="ui?.indicator?.class"
              >✓</span
            ></slot
          >
        </div>
      </template>
    </template>
    <slot name="separator" />
    <slot name="footer" />
    <template v-if="name"
      ><input
        v-for="selected in selectedValues"
        :key="`${typeof selected}:${String(selected)}`"
        type="hidden"
        :name="name"
        :value="selected"
        :disabled="disabled"
    /></template>
  </div>
</template>

<style scoped>
.aven-listbox {
  display: grid;
  gap: var(--aven-space-1);
  min-inline-size: 0;
  max-block-size: min(24rem, 70vh);
  overflow: auto;
  padding: var(--aven-space-1);
  border: 1px solid var(--aven-color-border-interactive);
  border-radius: var(--aven-radius-md);
  background: var(--aven-color-surface-base);
  color: var(--aven-color-text-primary);
  outline: none;
}
.aven-listbox:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 2px;
}
.listbox-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--aven-space-3);
  min-block-size: 2.5rem;
  padding: var(--aven-space-2) var(--aven-space-3);
  border-radius: var(--aven-radius-sm);
  cursor: pointer;
}
.listbox-option.is-active {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: -2px;
}
.listbox-option.is-selected {
  background: var(--aven-color-surface-selected);
  color: var(--aven-color-text-selected);
}
.listbox-option.is-disabled {
  color: var(--aven-color-text-disabled);
  cursor: not-allowed;
}
.is-disabled {
  opacity: 0.7;
}
.is-unstyled {
  border: 0;
  border-radius: 0;
  padding: 0;
  background: transparent;
}
@media (forced-colors: active) {
  .listbox-option.is-active {
    outline: 2px solid Highlight;
  }
  .listbox-option.is-selected {
    border: 1px solid SelectedItem;
  }
}
</style>
