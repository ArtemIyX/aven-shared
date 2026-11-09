<script setup lang="ts" generic="T extends string | number">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, useAttrs } from 'vue'
import { useAvenId } from './composables.js'
import type {
  AvenOption,
  AvenSwitcherEvents,
  AvenSwitcherProps,
  AvenSwitcherSlots,
} from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenSwitcherProps<T>>(), {
  defaultValue: null,
  searchable: false,
  loading: false,
  disabled: false,
  unstyled: false,
})
const emit = defineEmits<AvenSwitcherEvents<T>>()
defineSlots<AvenSwitcherSlots<T>>()
const attrs = useAttrs()
const id = useAvenId(undefined, 'switcher')
const open = ref(false)
const query = ref('')
const localValue = shallowRef<T | null>(props.defaultValue)
const value = computed(() => (props.modelValue === undefined ? localValue.value : props.modelValue))
const selected = computed(() =>
  props.options.find((option) => Object.is(option.value, value.value)),
)
const filtered = computed(() => {
  const text = query.value.trim().toLocaleLowerCase()
  return !props.searchable || !text
    ? props.options
    : props.options.filter((option) =>
        `${option.label} ${(option.keywords ?? []).join(' ')}`.toLocaleLowerCase().includes(text),
      )
})
const activeIndex = ref(-1)
const list = ref<HTMLElement>()
const trigger = ref<HTMLButtonElement>()
const search = ref<HTMLInputElement>()
const listId = `${id}-listbox`
const activeId = computed(() =>
  activeIndex.value >= 0 ? `${listId}-option-${activeIndex.value}` : undefined,
)
let typeahead = ''
let typeaheadTimer: ReturnType<typeof setTimeout> | undefined
function isDisabled(option: AvenOption<T>) {
  return !!option.disabled
}
function setValue(option: AvenOption<T>, originalEvent: Event) {
  if (isDisabled(option)) return
  if (Object.is(option.value, value.value)) {
    close()
    return
  }
  if (props.modelValue === undefined) localValue.value = option.value
  emit('update:modelValue', option.value)
  emit('change', option.value)
  open.value = false
  query.value = ''
  trigger.value?.focus()
  void originalEvent
}
async function show() {
  if (props.disabled || props.loading) return
  open.value = true
  query.value = ''
  activeIndex.value = Math.max(
    0,
    filtered.value.findIndex((option) => Object.is(option.value, value.value)),
  )
  await nextTick()
  if (props.searchable) search.value?.focus()
  else list.value?.focus()
}
function close(restore = true) {
  open.value = false
  query.value = ''
  if (restore) trigger.value?.focus()
}
function onKeydown(event: KeyboardEvent) {
  if (event.target === search.value && (event.key === 'Home' || event.key === 'End')) return
  if (
    !props.searchable &&
    event.key.length === 1 &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey
  ) {
    typeahead += event.key.toLocaleLowerCase()
    clearTimeout(typeaheadTimer)
    typeaheadTimer = setTimeout(() => (typeahead = ''), 600)
    const match = filtered.value.findIndex(
      (option) => !isDisabled(option) && option.label.toLocaleLowerCase().startsWith(typeahead),
    )
    if (match >= 0) activeIndex.value = match
    return
  }
  const enabled = filtered.value
    .map((option, index) => ({ option, index }))
    .filter(({ option }) => !isDisabled(option))
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }
  if (event.key === 'Tab') {
    close(false)
    return
  }
  if (event.key === 'Enter' && activeIndex.value >= 0) {
    event.preventDefault()
    const option = filtered.value[activeIndex.value]
    if (option) setValue(option, event)
    return
  }
  const delta = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0
  if (delta || event.key === 'Home' || event.key === 'End') {
    if (!enabled.length) return
    event.preventDefault()
    const current = enabled.findIndex(({ index }) => index === activeIndex.value)
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? enabled.length - 1
          : Math.max(0, Math.min(enabled.length - 1, current + delta))
    activeIndex.value = enabled[next]!.index
    list.value
      ?.querySelector<HTMLElement>(`#${listId}-option-${activeIndex.value}`)
      ?.scrollIntoView?.({ block: 'nearest' })
  }
}
function onPointerDown(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) close(false)
}
const root = ref<HTMLElement>()
let documentRef: Document | undefined
function listen() {
  documentRef = root.value?.ownerDocument
  documentRef?.addEventListener('pointerdown', onPointerDown)
}
function unlisten() {
  documentRef?.removeEventListener('pointerdown', onPointerDown)
  documentRef = undefined
}
let form: HTMLFormElement | null = null
function reset(event: Event) {
  queueMicrotask(() => {
    if (!event.defaultPrevented && props.modelValue === undefined)
      localValue.value = props.defaultValue
  })
}
function resetListener() {
  form?.removeEventListener('reset', reset)
  form = root.value?.closest('form') ?? null
  form?.addEventListener('reset', reset)
}
function toggle() {
  if (open.value) close(false)
  else void show()
}
function triggerAttrs() {
  return {
    type: 'button' as const,
    'aria-label': props.label,
    'aria-haspopup': 'listbox' as const,
    'aria-expanded': open.value,
    'aria-controls': listId,
    disabled: props.disabled || props.loading,
    onClick: toggle,
    onKeydown: (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        void show()
      }
    },
  }
}
function optionId(index: number) {
  return `${listId}-option-${index}`
}
onMounted(() => {
  listen()
  resetListener()
})
onBeforeUnmount(() => {
  unlisten()
  form?.removeEventListener('reset', reset)
  clearTimeout(typeaheadTimer)
})
</script>

