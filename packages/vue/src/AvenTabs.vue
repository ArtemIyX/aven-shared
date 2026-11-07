<script setup lang="ts" generic="Key extends string | number">
import { computed, ref, shallowRef, watch } from 'vue'
import type { AvenUi } from './types.js'
type TabItem<K> = { key: K; label: string; disabled?: boolean; closable?: boolean }
const props = withDefaults(
  defineProps<{
    items: TabItem<Key>[]
    modelValue?: Key
    defaultValue?: Key
    id?: string
    orientation?: 'horizontal' | 'vertical'
    activation?: 'automatic' | 'manual'
    variant?: 'underline' | 'pill' | 'boxed'
    lazy?: boolean
    loop?: boolean
    unstyled?: boolean
    ui?: AvenUi<'root' | 'list' | 'tab' | 'panel' | 'indicator'>
  }>(),
  {
    orientation: 'horizontal',
    activation: 'automatic',
    variant: 'underline',
    lazy: true,
    loop: true,
    unstyled: false,
  },
)
const emit = defineEmits<{
  'update:modelValue': [value: Key]
  change: [value: Key]
  close: [payload: { key: Key; originalEvent: MouseEvent }]
}>()
const local = ref<Key | undefined>(props.defaultValue ?? props.items[0]?.key),
  selected = computed(() => (props.modelValue !== undefined ? props.modelValue : local.value)),
  focused = ref(selected.value),
  refs = ref<HTMLButtonElement[]>([]),
  visited = shallowRef(new Set<Key>(selected.value === undefined ? [] : [selected.value]))
watch(
  () => props.modelValue,
  (v) => {
    if (v !== undefined) {
      local.value = v
      focused.value = v
    }
  },
)
function activate(key: Key) {
  const item = props.items.find((i) => Object.is(i.key, key))
  if (!item || item.disabled || Object.is(selected.value, key)) return
  local.value = key
  visited.value.add(key)
  emit('update:modelValue', key)
  emit('change', key)
}
function setTabRef(index: number, element: unknown) {
  if (element && typeof element === 'object' && 'focus' in element)
    refs.value[index] = element as HTMLButtonElement
}
function onTabFocus(item: TabItem<Key>) {
  focused.value = item.key
  if (props.activation === 'automatic') activate(item.key)
}
function move(index: number) {
  const enabled = props.items.map((item, i) => ({ item, i })).filter((x) => !x.item.disabled)
  if (!enabled.length) return
  const current = enabled.findIndex((x) => Object.is(x.item.key, focused.value))
  let next = index
  if (props.loop) next = (next + enabled.length) % enabled.length
  else next = Math.max(0, Math.min(enabled.length - 1, next))
  const item = enabled[next]!.item
  focused.value = item.key
  refs.value[props.items.indexOf(item)]?.focus()
  if (props.activation === 'automatic') activate(item.key)
}
function keydown(e: KeyboardEvent, index: number) {
  const forward =
      props.orientation === 'horizontal'
        ? document.dir === 'rtl'
          ? 'ArrowLeft'
          : 'ArrowRight'
        : 'ArrowDown',
    back =
      props.orientation === 'horizontal'
        ? document.dir === 'rtl'
          ? 'ArrowRight'
          : 'ArrowLeft'
        : 'ArrowUp'
  if (e.key === forward) {
    e.preventDefault()
    move(index + 1)
  } else if (e.key === back) {
    e.preventDefault()
    move(index - 1)
  } else if (e.key === 'Home') {
    e.preventDefault()
    move(0)
  } else if (e.key === 'End') {
    e.preventDefault()
    move(props.items.length - 1)
  } else if (props.activation === 'manual' && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault()
    activate(props.items[index]!.key)
  }
}
const base = props.id ?? 'aven-tabs'
</script>
<template>
  <div
    :class="[
      'aven-tabs',
      `is-${orientation}`,
      `variant-${variant}`,
      { 'is-unstyled': unstyled },
      ui?.root?.class,
    ]"
    :style="ui?.root?.style"
  >
    <div
      :id="`${base}-list`"
      role="tablist"
      :aria-orientation="orientation"
      :class="['tabs-list', ui?.list?.class]"
      :style="ui?.list?.style"
    >
      <span v-for="(item, index) in items" class="tab-group" role="presentation" :key="item.key"
        ><button
          :id="`${base}-tab-${index}`"
          :ref="(element) => setTabRef(index, element)"
          type="button"
          role="tab"
          :aria-selected="Object.is(selected, item.key)"
          :aria-controls="`${base}-panel-${index}`"
          :tabindex="Object.is(focused, item.key) ? 0 : -1"
          :disabled="item.disabled"
          :class="['tabs-tab', { 'is-selected': Object.is(selected, item.key) }, ui?.tab?.class]"
          :style="ui?.tab?.style"
          @focus="onTabFocus(item)"
          @keydown="keydown($event, index)"
        >
          <slot
            name="tab"
            :item="item"
            :key="item.key"
            :selected="Object.is(selected, item.key)"
            :active="Object.is(focused, item.key)"
            :disabled="!!item.disabled"
            ><slot name="leading" :item="item" /><span>{{ item.label }}</span
            ><slot name="badge" :item="item" /><slot name="trailing" :item="item" /></slot
          ><button
            v-if="item.closable"
            type="button"
            class="tab-close"
            :aria-label="`Close ${item.label}`"
            @click.stop="emit('close', { key: item.key, originalEvent: $event })"
          >
            <slot name="close-icon">×</slot>
          </button>
        </button></span
      >
    </div>
    <template v-for="(item, index) in items" :key="`panel-${item.key}`"
      ><section
        v-if="Object.is(selected, item.key) || !lazy || visited.has(item.key)"
        :id="`${base}-panel-${index}`"
        role="tabpanel"
        :aria-labelledby="`${base}-tab-${index}`"
        :hidden="!Object.is(selected, item.key)"
        :tabindex="0"
        :class="['tabs-panel', ui?.panel?.class]"
        :style="ui?.panel?.style"
      >
        <slot name="panel" :item="item" :key="item.key" :active="Object.is(selected, item.key)">{{
          item.label
        }}</slot>
      </section></template
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
  border-block-end: 2px solid transparent;
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
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: -2px;
}
.variant-pill .tabs-tab {
  border-radius: 999px;
  border: 0;
}
.variant-pill .tabs-tab.is-selected {
  background: var(--aven-color-surface-selected);
}
.variant-boxed .tabs-tab {
  border: 1px solid var(--aven-color-border-subtle);
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
  outline: 2px solid var(--aven-color-focus-ring);
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
