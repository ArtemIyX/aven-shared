<script setup lang="ts" generic="T extends string | number">
import { computed, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue'
import type { AvenToggleGroupEvents, AvenToggleGroupProps, AvenToggleGroupSlots } from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenToggleGroupProps<T>>(), {
  defaultValue: null,
  multiple: false,
  allowEmpty: true,
  orientation: 'horizontal',
  size: 'md',
  tone: 'accent',
  disabled: false,
  unstyled: false,
})
const emit = defineEmits<AvenToggleGroupEvents<T>>()
defineSlots<AvenToggleGroupSlots<T>>()
const attrs = useAttrs()
const initialValue = Array.isArray(props.defaultValue)
  ? [...props.defaultValue]
  : (props.defaultValue ?? null)
const localValue = ref<T | T[] | null>(props.defaultValue ?? null)
const activeValue = ref<T | null>(null)
const buttons = ref<Array<HTMLButtonElement | undefined>>([])
const root = ref<HTMLElement | null>(null)
const rawValue = computed(() =>
  props.modelValue !== undefined ? props.modelValue : localValue.value,
)
const selectedValues = computed<T[]>(() => {
  const current = rawValue.value
  if (current === null) return []
  return Array.isArray(current) ? current : [current as T]
})
const activeTabValue = computed(() => {
  if (activeValue.value !== null && isEnabled(activeValue.value)) return activeValue.value
  const selected = props.items.find((item) => isEnabled(item.value) && isSelected(item.value))
  return selected?.value ?? props.items.find((item) => isEnabled(item.value))?.value ?? null
})
const selectedFormItems = computed(() =>
  props.items.filter(
    (item) => selectedValues.value.some((value) => Object.is(value, item.value)) && !item.disabled,
  ),
)

watch(
  () => props.modelValue,
  (next) => {
    if (next !== undefined) localValue.value = next
  },
)

function isEnabled(value: T) {
  const item = props.items.find((entry) => Object.is(entry.value, value))
  return !props.disabled && !!item && !item.disabled
}

function isSelected(value: T) {
  return selectedValues.value.some((selected) => Object.is(selected, value))
}

function setButtonRef(index: number, element: unknown) {
  buttons.value[index] =
    element &&
    typeof element === 'object' &&
    'focus' in element &&
    typeof element.focus === 'function'
      ? (element as HTMLButtonElement)
      : undefined
}

function choose(item: (typeof props.items)[number]) {
  if (props.disabled || item.disabled) return
  let next: T | T[] | null
  if (props.multiple) {
    const current = selectedValues.value
    const selected = current.some((value) => Object.is(value, item.value))
    if (selected && !props.allowEmpty && current.length <= 1) return
    next = selected
      ? current.filter((value) => !Object.is(value, item.value))
      : [...current, item.value]
  } else if (isSelected(item.value)) {
    if (!props.allowEmpty) return
    next = null
  } else {
    next = item.value
  }
  if (
    (Array.isArray(next) &&
      Array.isArray(rawValue.value) &&
      next.length === rawValue.value.length &&
      next.every((value, index) => Object.is(value, rawValue.value?.[index]))) ||
    (!Array.isArray(next) && !Array.isArray(rawValue.value) && Object.is(next, rawValue.value))
  )
    return
  localValue.value = next
  emit('update:modelValue', next)
  emit('change', next)
}

