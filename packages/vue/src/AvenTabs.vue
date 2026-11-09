<script setup lang="ts" generic="Key extends string | number = string">
import { computed, nextTick, ref, shallowRef, watch, useAttrs } from 'vue'
import { useAvenId } from './composables.js'
import AvenTab from './AvenTab.vue'
import AvenTabPanel from './AvenTabPanel.vue'
import type { AvenTabsEvents, AvenTabsProps, AvenTabsSlots } from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenTabsProps<Key>>(), {
  orientation: 'horizontal',
  activation: 'automatic',
  variant: 'underline',
  keepAlive: false,
  lazy: true,
  loop: true,
  unstyled: false,
  label: 'Tabs',
})
const emit = defineEmits<AvenTabsEvents<Key>>()
defineSlots<AvenTabsSlots<Key>>()
const attrs = useAttrs()
const root = ref<HTMLElement>()
const base = useAvenId(props.id, 'tabs')
const firstEnabled = () => props.items.find((item) => !item.disabled)?.key
const isEnabled = (key: Key | undefined) =>
  props.items.some((item) => Object.is(item.key, key) && !item.disabled)
const requestedDefault = props.defaultValue
const validDefault = props.items.some(
  (item) => Object.is(item.key, requestedDefault) && !item.disabled,
)
  ? requestedDefault
  : undefined