<template>
  <div
    ref="root"
    v-bind="{ ...attrs, ...props.ui?.root?.attrs }"
    :class="[
      'aven-switcher',
      { 'is-open': open, 'is-disabled': props.disabled, 'is-unstyled': props.unstyled },
      attrs.class,
      props.ui?.root?.class,
    ]"
    :style="[attrs.style, props.ui?.root?.style]"
  >
    <slot name="leading" :item="selected" />
    <slot
      name="trigger"
      :item="selected"
      :open="open"
      :trigger-attrs="triggerAttrs()"
      :trigger-ref="(element: unknown) => (trigger = element as HTMLButtonElement)"
    >
      <button
        ref="trigger"
        v-bind="{ ...props.ui?.trigger?.attrs, ...triggerAttrs() }"
        class="switcher-trigger"
        :class="props.ui?.trigger?.class"
        :style="props.ui?.trigger?.style"
      >
        <span class="switcher-value">{{
          selected?.label ?? (value === null ? (props.placeholder ?? props.label) : String(value))
        }}</span
        ><span aria-hidden="true">▾</span>
      </button>
    </slot>
    <span v-if="props.loading" class="switcher-status" role="status">Loading…</span>
    <div
      v-bind="props.ui?.popup?.attrs"
      v-if="open"
      class="switcher-popup"
      :class="props.ui?.popup?.class"
      :style="props.ui?.popup?.style"
    >
      <slot name="header" />
      <input
        v-if="props.searchable"
        v-bind="props.ui?.search?.attrs"
        ref="search"
        v-model="query"
        class="switcher-search"
        :class="props.ui?.search?.class"
        :style="props.ui?.search?.style"
        type="search"
        role="combobox"
        :aria-label="`${props.label} search`"
        :aria-expanded="open"
        :aria-controls="listId"
        :aria-activedescendant="activeId"
        aria-autocomplete="list"
        autocomplete="off"
        @input="activeIndex = filtered.length ? 0 : -1"
        @keydown="onKeydown"
      />
      <ul
        :id="listId"
        ref="list"
        class="switcher-options"
        role="listbox"
        :aria-label="props.label"
        :aria-activedescendant="activeId"
        tabindex="0"
        @keydown="onKeydown"
      >
        <li
          v-for="(option, index) in filtered"
          v-bind="props.ui?.option?.attrs"
          :id="optionId(index)"
          :key="option.value"
          class="switcher-option"
          role="option"
          :aria-selected="Object.is(option.value, value)"
          :aria-disabled="option.disabled || undefined"
          :class="[
            {
              'is-active': activeIndex === index,
              'is-selected': Object.is(option.value, value),
              'is-option-disabled': option.disabled,
            },
            props.ui?.option?.class,
          ]"
          :style="props.ui?.option?.style"
          @mouseenter="!option.disabled && (activeIndex = index)"
          @click="setValue(option, $event)"
        >
          <slot
            name="option"
            :item="option"
            :selected="Object.is(option.value, value)"
            :active="activeIndex === index"
            >{{ option.label }}</slot
          >
        </li>
        <li v-if="!filtered.length" class="switcher-empty" role="presentation">No options.</li>
      </ul>
      <slot name="footer" />
    </div>
    <input
      v-if="props.name"
      type="hidden"
      :name="props.name"
      :value="value ?? ''"
      :disabled="props.disabled"
    />
    <slot name="trailing" :item="selected" />
  </div>
