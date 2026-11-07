<script setup lang="ts" generic="Key extends string | number">
import { computed, nextTick, ref } from 'vue'
import type { AvenCommand, AvenUi } from './types.js'
const props = withDefaults(
  defineProps<{
    items: AvenCommand<Key>[]
    id?: string
    loop?: boolean
    orientation?: 'vertical' | 'horizontal'
    typeahead?: boolean
    unstyled?: boolean
    ui?: AvenUi<'root' | 'item' | 'leading' | 'trailing' | 'shortcut'>
  }>(),
  { loop: false, orientation: 'vertical', typeahead: true, unstyled: false },
)
const emit = defineEmits<{
  select: [payload: { key: Key; item: AvenCommand<Key>; originalEvent: Event }]
  highlight: [payload: { key: Key }]
}>()
const active = ref(-1),
  itemEls = ref<HTMLElement[]>([]),
  query = ref('')
let typeTimer: ReturnType<typeof setTimeout> | undefined
const enabled = computed(() =>
  props.items.map((item, index) => ({ item, index })).filter((x) => !x.item.disabled),
)
function focus(index: number) {
  if (!enabled.value.length) return
  let target = index
  if (props.loop) target = (target + props.items.length) % props.items.length
  else target = Math.max(0, Math.min(props.items.length - 1, target))
  if (props.items[target]?.disabled) {
    const candidates = enabled.value.map((x) => x.index)
    target = candidates.reduce(
      (best, i) => (Math.abs(i - target) < Math.abs(best - target) ? i : best),
      candidates[0]!,
    )
  }
  active.value = target
  void nextTick(() => itemEls.value[target]?.focus())
  const item = props.items[target]
  if (item) emit('highlight', { key: item.key })
}
function keydown(e: KeyboardEvent) {
  const forward = props.orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight',
    back = props.orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'
  if (e.key === forward) {
    e.preventDefault()
    focus(active.value + 1)
  } else if (e.key === back) {
    e.preventDefault()
    focus(active.value - 1)
  } else if (e.key === 'Home') {
    e.preventDefault()
    focus(0)
  } else if (e.key === 'End') {
    e.preventDefault()
    focus(props.items.length - 1)
  } else if (e.key === 'Enter' || e.key === ' ') {
    const item = props.items[active.value]
    if (item && !item.disabled) {
      e.preventDefault()
      emit('select', { key: item.key, item, originalEvent: e })
    }
  } else if (props.typeahead && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
    query.value += e.key.toLocaleLowerCase()
    if (typeTimer) clearTimeout(typeTimer)
    typeTimer = setTimeout(() => (query.value = ''), 500)
    const index = props.items.findIndex(
      (it, i) =>
        i > active.value && !it.disabled && it.label.toLocaleLowerCase().startsWith(query.value),
    )
    focus(
      index >= 0
        ? index
        : props.items.findIndex(
            (it) => !it.disabled && it.label.toLocaleLowerCase().startsWith(query.value),
          ),
    )
  }
}
function choose(item: AvenCommand<Key>, event: Event) {
  if (!item.disabled) emit('select', { key: item.key, item, originalEvent: event })
}
function setItemRef(index: number, element: unknown) {
  if (element && typeof element === 'object' && 'focus' in element)
    itemEls.value[index] = element as HTMLElement
}
function onItemFocus(item: AvenCommand<Key>) {
  active.value = props.items.findIndex((entry) => Object.is(entry.key, item.key))
  emit('highlight', { key: item.key })
}
defineExpose({
  focusFirst: () => focus(0),
  focusLast: () => focus(props.items.length - 1),
  focus: () => itemEls.value[active.value]?.focus(),
})
</script>
<template>
  <div
    :id="id"
    role="menu"
    :aria-orientation="orientation"
    :class="['aven-menu', `is-${orientation}`, { 'is-unstyled': unstyled }, ui?.root?.class]"
    :style="ui?.root?.style"
    @keydown="keydown"
  >
    <slot name="header" /><template v-if="items.length"
      ><button
        v-for="(item, index) in items"
        :id="`${id ?? 'aven-menu'}-item-${index}`"
        :key="item.key"
        :ref="(element) => setItemRef(index, element)"
        type="button"
        role="menuitem"
        :tabindex="active === index ? 0 : -1"
        :disabled="item.disabled"
        :class="[
          'menu-item',
          { 'is-active': active === index, 'is-disabled': item.disabled },
          ui?.item?.class,
        ]"
        :style="ui?.item?.style"
        @focus="onItemFocus(item)"
        @mouseenter="!item.disabled && (active = index)"
        @click="choose(item, $event)"
      >
        <span v-if="$slots.leading" :class="ui?.leading?.class"
          ><slot name="leading" :item="item" /></span
        ><span class="item-label"
          ><slot
            name="item"
            :item="item"
            :key="item.key"
            :active="active === index"
            :disabled="!!item.disabled"
            :checked="false"
            >{{ item.label }}</slot
          ><small v-if="item.description">{{ item.description }}</small></span
        ><span v-if="item.shortcut" :class="['item-shortcut', ui?.shortcut?.class]"
          ><slot name="shortcut" :item="item">{{ item.shortcut }}</slot></span
        ><span v-if="$slots.trailing" :class="ui?.trailing?.class"
          ><slot name="trailing" :item="item"
        /></span></button
    ></template>
    <div v-else role="presentation" class="menu-empty"><slot name="empty">No actions</slot></div>
    <slot name="footer" />
  </div>
</template>
<style scoped>
.aven-menu {
  display: flex;
  flex-direction: column;
  min-inline-size: 12rem;
  max-inline-size: min(24rem, calc(100vw - 1rem));
  padding: var(--aven-space-1);
  border: 1px solid var(--aven-color-border-subtle);
  border-radius: var(--aven-radius-md);
  background: var(--aven-color-surface-dropdown);
  color: var(--aven-color-text-primary);
  box-shadow: 0 8px 20px var(--aven-color-shadow-ambient);
}
.menu-item {
  display: flex;
  align-items: center;
  gap: var(--aven-space-3);
  min-block-size: 2.25rem;
  padding: var(--aven-space-2) var(--aven-space-3);
  border: 0;
  border-radius: var(--aven-radius-sm);
  background: transparent;
  color: inherit;
  text-align: start;
  font: inherit;
  cursor: pointer;
}
.menu-item:hover,
.menu-item.is-active {
  background: var(--aven-color-surface-hover);
}
.menu-item:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: -2px;
}
.menu-item:disabled,
.is-disabled {
  color: var(--aven-color-text-disabled);
  cursor: not-allowed;
}
.item-label {
  flex: 1;
  min-inline-size: 0;
}
.item-label small {
  display: block;
  color: var(--aven-color-text-secondary);
  font-size: var(--aven-font-size-xs);
}
.item-shortcut {
  color: var(--aven-color-text-secondary);
  font-size: var(--aven-font-size-xs);
}
.menu-empty {
  padding: var(--aven-space-3);
  color: var(--aven-color-text-secondary);
}
.is-horizontal {
  flex-direction: row;
  flex-wrap: wrap;
}
.is-unstyled {
  border: 0;
  border-radius: 0;
  padding: 0;
  background: transparent;
  box-shadow: none;
}
.is-unstyled .menu-item {
  border-radius: 0;
}
</style>