const local = ref<Key | undefined>(validDefault ?? firstEnabled())
const selected = computed(() => (props.modelValue !== undefined ? props.modelValue : local.value))
const focused = ref<Key | undefined>(isEnabled(selected.value) ? selected.value : firstEnabled())
const refs = ref<Array<{ focus: () => void } | undefined>>([])
const visited = shallowRef(new Set<Key>(selected.value === undefined ? [] : [selected.value]))
const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return { ...rest, ...props.ui?.root?.attrs }
})
const selectedItem = computed(() => props.items.find((item) => Object.is(item.key, selected.value)))
watch(
  () => props.modelValue,
  (value) => {
    if (value !== undefined) {
      local.value = value
      focused.value = isEnabled(value) ? value : firstEnabled()
      visited.value = new Set([...visited.value, value])
    }
  },
)
watch(
  () => props.items.map((item) => item.key),
  () => {
    if (
      selected.value !== undefined &&
      props.items.some((item) => Object.is(item.key, selected.value))
    )
      return
    const fallback = firstEnabled()
    if (fallback === undefined) {
      focused.value = undefined
      return
    }
    if (props.modelValue === undefined) local.value = fallback
    focused.value = fallback
    visited.value = new Set([...visited.value, fallback])
    emit('update:modelValue', fallback)
    emit('change', fallback)
    void nextTick(() =>
      refs.value[props.items.findIndex((item) => Object.is(item.key, fallback))]?.focus(),
    )
  },
)
function activate(key: Key) {
  const item = props.items.find((candidate) => Object.is(candidate.key, key))
  if (!item || item.disabled || Object.is(selected.value, key)) return
  if (props.modelValue === undefined) local.value = key
  visited.value = new Set([...visited.value, key])
  emit('update:modelValue', key)
  emit('change', key)
}
function setTabRef(index: number, element: unknown) {
  if (element && typeof element === 'object' && 'focus' in element)
    refs.value[index] = element as { focus: () => void }
}
function onTabFocus(item: (typeof props.items)[number]) {
  focused.value = item.key
  if (props.activation === 'automatic') activate(item.key)
}
function move(delta: number | 'first' | 'last') {
  const enabled = props.items.filter((item) => !item.disabled)
  if (!enabled.length) return
  const current = enabled.findIndex((item) => Object.is(item.key, focused.value))
  let next = delta === 'first' ? 0 : delta === 'last' ? enabled.length - 1 : current + delta
  if (props.loop && typeof delta === 'number') next = (next + enabled.length) % enabled.length
  else next = Math.max(0, Math.min(enabled.length - 1, next))
  const item = enabled[next]!
  focused.value = item.key
  refs.value[props.items.indexOf(item)]?.focus()
}
function keydown(event: KeyboardEvent, index: number) {
  const rtl =
    root.value?.closest('[dir]')?.getAttribute('dir') === 'rtl' ||
    (!root.value?.closest('[dir]') && typeof document !== 'undefined' && document.dir === 'rtl')
  const forward =
    props.orientation === 'horizontal' ? (rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown'
  const back = props.orientation === 'horizontal' ? (rtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp'
  if (event.key === forward) {
    event.preventDefault()
    move(1)
  } else if (event.key === back) {
    event.preventDefault()
    move(-1)
  } else if (event.key === 'Home') {
    event.preventDefault()
    move('first')
  } else if (event.key === 'End') {
    event.preventDefault()
    move('last')
  } else if (props.activation === 'manual' && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault()
    const item = props.items[index]
    if (item) activate(item.key)
  }
}
function close(item: (typeof props.items)[number], event: MouseEvent) {
  if (!item.closable || item.disabled) return
  emit('close', { key: item.key, originalEvent: event })
}
</script>
<template>
  <div
    v-bind="{ ...ui?.root?.attrs, ...rootAttrs }"
    ref="root"
    :class="[
      'aven-tabs',
      `is-${orientation}`,
      `variant-${variant}`,
      { 'is-unstyled': unstyled },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[attrs.style, ui?.root?.style]"
  >
    <div
      v-bind="ui?.list?.attrs"
      :id="`${base}-list`"
      role="tablist"
      :aria-orientation="orientation"
      :aria-label="label"
      :class="['tabs-list', ui?.list?.class]"
      :style="ui?.list?.style"
    >
      <AvenTab
        v-for="(item, index) in items"
        :key="item.key"
        :ref="(element) => setTabRef(index, element)"
        :item="item"
        :id="`${base}-tab-${index}`"
        :controls="`${base}-panel-${index}`"
        :selected="Object.is(selected, item.key)"
        :active="Object.is(focused, item.key)"
        :tabindex="Object.is(focused, item.key) ? 0 : -1"
        :disabled="item.disabled"
        :unstyled="unstyled"
        :ui="{ root: ui?.tab }"
        class="tabs-tab"
        @activate="activation === 'manual' ? activate(item.key) : undefined"
        @focus="onTabFocus(item)"
        @keydown="keydown($event, index)"
      >
        <template #default="scope">
          <slot name="tab" v-bind="scope">
            <slot name="leading" :item="item" /><span>{{ item.label }}</span>
            <slot name="badge" :item="item" /><slot name="trailing" :item="item" />
          </slot>
        </template>
      </AvenTab>
    </div>
    <slot name="overflow" :items="items" :active-key="selected" />
    <div
      v-if="selectedItem?.closable"
      class="tabs-actions"
      role="group"
      :aria-label="`${selectedItem.label} tab actions`"
    >
      <button
        type="button"
        class="tab-close"
        :disabled="selectedItem.disabled"
        :class="ui?.close?.class"
        :style="ui?.close?.style"
        v-bind="ui?.close?.attrs"
        :aria-label="`Close ${selectedItem.label}`"
        @click="close(selectedItem, $event)"
      >
        <slot name="close-icon" :item="selectedItem">×</slot>
      </button>
    </div>
    <template v-for="(item, index) in items" :key="`panel-${item.key}`"
      ><AvenTabPanel
        v-if="Object.is(selected, item.key) || !lazy || (keepAlive && visited.has(item.key))"
        :item="item"
        :id="`${base}-panel-${index}`"
        :labelled-by="`${base}-tab-${index}`"
        :active="Object.is(selected, item.key)"
        :unstyled="unstyled"
        :ui="{ root: ui?.panel }"
        class="tabs-panel"
      >
        <template #default="scope">
          <slot name="panel" v-bind="scope">{{ item.label }}</slot>
        </template>
      </AvenTabPanel></template
    >
  </div>
</template>
<style scoped>
.aven-tabs {
  min-inline-size: 0;
  color: var(--aven-color-text-primary);
}
.tabs-list {
  display: flex;
  gap: var(--aven-space-2);
  overflow: auto;
  scrollbar-width: thin;
}
.is-vertical {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--aven-space-4);
}
.is-vertical .tabs-list {
  flex-direction: column;
  overflow: visible;
}
.tabs-tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--aven-space-2);
  min-block-size: 2.5rem;
  padding: var(--aven-space-2) var(--aven-space-4);
  border: 0;
  border-block-end: 0.125rem solid transparent;
  background: transparent;
  color: var(--aven-color-text-secondary);
  font: inherit;
  white-space: nowrap;
  cursor: pointer;
}
.tabs-tab.is-selected {
  border-color: var(--aven-color-accent-border);
  color: var(--aven-color-text-primary);
}
.tabs-tab:focus-visible {
  outline: 0.125rem solid var(--aven-color-focus-ring);
  outline-offset: -0.125rem;
}
.variant-pill .tabs-tab {
  border-radius: 999rem;
  border: 0;
}
.variant-pill .tabs-tab.is-selected {
  background: var(--aven-color-surface-selected);
}
.variant-boxed .tabs-tab {
  border: 0.0625rem solid var(--aven-color-border-subtle);
  border-radius: var(--aven-radius-md);
}
.variant-boxed .tabs-tab.is-selected {
  background: var(--aven-color-surface-selected);
}
.tab-close {
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.tabs-panel {
  min-inline-size: 0;
  padding-block: var(--aven-space-4);
}
.tabs-panel:focus-visible {
  outline: 0.125rem solid var(--aven-color-focus-ring);
}
.is-unstyled .tabs-tab {
  border: 0;
  border-radius: 0;
  background: transparent;
  color: inherit;
}
.is-unstyled .tabs-panel {
  padding: 0;
}
</style>
