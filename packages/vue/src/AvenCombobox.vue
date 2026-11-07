<script setup lang="ts" generic="T extends string | number">
import { computed, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue'
import { useAvenId, type AvenOpenReason } from './composables.js'
import type { AvenOption } from './types.js'
import type { AvenComboboxEvents, AvenComboboxProps, AvenComboboxSlots } from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenComboboxProps<T>>(), {
  defaultValue: null,
  multiple: false,
  defaultQuery: '',
  remote: false,
  loading: false,
  clearable: false,
  clearLabel: 'Clear selection',
  creatable: false,
  defaultOpen: false,
  open: undefined,
  placement: 'bottom',
  required: false,
  requiredMessage: 'Please select an option.',
  disabled: false,
  readonly: false,
  invalid: false,
  unstyled: false,
})
const emit = defineEmits<AvenComboboxEvents<T>>()
const attrs = useAttrs()
const slots = defineSlots<AvenComboboxSlots<T>>()
const nativeAttrs = computed(() =>
  Object.fromEntries(Object.entries(attrs).filter(([key]) => key !== 'class' && key !== 'style')),
)
const inputId = useAvenId(props.id, 'combobox')
const listId = `${inputId}-listbox`
const descriptionId = `${inputId}-description`
const errorId = `${inputId}-error`
const localValue = ref<T | T[] | null>(props.defaultValue ?? (props.multiple ? [] : null))
const localQuery = ref(props.defaultQuery)
const localOpen = ref(props.defaultOpen)
const input = ref<HTMLInputElement>()
const root = ref<HTMLDivElement>()
const activeIndex = ref(
  props.defaultActiveKey == null
    ? -1
    : props.options.findIndex((option) => Object.is(option.value, props.defaultActiveKey)),
)
const currentActiveIndex = computed(() =>
  props.activeKey === undefined
    ? activeIndex.value
    : props.options.findIndex((option) => Object.is(option.value, props.activeKey)),
)
const composing = ref(false)
const selectedCache = new Map<T, AvenOption<T>>()
const value = computed(() => (props.modelValue !== undefined ? props.modelValue : localValue.value))
const query = computed(() => (props.query !== undefined ? props.query : localQuery.value))
const isOpen = computed(() => (props.open !== undefined ? props.open : localOpen.value))
const selectedValues = computed<T[]>(() =>
  value.value === null
    ? []
    : Array.isArray(value.value)
      ? (value.value as T[])
      : [value.value as T],
)
const allSelectedItems = computed(() =>
  selectedValues.value.map((key) => {
    const item =
      props.options.find((option) => Object.is(option.value, key)) ?? selectedCache.get(key)
    return item ?? { value: key, label: String(key) }
  }),
)
const selectedLabel = computed(() => allSelectedItems.value[0]?.label ?? '')
const filteredOptions = computed(() =>
  props.remote || !query.value.trim()
    ? props.options
    : props.options.filter((option) =>
        props.filter
          ? props.filter(option, query.value)
          : `${option.label} ${(option.keywords ?? []).join(' ')}`
              .toLocaleLowerCase()
              .includes(query.value.toLocaleLowerCase()),
      ),
)
const groupedOptions = computed(() => {
  const groups: Array<{
    group: string | number | undefined
    options: Array<{ item: AvenOption<T>; index: number }>
  }> = []
  filteredOptions.value.forEach((item) => {
    const index = props.options.indexOf(item)
    let group = groups[groups.length - 1]
    if (!group || !Object.is(group.group, item.group)) {
      group = { group: item.group, options: [] }
      groups.push(group)
    }
    group.options.push({ item, index })
  })
  return groups
})
const activeItem = computed(() =>
  filteredOptions.value.find((item) => props.options.indexOf(item) === currentActiveIndex.value),
)
const activeId = computed(() =>
  activeItem.value ? `${listId}-option-${props.options.indexOf(activeItem.value)}` : undefined,
)
let form: HTMLFormElement | null = null
watch(
  () => props.modelValue,
  (next) => {
    if (next !== undefined) localValue.value = next
  },
)
watch(
  () => props.query,
  (next) => {
    if (next !== undefined) localQuery.value = next
  },
)
watch(
  () => props.open,
  (next) => {
    if (next !== undefined) localOpen.value = next
  },
)
watch(value, updateValidity, { deep: true })
watch(isOpen, (open) => {
  if (typeof document === 'undefined') return
  if (open) {
    document.addEventListener('pointerdown', onOutside, true)
    document.addEventListener('keydown', onDocumentKeydown)
  } else {
    document.removeEventListener('pointerdown', onOutside, true)
    document.removeEventListener('keydown', onDocumentKeydown)
  }
})
onMounted(() => {
  if (typeof document !== 'undefined' && isOpen.value) {
    document.addEventListener('pointerdown', onOutside, true)
    document.addEventListener('keydown', onDocumentKeydown)
  }
  const form = input.value?.form
  if (form) {
    form.addEventListener('reset', resetFromForm)
    resetForm = form
  }
  updateValidity()
})
onBeforeUnmount(() => {
  resetForm?.removeEventListener('reset', resetFromForm)
  if (typeof document !== 'undefined') {
    document.removeEventListener('pointerdown', onOutside, true)
    document.removeEventListener('keydown', onDocumentKeydown)
  }
})
let resetForm: HTMLFormElement | null = null
function setValue(next: T | T[] | null) {
  localValue.value = next
  emit('update:modelValue', next)
  emit('change', next)
  updateValidity()
}
function updateValidity() {
  input.value?.setCustomValidity?.(
    props.required && selectedValues.value.length === 0 ? props.requiredMessage : '',
  )
}
function setQuery(next: string) {
  if (next === query.value) return
  if (props.query === undefined) localQuery.value = next
  emit('update:query', next)
  setActiveIndex(-1)
}
function setActiveIndex(next: number) {
  if (currentActiveIndex.value === next) return
  const item = props.options[next]
  if (props.activeKey === undefined) activeIndex.value = next
  else emit('update:activeKey', item?.value ?? null)
  if (item && !item.disabled) emit('highlight', { key: item.value, item })
}
function setOpen(next: boolean, reason: AvenOpenReason, event?: Event) {
  if (props.disabled || props.readonly || isOpen.value === next) return
  if (props.open === undefined) localOpen.value = next
  emit('update:open', next)
  emit('openChange', { open: next, reason })
  if (!next && reason === 'escape') input.value?.focus()
  if (next && currentActiveIndex.value < 0) setActiveIndex(firstEnabledIndex())
  event?.stopPropagation?.()
}
function firstEnabledIndex() {
  const item = filteredOptions.value.find((option) => !option.disabled)
  return item ? props.options.indexOf(item) : -1
}
function isSelected(key: T) {
  return selectedValues.value.some((item) => Object.is(item, key))
}
function choose(item: AvenOption<T>, event: MouseEvent | KeyboardEvent) {
  if (props.disabled || props.readonly || item.disabled) return
  selectedCache.set(item.value, item)
  if (props.multiple) {
    if (isSelected(item.value)) {
      const next = selectedValues.value.filter((key) => !Object.is(key, item.value))
      setValue(next)
      emit('remove', { value: item.value, originalEvent: event })
    } else {
      if (props.maxSelected !== undefined && selectedValues.value.length >= props.maxSelected)
        return
      setValue([...selectedValues.value, item.value])
      emit('select', { key: item.value, item, originalEvent: event })
    }
    setQuery('')
  } else {
    emit('select', { key: item.value, item, originalEvent: event })
    if (!isSelected(item.value)) setValue(item.value)
    setQuery(item.label)
    setOpen(false, 'select', event)
  }
}
function removeItem(key: T, event: MouseEvent) {
  if (props.disabled || props.readonly) return
  setValue(selectedValues.value.filter((item) => !Object.is(item, key)))
  emit('remove', { value: key, originalEvent: event })
  input.value?.focus()
}
function clear(event?: MouseEvent) {
  if (props.disabled || props.readonly || !selectedValues.value.length) return
  const previousValue = value.value
  setValue(props.multiple ? [] : null)
  setQuery('')
  emit('clear', { previousValue })
  input.value?.focus()
  event?.stopPropagation()
}
function onInput(event: Event) {
  if (props.readonly) return
  const target = event.target as HTMLInputElement
  setQuery(target.value)
  if (!isOpen.value) setOpen(true, 'trigger', event)
}
function onFocus(event: FocusEvent) {
  emit('focus', event)
  if (!props.disabled && !props.readonly) setOpen(true, 'trigger', event)
}
function onCompositionEnd(event: CompositionEvent) {
  composing.value = false
  onInput(event)
}
function onKeydown(event: KeyboardEvent) {
  if (props.disabled || props.readonly) return
  if (event.key === 'Enter' && isOpen.value && (composing.value || event.isComposing)) {
    event.preventDefault()
    return
  }
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    if (!isOpen.value) setOpen(true, 'trigger', event)
    const previousIndex = currentActiveIndex.value
    const enabled = filteredOptions.value
      .map((item) => props.options.indexOf(item))
      .filter((index) => !props.options[index]?.disabled)
    if (!enabled.length) return
    let position = enabled.indexOf(currentActiveIndex.value)
    if (position < 0) position = event.key === 'ArrowDown' ? -1 : enabled.length
    position = (position + (event.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length
    setActiveIndex(enabled[position]!)
    if (
      position === enabled.length - 1 &&
      currentActiveIndex.value !== previousIndex &&
      props.remote
    )
      emit('loadMore', { query: query.value, lastKey: props.options[enabled[position]!]!.value })
    return
  }
  if (event.key === 'Enter' && isOpen.value && !composing.value && !event.isComposing) {
    if (activeItem.value) {
      event.preventDefault()
      choose(activeItem.value, event)
    } else if (props.creatable && query.value.trim()) {
      event.preventDefault()
      emit('create', { query: query.value, originalEvent: event })
    }
  } else if (event.key === 'Escape' && isOpen.value) {
    event.preventDefault()
    setOpen(false, 'escape', event)
  } else if (event.key === 'Tab' && isOpen.value) setOpen(false, 'programmatic')
}
function onOutside(event: PointerEvent) {
  if (isOpen.value && !root.value?.contains(event.target as Node)) setOpen(false, 'outside', event)
}
function onDocumentKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isOpen.value) {
    event.preventDefault()
    event.stopPropagation()
    setOpen(false, 'escape', event)
  }
}
function resetFromForm(event: Event) {
  queueMicrotask(() => {
    if (event.defaultPrevented) return
    const next = props.defaultValue ?? (props.multiple ? [] : null)
    localValue.value = next
    localQuery.value = props.defaultQuery
    setActiveIndex(-1)
    setOpen(false, 'programmatic')
    if (props.modelValue !== undefined) emit('update:modelValue', next)
    if (props.query !== undefined) emit('update:query', props.defaultQuery)
  })
}
function focus() {
  input.value?.focus()
}
function blur() {
  input.value?.blur()
}
defineExpose({ focus, blur, select: () => input.value?.select(), clear })
</script>