function onKeydown(event: KeyboardEvent, index: number) {
  const directionElement = root.value?.closest('[dir]')
  const rtl =
    directionElement?.getAttribute('dir') === 'rtl' ||
    (!directionElement && typeof document !== 'undefined' && document.dir === 'rtl')
  const forward =
    props.orientation === 'horizontal' ? (rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown'
  const backward =
    props.orientation === 'horizontal' ? (rtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp'
  if (![forward, backward, 'Home', 'End'].includes(event.key)) return
  const enabledIndices = props.items
    .map((item, itemIndex) => (isEnabled(item.value) ? itemIndex : -1))
    .filter((itemIndex) => itemIndex >= 0)
  if (!enabledIndices.length) return
  event.preventDefault()
  let nextPosition = enabledIndices.indexOf(index)
  if (event.key === 'Home') nextPosition = 0
  else if (event.key === 'End') nextPosition = enabledIndices.length - 1
  else {
    const delta = event.key === forward ? 1 : -1
    nextPosition = (nextPosition + delta + enabledIndices.length) % enabledIndices.length
  }
  const nextIndex = enabledIndices[nextPosition]
  if (nextIndex === undefined) return
  activeValue.value = props.items[nextIndex]!.value
  buttons.value[nextIndex]?.focus()
}

function onFocus(value: T) {
  activeValue.value = value
}

function onBlur() {
  activeValue.value = null
}
let form: HTMLFormElement | null = null
function reset(event: Event) {
  queueMicrotask(() => {
    if (event.defaultPrevented) return
    const next = Array.isArray(initialValue) ? [...initialValue] : initialValue
    localValue.value = next
    if (props.modelValue !== undefined) emit('update:modelValue', next)
  })
}
onMounted(() => {
  form = root.value?.closest('form') ?? null
  form?.addEventListener('reset', reset)
})
onBeforeUnmount(() => form?.removeEventListener('reset', reset))
</script>

<template>
  <div
    ref="root"
    v-bind="{ ...attrs, ...ui?.root?.attrs }"
    role="toolbar"
    :aria-label="
      label || (typeof attrs['aria-label'] === 'string' ? attrs['aria-label'] : undefined)
    "
    :aria-orientation="orientation"
    :class="[
      'aven-toggle-group',
      `is-${orientation}`,
      `size-${size}`,
      `tone-${tone}`,
      { 'is-disabled': disabled, 'is-unstyled': unstyled },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[attrs.style, ui?.root?.style]"
  >
    <button
      v-for="(item, index) in items"
      :key="`${typeof item.value}:${String(item.value)}`"
      :ref="(element) => setButtonRef(index, element)"
      v-bind="ui?.item?.attrs"
      type="button"
      :disabled="disabled || !!item.disabled"
      :aria-pressed="isSelected(item.value)"
      :tabindex="Object.is(activeTabValue, item.value) ? 0 : -1"
      :class="['toggle-group-item', { 'is-selected': isSelected(item.value) }, ui?.item?.class]"
      :style="[ui?.item?.style]"
      @click="choose(item)"
      @focus="onFocus(item.value)"
      @blur="onBlur"
      @keydown="onKeydown($event, index)"
    >
      <span
        v-if="$slots.leading"
        v-bind="ui?.leading?.attrs"
        :class="ui?.leading?.class"
        :style="ui?.leading?.style"
      >
        <slot name="leading" :item="item" />
      </span>
      <slot
        name="item"
        :item="item"
        :key="item.value"
        :selected="isSelected(item.value)"
        :active="Object.is(activeValue, item.value)"
        :disabled="disabled || !!item.disabled"
      >
        {{ item.label }}
      </slot>
      <span
        v-if="$slots.indicator || isSelected(item.value)"
        v-bind="ui?.indicator?.attrs"
        aria-hidden="true"
        :class="['toggle-indicator', ui?.indicator?.class]"
        :style="ui?.indicator?.style"
      >
        <slot name="indicator" :item="item" :selected="isSelected(item.value)">✓</slot>
      </span>
      <span
        v-if="$slots.trailing"
        v-bind="ui?.trailing?.attrs"
        :class="ui?.trailing?.class"
        :style="ui?.trailing?.style"
      >
        <slot name="trailing" :item="item" />
      </span>
    </button>
    <input
      v-for="item in name ? selectedFormItems : []"
      :key="`form:${typeof item.value}:${String(item.value)}`"
      type="hidden"
      :name="name"
      :value="String(item.value)"
      :disabled="disabled || !!item.disabled"
    />
  </div>
</template>

<style scoped>
.aven-toggle-group {
  display: inline-flex;
  align-items: stretch;
  gap: var(--aven-space-1);
  max-inline-size: 100%;
  padding: var(--aven-space-1);
  border: 1px solid var(--aven-color-border-subtle);
  border-radius: var(--aven-radius-lg);
  background: var(--aven-color-surface-recessed);
}
.is-vertical {
  flex-direction: column;
}
.toggle-group-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--aven-space-2);
  min-inline-size: 2.75rem;
  min-block-size: 2.75rem;
  padding: var(--aven-space-2) var(--aven-space-3);
  border: 1px solid transparent;
  border-radius: var(--aven-radius-md);
  background: transparent;
  color: var(--aven-color-text-secondary);
  font: inherit;
  cursor: pointer;
}
.size-sm .toggle-group-item {
  min-block-size: 2.25rem;
}
.size-lg .toggle-group-item {
  min-block-size: 3rem;
  padding-inline: var(--aven-space-5);
}
.toggle-group-item.is-selected {
  border-color: var(--aven-color-accent-border);
  background: var(--aven-color-surface-base);
  color: var(--aven-color-accent-text);
  box-shadow: var(--aven-shadow-sm);
}
.tone-neutral .toggle-group-item.is-selected {
  border-color: var(--aven-color-neutral-border);
  color: var(--aven-color-neutral-text);
}
.tone-secondary .toggle-group-item.is-selected {
  border-color: var(--aven-color-secondary-border);
  color: var(--aven-color-secondary-text);
}
.tone-info .toggle-group-item.is-selected {
  border-color: var(--aven-color-info-border);
  color: var(--aven-color-info-text);
}
.tone-success .toggle-group-item.is-selected {
  border-color: var(--aven-color-success-border);
  color: var(--aven-color-success-text);
}
.tone-warning .toggle-group-item.is-selected {
  border-color: var(--aven-color-warning-border);
  color: var(--aven-color-warning-text);
}
.tone-danger .toggle-group-item.is-selected {
  border-color: var(--aven-color-danger-border);
  color: var(--aven-color-danger-text);
}
.tone-critical .toggle-group-item.is-selected {
  border-color: var(--aven-color-critical-border);
  color: var(--aven-color-critical-text);
}
.toggle-group-item:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 2px;
}
.toggle-group-item:disabled {
  color: var(--aven-color-text-disabled);
  cursor: not-allowed;
}
.toggle-indicator {
  color: currentColor;
}
.is-unstyled {
  border: 0;
  border-radius: 0;
  padding: 0;
  background: transparent;
}
@media (max-width: 30rem) {
  .is-horizontal {
    flex-wrap: wrap;
  }
  .toggle-group-item {
    overflow-wrap: anywhere;
  }
}
@media (forced-colors: active) {
  .aven-toggle-group {
    border-color: ButtonText;
  }
  .toggle-group-item.is-selected {
    border-color: Highlight;
    background: Highlight;
    color: HighlightText;
    box-shadow: none;
  }
  .toggle-group-item:disabled {
    color: GrayText;
  }
}
</style>
