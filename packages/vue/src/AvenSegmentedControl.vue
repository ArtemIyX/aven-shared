<script setup lang="ts" generic="T extends string | number">
import { computed, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue'
import type { AvenOption, AvenSize, AvenUi } from './types.js'
defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    modelValue?: T | null
    defaultValue?: T | null
    items: AvenOption<T>[]
    allowEmpty?: boolean
    block?: boolean
    orientation?: 'horizontal' | 'vertical'
    size?: AvenSize
    name?: string
    unstyled?: boolean
    ui?: AvenUi<'root' | 'item' | 'indicator' | 'leading' | 'trailing'>
  }>(),
  {
    defaultValue: null,
    allowEmpty: false,
    block: false,
    orientation: 'horizontal',
    size: 'md',
    unstyled: false,
  },
)
const emit = defineEmits<{ 'update:modelValue': [value: T | null]; change: [value: T | null] }>()
const attrs = useAttrs()
const initialValue = props.defaultValue ?? null
const local = ref<T | null>(props.defaultValue ?? null),
  selected = computed(() => (props.modelValue !== undefined ? props.modelValue : local.value)),
  tabValue = computed(
    () =>
      props.items.find((item) => !item.disabled && Object.is(item.value, selected.value))?.value ??
      props.items.find((item) => !item.disabled)?.value,
  ),
  root = ref<HTMLElement>(),
  buttons = ref<HTMLButtonElement[]>([])
watch(
  () => props.modelValue,
  (v) => {
    if (v !== undefined) local.value = v
  },
)
function choose(item: AvenOption<T>, toggle = false) {
  if (item.disabled) return
  const next = Object.is(selected.value, item.value)
    ? toggle && props.allowEmpty
      ? null
      : selected.value
    : item.value
  if (Object.is(next, selected.value)) return
  local.value = next
  emit('update:modelValue', next)
  emit('change', next)
}
function keydown(e: KeyboardEvent, index: number) {
  const rtl =
    root.value?.closest('[dir]')?.getAttribute('dir') === 'rtl' ||
    (!root.value?.closest('[dir]') && typeof document !== 'undefined' && document.dir === 'rtl')
  const fwd = props.orientation === 'horizontal' ? (rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown',
    back = props.orientation === 'horizontal' ? (rtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp'
  let next: number
  let step = 1
  if (e.key === fwd) next = index + 1
  else if (e.key === back) {
    next = index - 1
    step = -1
  } else if (e.key === 'Home') next = 0
  else if (e.key === 'End') {
    next = props.items.length - 1
    step = -1
  } else return
  if (props.items.length) {
    e.preventDefault()
    for (let n = 0; n < props.items.length; n++) {
      const i = (next + step * n + props.items.length * 2) % props.items.length
      if (!props.items[i]?.disabled) {
        buttons.value[i]?.focus()
        choose(props.items[i]!)
        break
      }
    }
  }
}
let form: HTMLFormElement | null = null
function reset(event: Event) {
  queueMicrotask(() => {
    if (event.defaultPrevented) return
    const next = initialValue
    local.value = next
    if (props.modelValue !== undefined) emit('update:modelValue', next)
  })
}
onMounted(() => {
  form = root.value?.closest('form') ?? null
  form?.addEventListener('reset', reset)
})
onBeforeUnmount(() => form?.removeEventListener('reset', reset))
function setButtonRef(index: number, element: unknown) {
  if (element && typeof element === 'object' && 'focus' in element)
    buttons.value[index] = element as HTMLButtonElement
}
</script>
<template>
  <div
    ref="root"
    v-bind="{ ...attrs, ...ui?.root?.attrs }"
    :role="'radiogroup'"
    :aria-orientation="orientation"
    :class="[
      'aven-segmented-control',
      `is-${orientation}`,
      `size-${size}`,
      { 'is-block': block, 'is-unstyled': unstyled },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[attrs.style, ui?.root?.style]"
  >
    <button
      v-for="(item, index) in items"
      :key="String(item.value)"
      :ref="(element) => setButtonRef(index, element)"
      v-bind="ui?.item?.attrs"
      type="button"
      role="radio"
      :aria-checked="Object.is(selected, item.value)"
      :tabindex="Object.is(tabValue, item.value) && !item.disabled ? 0 : -1"
      :disabled="item.disabled"
      :class="['segment-item', { 'is-selected': Object.is(selected, item.value) }, ui?.item?.class]"
      :style="ui?.item?.style"
      @click="choose(item, true)"
      @keydown="keydown($event, index)"
    >
      <span
        v-if="$slots.leading"
        v-bind="ui?.leading?.attrs"
        :class="ui?.leading?.class"
        :style="ui?.leading?.style"
        ><slot name="leading" :item="item" /></span
      ><slot
        name="item"
        :item="item"
        :key="item.value"
        :selected="Object.is(selected, item.value)"
        :disabled="!!item.disabled"
        >{{ item.label }}</slot
      ><span
        v-if="$slots.trailing"
        v-bind="ui?.trailing?.attrs"
        :class="ui?.trailing?.class"
        :style="ui?.trailing?.style"
        ><slot name="trailing" :item="item"
      /></span></button
    ><input v-if="name && selected !== null" type="hidden" :name="name" :value="selected" />
  </div>
</template>
<style scoped>
.aven-segmented-control {
  display: inline-flex;
  align-items: stretch;
  gap: 0.2rem;
  padding: 0.2rem;
  border: 1px solid var(--aven-color-border-subtle);
  border-radius: 999px;
  background: var(--aven-color-surface-recessed);
  max-inline-size: 100%;
}
.is-vertical {
  flex-direction: column;
  border-radius: var(--aven-radius-md);
}
.is-block {
  display: flex;
}
.segment-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--aven-space-2);
  min-block-size: 2rem;
  padding: var(--aven-space-2) var(--aven-space-3);
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--aven-color-text-secondary);
  font: inherit;
  cursor: pointer;
}
.is-vertical .segment-item {
  justify-content: flex-start;
  border-radius: var(--aven-radius-sm);
}
.segment-item.is-selected {
  background: var(--aven-color-surface-base);
  color: var(--aven-color-text-primary);
  box-shadow: 0 1px 3px var(--aven-color-shadow-ambient);
}
.segment-item:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: -2px;
}
.segment-item:disabled {
  color: var(--aven-color-text-disabled);
  cursor: not-allowed;
}
.size-xs .segment-item {
  min-block-size: 1.5rem;
  padding: var(--aven-space-1) var(--aven-space-2);
  font-size: var(--aven-font-size-xs);
}
.size-lg .segment-item {
  min-block-size: 2.75rem;
  padding-inline: var(--aven-space-4);
}
.is-unstyled {
  border: 0;
  border-radius: 0;
  background: transparent;
  padding: 0;
}
</style>