<template>
  <div
    ref="root"
    v-bind="ui?.root?.attrs"
    :class="[
      'aven-combobox',
      {
        'is-open': isOpen,
        'is-disabled': disabled,
        'is-invalid': invalid || !!error,
        'is-multiple': multiple,
        'is-unstyled': unstyled,
      },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[
      attrs.style,
      ui?.root?.style,
      popupWidth ? { '--aven-combobox-popup-width': popupWidth } : undefined,
    ]"
  >
    <label v-if="label || $slots.label" :for="inputId" class="combobox-label"
      ><slot name="label"
        >{{ label }}<span v-if="required" aria-hidden="true"> *</span></slot
      ></label
    >
    <div class="combobox-control" :class="ui?.control?.class" :style="ui?.control?.style">
      <span v-if="$slots.leading" :class="ui?.leading?.class"><slot name="leading" /></span>
      <div v-if="multiple && selectedValues.length" class="combobox-chips" role="list">
        <slot name="selected" :items="allSelectedItems">
          <span
            v-for="item in allSelectedItems"
            :key="`${typeof item.value}:${String(item.value)}`"
            role="listitem"
            :class="['combobox-chip', ui?.chip?.class]"
            :style="ui?.chip?.style"
            v-bind="ui?.chip?.attrs"
          >
            <slot
              name="chip"
              :item="item"
              :disabled="disabled || readonly"
              :remove="(event: MouseEvent) => removeItem(item.value, event)"
              >{{ item.label
              }}<button
                type="button"
                :disabled="disabled || readonly"
                :aria-label="`Remove ${item.label}`"
                @click="removeItem(item.value, $event)"
              >
                ×
              </button></slot
            >
          </span>
        </slot>
      </div>
      <input
        ref="input"
        v-bind="{ ...nativeAttrs, ...ui?.control?.attrs }"
        type="text"
        :id="inputId"
        :value="isOpen ? query : multiple ? query : selectedLabel"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="false"
        :aria-label="
          !label && !$slots.label ? String(nativeAttrs['aria-label'] ?? '') || undefined : undefined
        "
        role="combobox"
        aria-autocomplete="list"
        :aria-expanded="isOpen"
        :aria-controls="listId"
        :aria-activedescendant="isOpen ? activeId : undefined"
        :aria-haspopup="'listbox'"
        :aria-required="required || undefined"
        :aria-invalid="invalid || !!error || (required && !selectedValues.length) || undefined"
        :aria-describedby="
          [description || $slots.description ? descriptionId : '', error ? errorId : '']
            .filter(Boolean)
            .join(' ') || undefined
        "
        :readonly="readonly || undefined"
        class="combobox-input"
        @focus="onFocus"
        @blur="emit('blur', $event)"
        @input="onInput"
        @keydown="onKeydown"
        @compositionstart="composing = true"
        @compositionend="onCompositionEnd"
      />
      <span v-if="$slots.trailing" :class="ui?.trailing?.class"><slot name="trailing" /></span>
      <button
        v-if="clearable && selectedValues.length"
        type="button"
        :disabled="disabled || readonly"
        :aria-label="clearLabel"
        :class="['combobox-clear', ui?.clear?.class]"
        :style="ui?.clear?.style"
        v-bind="ui?.clear?.attrs"
        @click="clear"
      >
        ×
      </button>
      <input
        v-for="selected in name ? selectedValues : []"
        :key="`${typeof selected}:${String(selected)}`"
        type="hidden"
        :name="name"
        :value="selected"
        :disabled="disabled"
      />
    </div>
    <p v-if="description || $slots.description" :id="descriptionId" class="combobox-description">
      <slot name="description">{{ description }}</slot>
    </p>
    <p v-if="error" :id="errorId" class="combobox-error" role="alert">
      <slot name="error" :error="error">{{ error }}</slot>
    </p>
    <div
      :hidden="!isOpen"
      :class="['combobox-popup', `place-${placement}`, ui?.popup?.class]"
      :style="[ui?.popup?.style]"
      v-bind="ui?.popup?.attrs"
    >
      <div v-if="$slots['popup-header']" class="popup-header"><slot name="popup-header" /></div>
      <div
        :id="listId"
        role="listbox"
        :aria-label="label || String(nativeAttrs['aria-label'] ?? 'Options')"
        :aria-multiselectable="multiple || undefined"
        class="combobox-options"
      >
        <template v-if="loading"
          ><slot name="loading"><span role="status">Loading options…</span></slot></template
        >
        <template v-else-if="error"
          ><div class="combobox-empty" role="status">{{ error }}</div></template
        >
        <template v-else>
          <template
            v-for="group in groupedOptions"
            :key="group.group === undefined ? 'ungrouped' : `${typeof group.group}:${group.group}`"
          >
            <div
              v-if="group.group !== undefined"
              role="group"
              :aria-label="String(group.group)"
              class="combobox-group"
            >
              <slot name="group" :group="group.group">{{ group.group }}</slot>
              <div
                v-for="entry in group.options"
                :id="`${listId}-option-${entry.index}`"
                :key="`${typeof entry.item.value}:${String(entry.item.value)}`"
                role="option"
                :aria-selected="isSelected(entry.item.value)"
                :aria-disabled="entry.item.disabled || undefined"
                :class="[
                  'combobox-option',
                  {
                    'is-active': currentActiveIndex === entry.index,
                    'is-selected': isSelected(entry.item.value),
                    'is-disabled': entry.item.disabled,
                  },
                  ui?.option?.class,
                ]"
                :style="ui?.option?.style"
                v-bind="ui?.option?.attrs"
                @mousedown.prevent
                @mouseenter="!entry.item.disabled && setActiveIndex(entry.index)"
                @click="choose(entry.item, $event)"
              >
                <slot
                  name="option"
                  :item="entry.item"
                  :key="entry.item.value"
                  :index="entry.index"
                  :selected="isSelected(entry.item.value)"
                  :active="currentActiveIndex === entry.index"
                  :disabled="!!entry.item.disabled"
                  >{{ entry.item.label
                  }}<small v-if="entry.item.description">{{ entry.item.description }}</small></slot
                >
              </div>
            </div>
            <template v-else
              ><div
                v-for="entry in group.options"
                :id="`${listId}-option-${entry.index}`"
                :key="`${typeof entry.item.value}:${String(entry.item.value)}`"
                role="option"
                :aria-selected="isSelected(entry.item.value)"
                :aria-disabled="entry.item.disabled || undefined"
                :class="[
                  'combobox-option',
                  {
                    'is-active': currentActiveIndex === entry.index,
                    'is-selected': isSelected(entry.item.value),
                    'is-disabled': entry.item.disabled,
                  },
                  ui?.option?.class,
                ]"
                :style="ui?.option?.style"
                v-bind="ui?.option?.attrs"
                @mousedown.prevent
                @mouseenter="!entry.item.disabled && setActiveIndex(entry.index)"
                @click="choose(entry.item, $event)"
              >
                <slot
                  name="option"
                  :item="entry.item"
                  :key="entry.item.value"
                  :index="entry.index"
                  :selected="isSelected(entry.item.value)"
                  :active="currentActiveIndex === entry.index"
                  :disabled="!!entry.item.disabled"
                  >{{ entry.item.label
                  }}<small v-if="entry.item.description">{{ entry.item.description }}</small></slot
                >
              </div></template
            >
          </template>
          <div
            v-if="creatable && query.trim() && !filteredOptions.length && !loading"
            role="option"
            aria-selected="false"
            class="combobox-option create-option"
            @mousedown.prevent
            @click="emit('create', { query, originalEvent: $event })"
          >
            <slot name="create" :query="query">Create “{{ query }}”</slot>
          </div>
          <div v-if="!filteredOptions.length && !creatable" class="combobox-empty">
            <slot name="empty" :query="query">No options found.</slot>
          </div>
        </template>
      </div>
      <div v-if="$slots['popup-footer']" class="popup-footer"><slot name="popup-footer" /></div>
    </div>
  </div>
