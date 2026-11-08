<script setup lang="ts" generic="Key extends string | number">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import AvenMenuGroup from './AvenMenuGroup.vue'
import AvenMenuItem from './AvenMenuItem.vue'
import { useAvenId } from './composables.js'
import type { AvenCommand, AvenMenuEvents, AvenMenuProps, AvenMenuSlots } from './types.js'
const props = withDefaults(defineProps<AvenMenuProps<Key>>(), {
  loop: false,
  orientation: 'vertical',
  typeahead: true,
  unstyled: false,
})
const emit = defineEmits<AvenMenuEvents<Key>>()
const slots = defineSlots<AvenMenuSlots<Key>>()
const active = ref(props.items.findIndex((item) => !item.disabled)),
  itemEls = ref<Array<{ focus: () => void; activate: (event: Event) => void }>>([]),
  query = ref(''),
  root = ref<HTMLElement>()
const menuId = useAvenId(props.id, 'menu')
let typeTimer: ReturnType<typeof setTimeout> | undefined
const enabled = computed(() =>
  props.items.map((item, index) => ({ item, index })).filter((x) => !x.item.disabled),
)
const sections = computed(() => {
  const sections: Array<{
    key?: string | number
    label?: string
    items: Array<{ item: AvenCommand<Key>; index: number }>
  }> = []
  props.items.forEach((item, index) => {
    const key = item.group
    let section = sections[sections.length - 1]
    if (!section || !Object.is(section.key, key)) {
      section = {
        key,
        label: props.groups?.find((group) => Object.is(group.key, key))?.label,
        items: [],
      }
      sections.push(section)
    }
    section.items.push({ item, index })
  })
  return sections
})
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
function move(delta: 1 | -1) {
  const candidates = enabled.value.map((entry) => entry.index)
  if (!candidates.length) return
  let position = candidates.indexOf(active.value)
  if (position < 0) position = delta > 0 ? -1 : candidates.length
  let next = position + delta
  if (props.loop) next = (next + candidates.length) % candidates.length
  else next = Math.max(0, Math.min(candidates.length - 1, next))
  focus(candidates[next]!)
}
function keydown(e: KeyboardEvent) {
  const rtl =
    root.value &&
    typeof getComputedStyle !== 'undefined' &&
    getComputedStyle(root.value).direction === 'rtl'
  const forward = props.orientation === 'vertical' ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight',
    back = props.orientation === 'vertical' ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft'
  if (e.key === forward) {
    e.preventDefault()
    move(1)
  } else if (e.key === back) {
    e.preventDefault()
    move(-1)
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
      itemEls.value[active.value]?.activate(e)
    }
  } else if (props.typeahead && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
    query.value += e.key.toLocaleLowerCase()
    if (typeTimer) clearTimeout(typeTimer)
    typeTimer = setTimeout(() => (query.value = ''), 500)
    const index = props.items.findIndex(
      (it, i) =>
        i > active.value && !it.disabled && it.label.toLocaleLowerCase().startsWith(query.value),
    )
    const match =
      index >= 0
        ? index
        : props.items.findIndex(
            (it) => !it.disabled && it.label.toLocaleLowerCase().startsWith(query.value),
          )
    if (match >= 0) focus(match)
  }
}
function setItemRef(index: number, element: unknown) {
  if (element && typeof element === 'object' && 'focus' in element)
    itemEls.value[index] = element as { focus: () => void; activate: (event: Event) => void }
}
function onHighlight(payload: { key: Key }) {
  const index = props.items.findIndex((item) => Object.is(item.key, payload.key))
  if (index === active.value) return
  if (index >= 0) active.value = index
  emit('highlight', payload)
}
defineExpose({
  focusFirst: () => focus(0),
  focusLast: () => focus(props.items.length - 1),
  focus: () => itemEls.value[active.value]?.focus(),
})
onBeforeUnmount(() => {
  if (typeTimer) clearTimeout(typeTimer)
})
</script>
<template>
  <div
    ref="root"
    :id="menuId"
    role="menu"
    :aria-orientation="orientation"
    :class="['aven-menu', `is-${orientation}`, { 'is-unstyled': unstyled }, ui?.root?.class]"
    :style="ui?.root?.style"
    v-bind="ui?.root?.attrs"
    @keydown="keydown"
  >
    <slot name="header" />
    <template v-if="items.length">
      <AvenMenuGroup
        v-for="(section, sectionIndex) in sections"
        :key="`${String(section.key ?? 'ungrouped')}-${sectionIndex}`"
        :id="`${menuId}-group-${sectionIndex}`"
        :label="section.label"
        :decorative="section.key === undefined"
        :unstyled="unstyled"
        :ui="{ root: ui?.group, label: ui?.groupLabel }"
      >
        <AvenMenuItem
          v-for="entry in section.items"
          :key="entry.item.key"
          :ref="(element) => setItemRef(entry.index, element)"
          :id="`${menuId}-item-${entry.index}`"
          :item="entry.item"
          :active="active === entry.index"
          :unstyled="unstyled"
          :ui="{
            item: ui?.item,
            leading: ui?.leading,
            trailing: ui?.trailing,
            shortcut: ui?.shortcut,
          }"
          @mouseenter="!entry.item.disabled && (active = entry.index)"
          @select="emit('select', $event)"
          @update:checked="emit('update:checked', $event)"
          @update:value="emit('update:value', $event)"
          @highlight="onHighlight($event)"
          @submenu-change="emit('submenuChange', $event)"
        >
          <template v-if="slots.item" #default="scope"
            ><slot
              name="item"
              :item="scope.item"
              :key="scope.item.key"
              :active="scope.active"
              :disabled="scope.disabled"
              :checked="scope.checked"
          /></template>
          <template v-if="slots.leading" #leading="scope"
            ><slot name="leading" v-bind="scope"
          /></template>
          <template v-if="slots.trailing" #trailing="scope"
            ><slot name="trailing" v-bind="scope"
          /></template>
          <template v-if="slots.shortcut" #shortcut="scope"
            ><slot name="shortcut" v-bind="scope"
          /></template>
          <template v-if="slots['submenu-trigger']" #submenu-trigger="scope"
            ><slot name="submenu-trigger" v-bind="scope"
          /></template>
          <template v-if="slots.submenu" #submenu="scope"
            ><slot name="submenu" v-bind="scope"
          /></template>
        </AvenMenuItem>
        <template v-if="slots['group-label'] && section.key !== undefined" #label
          ><slot
            name="group-label"
            :group="{ key: section.key, label: section.label ?? String(section.key) }"
        /></template>
      </AvenMenuGroup>
    </template>
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
  border-radius: var(--aven-radius-sm);
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
</style>
