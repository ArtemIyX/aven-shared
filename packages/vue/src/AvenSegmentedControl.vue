<script setup lang="ts" generic="T extends string | number">
import { computed, ref, watch } from 'vue'
import type { AvenOption, AvenSize, AvenUi } from './types.js'
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
const emit = defineEmits<{ 'update:modelValue': [value: T]; change: [value: T] }>()
const local = ref<T | null>(props.defaultValue ?? null),
  selected = computed(() => (props.modelValue !== undefined ? props.modelValue : local.value)),
  buttons = ref<HTMLButtonElement[]>([])
watch(
  () => props.modelValue,
  (v) => {
    if (v !== undefined) local.value = v
  },
)
function choose(item: AvenOption<T>) {
  if (item.disabled) return
  if (props.allowEmpty && Object.is(selected.value, item.value)) return
  local.value = item.value
  emit('update:modelValue', item.value)
  emit('change', item.value)
}
function keydown(e: KeyboardEvent, index: number) {
  const fwd = props.orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown',
    back = props.orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp'
  let next = -1
  if (e.key === fwd) next = index + 1
  else if (e.key === back) next = index - 1
  else if (e.key === 'Home') next = 0
  else if (e.key === 'End') next = props.items.length - 1
  if (next >= 0) {
    e.preventDefault()
    for (let n = 0; n < props.items.length; n++) {
      const i = (next + n + props.items.length) % props.items.length
      if (!props.items[i]?.disabled) {
        buttons.value[i]?.focus()
        choose(props.items[i]!)
        break
      }
    }
  }
}
function setButtonRef(index: number, element: unknown) {
  if (element && typeof element === 'object' && 'focus' in element)
    buttons.value[index] = element as HTMLButtonElement
}
</script>
<template>
  <div
    :role="'radiogroup'"
    :aria-orientation="orientation"
    :class="[
      'aven-segmented-control',
      `is-${orientation}`,
      `size-${size}`,
      { 'is-block': block, 'is-unstyled': unstyled },
      ui?.root?.class,
    ]"
    :style="ui?.root?.style"
  >
    <button
      v-for="(item, index) in items"
      :key="String(item.value)"
      :ref="(element) => setButtonRef(index, element)"
      type="button"
      role="radio"
      :aria-checked="Object.is(selected, item.value)"
      :tabindex="Object.is(selected, item.value) || (selected === null && index === 0) ? 0 : -1"
      :disabled="item.disabled"
      :class="['segment-item', { 'is-selected': Object.is(selected, item.value) }, ui?.item?.class]"
      :style="ui?.item?.style"
      @click="choose(item)"
      @keydown="keydown($event, index)"
    >
      <span v-if="$slots.leading" :class="ui?.leading?.class"
        ><slot name="leading" :item="item" /></span
      ><slot
        name="item"
        :item="item"
        :key="item.value"
        :selected="Object.is(selected, item.value)"
        :disabled="!!item.disabled"
        >{{ item.label }}</slot
      ><span v-if="$slots.trailing" :class="ui?.trailing?.class"
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