</template>

<style scoped>
.aven-combobox {
  position: relative;
  display: grid;
  gap: var(--aven-space-1);
  min-inline-size: 0;
  color: var(--aven-color-text-primary);
}
.combobox-label {
  font-weight: 600;
}
.combobox-control {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--aven-space-2);
  min-block-size: 2.75rem;
  padding: var(--aven-space-1) var(--aven-space-3);
  border: 1px solid var(--aven-color-border-interactive);
  border-radius: var(--aven-radius-md);
  background: var(--aven-color-surface-base);
}
.combobox-control:focus-within {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 1px;
}
.combobox-input {
  flex: 1;
  min-inline-size: 5rem;
  min-block-size: 2.25rem;
  padding: var(--aven-space-1);
  border: 0;
  outline: 0;
  background: transparent;
  color: inherit;
  font: inherit;
}
.combobox-input:focus-visible {
  outline: 0;
}
.combobox-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--aven-space-1);
}
.combobox-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--aven-space-1);
  max-inline-size: 100%;
  padding: 0.125rem var(--aven-space-2);
  border-radius: 999px;
  background: var(--aven-color-surface-selected);
  color: var(--aven-color-text-primary);
  overflow-wrap: anywhere;
}
.combobox-chip button,
.combobox-clear {
  min-inline-size: 1.75rem;
  min-block-size: 1.75rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.combobox-popup {
  position: absolute;
  z-index: 950;
  inset-inline: 0;
  display: grid;
  inline-size: var(--aven-combobox-popup-width, 100%);
  max-block-size: min(20rem, 70vh);
  overflow: auto;
  border: 1px solid var(--aven-color-border-subtle);
  border-radius: var(--aven-radius-md);
  background: var(--aven-color-surface-popover);
  color: var(--aven-color-text-primary);
  box-shadow: 0 8px 24px var(--aven-color-shadow-ambient);
}
.place-bottom {
  inset-block-start: calc(100% + var(--aven-space-1));
}
.place-top {
  inset-block-end: calc(100% + var(--aven-space-1));
}
.combobox-options {
  overflow: auto;
  padding: var(--aven-space-1);
}
.combobox-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--aven-space-2);
  min-block-size: 2.5rem;
  padding: var(--aven-space-2) var(--aven-space-3);
  border-radius: var(--aven-radius-sm);
  cursor: pointer;
}
.combobox-option.is-active {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: -2px;
}
.combobox-option.is-selected {
  background: var(--aven-color-surface-selected);
}
.combobox-option.is-disabled {
  color: var(--aven-color-text-disabled);
  cursor: not-allowed;
}
.combobox-description,
.combobox-error {
  margin: 0;
  font-size: var(--aven-font-size-sm);
}
.combobox-description {
  color: var(--aven-color-text-secondary);
}
.combobox-error {
  color: var(--aven-color-danger-text);
}
.popup-header,
.popup-footer {
  padding: var(--aven-space-2) var(--aven-space-3);
  border-block-end: 1px solid var(--aven-color-border-subtle);
}
.popup-footer {
  border-block-start: 1px solid var(--aven-color-border-subtle);
  border-block-end: 0;
}
.combobox-empty {
  padding: var(--aven-space-3);
  color: var(--aven-color-text-secondary);
}
.is-invalid .combobox-control {
  border-color: var(--aven-color-border-invalid);
}
.is-disabled {
  color: var(--aven-color-text-disabled);
}
.is-unstyled .combobox-control,
.is-unstyled .combobox-popup {
  border: 0;
  border-radius: 0;
  box-shadow: none;
}
@media (forced-colors: active) {
  .combobox-option.is-active {
    outline: 2px solid Highlight;
  }
  .combobox-option.is-selected {
    border: 1px solid SelectedItem;
  }
}
</style>