</template>

<style scoped>
.aven-switcher {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--aven-space-2);
  min-inline-size: 0;
  max-inline-size: 100%;
  color: var(--aven-color-text-primary);
}
.switcher-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--aven-space-3);
  min-block-size: 2.75rem;
  min-inline-size: 10rem;
  max-inline-size: 100%;
  padding: var(--aven-space-2) var(--aven-space-3);
  border: 0.0625rem solid var(--aven-color-border-interactive);
  border-radius: var(--aven-radius-md);
  background: var(--aven-color-surface-base);
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: pointer;
}
.switcher-trigger:focus-visible,
.switcher-search:focus-visible,
.switcher-options:focus-visible {
  outline: 0.125rem solid var(--aven-color-focus-ring);
  outline-offset: 0.125rem;
}
.switcher-value {
  min-inline-size: 0;
  overflow-wrap: anywhere;
}
.switcher-popup {
  position: absolute;
  z-index: 20;
  inset-block-start: calc(100% + 0.25rem);
  inset-inline-start: 0;
  inline-size: max(100%, 14rem);
  max-inline-size: min(24rem, calc(100vw - 2rem));
  max-block-size: min(24rem, 70vh);
  overflow: auto;
  padding: var(--aven-space-2);
  border: 0.0625rem solid var(--aven-color-border-muted);
  border-radius: var(--aven-radius-md);
  background: var(--aven-color-surface-raised);
  box-shadow: 0 0.5rem 1.75rem var(--aven-color-shadow-ambient);
}
.switcher-search {
  box-sizing: border-box;
  inline-size: 100%;
  min-block-size: 2.75rem;
  margin-block-end: var(--aven-space-2);
  padding: var(--aven-space-2);
  border: 0.0625rem solid var(--aven-color-border-interactive);
  border-radius: var(--aven-radius-sm);
  background: var(--aven-color-surface-base);
  color: inherit;
  font: inherit;
}
.switcher-options {
  max-block-size: 18rem;
  overflow: auto;
  margin: 0;
  padding: 0;
  list-style: none;
}
.switcher-option {
  min-block-size: 2.75rem;
  display: flex;
  align-items: center;
  padding: var(--aven-space-2) var(--aven-space-3);
  border-radius: var(--aven-radius-sm);
  cursor: pointer;
  overflow-wrap: anywhere;
}
.switcher-option.is-active,
.switcher-option:hover {
  background: var(--aven-color-surface-hover);
}
.switcher-option.is-selected {
  color: var(--aven-color-accent-text);
  font-weight: 600;
}
.switcher-option.is-option-disabled {
  color: var(--aven-color-text-disabled);
  cursor: not-allowed;
}
.switcher-empty,
.switcher-status {
  padding: var(--aven-space-2) var(--aven-space-3);
  color: var(--aven-color-text-secondary);
}
.is-disabled {
  color: var(--aven-color-text-disabled);
}
.is-unstyled .switcher-trigger,
.is-unstyled .switcher-popup {
  border: 0;
  border-radius: 0;
  box-shadow: none;
}
@media (max-width: 30rem) {
  .switcher-popup {
    position: fixed;
    inset-inline: 0.5rem;
    inset-block-start: auto;
    inset-block-end: 0.5rem;
    inline-size: auto;
    max-inline-size: none;
  }
}
@media (forced-colors: active) {
  .switcher-trigger,
  .switcher-popup,
  .switcher-option.is-active {
    border: 0.0625rem solid CanvasText;
  }
}
@media print {
  .switcher-popup {
    display: none;
  }
}
</style>
