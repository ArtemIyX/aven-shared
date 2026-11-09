<script setup lang="ts" generic="Key extends string | number">
import { computed, nextTick, onBeforeUnmount, ref, useAttrs, watch } from 'vue'
import { useAvenId } from './composables.js'
import AvenMenu from './AvenMenu.vue'
import type { AvenCommand, AvenMenubarEvents, AvenMenubarProps, AvenMenubarSlots } from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenMenubarProps<Key>>(), {
  loop: true,
  density: 'comfortable',
  disabled: false,
  unstyled: false,
})
const emit = defineEmits<AvenMenubarEvents<Key>>()
defineSlots<AvenMenubarSlots<Key>>()
const attrs = useAttrs()
const generatedId = useAvenId(undefined, 'menubar')
const root = ref<HTMLElement>()
const triggers = ref<Array<HTMLButtonElement | undefined>>([])
const submenu = ref<{ focusFirst: () => void } | null>(null)
const localActiveKey = ref<Key | null>(props.defaultActiveKey ?? firstEnabled()?.key ?? null)
const localOpenKey = ref<Key | null>(props.defaultOpenKey ?? null)
const activeKey = computed(() =>
  props.activeKey !== undefined ? props.activeKey : localActiveKey.value,
)
const openKey = computed(() => (props.openKey !== undefined ? props.openKey : localOpenKey.value))
watch(
  () => props.activeKey,
  (next) => {
    if (next !== undefined) localActiveKey.value = next
  },
)
watch(
  () => props.openKey,
  (next) => {
    if (next !== undefined) localOpenKey.value = next
  },
)
watch(openKey, (key) => {
  if (typeof document === 'undefined') return
  if (key !== null) document.addEventListener('pointerdown', onOutside, true)
  else document.removeEventListener('pointerdown', onOutside, true)
})
onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.removeEventListener('pointerdown', onOutside, true)
})
watch(openKey, async (key) => {
  if (key !== null) {
    await nextTick()
    submenu.value?.focusFirst()
  }
})
function firstEnabled() {
  return props.items.find((item) => !item.disabled)
}
function enabledItems() {
  return props.items.filter((item) => !item.disabled)
}
function itemId(key: Key) {
  const index = props.items.findIndex((item) => Object.is(item.key, key))
  return `${generatedId}-submenu-${index}`
}
function setSubmenuRef(key: Key, instance: unknown) {
  if (!Object.is(openKey.value, key)) return
  submenu.value =
    instance &&
    typeof instance === 'object' &&
    'focusFirst' in instance &&
    typeof instance.focusFirst === 'function'
      ? (instance as { focusFirst: () => void })
      : null
}
function setTriggerRef(index: number, element: unknown) {
  triggers.value[index] =
    element &&
    typeof element === 'object' &&
    'focus' in element &&
    typeof element.focus === 'function'
      ? (element as HTMLButtonElement)
      : undefined
}
function setActive(key: Key | null, focus = true) {
  if (Object.is(activeKey.value, key)) {
    if (focus && key !== null)
      void nextTick(() =>
        triggers.value[props.items.findIndex((item) => Object.is(item.key, key))]?.focus(),
      )
    return
  }
  if (props.activeKey === undefined) localActiveKey.value = key
  emit('update:activeKey', key)
  if (focus && key !== null)
    void nextTick(() =>
      triggers.value[props.items.findIndex((item) => Object.is(item.key, key))]?.focus(),
    )
}
function setOpen(key: Key | null) {
  const previous = openKey.value
  const next = Object.is(openKey.value, key) ? null : key
  if (Object.is(next, openKey.value)) return
  if (props.openKey === undefined) localOpenKey.value = next
  emit('update:openKey', next)
  if (previous !== null) emit('submenuChange', { key: previous, open: false })
  if (next !== null) emit('submenuChange', { key: next, open: true })
}
function onOutside(event: PointerEvent) {
  if (openKey.value !== null && !root.value?.contains(event.target as Node)) closeSubmenu()
}
function onRootKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return
  event.stopPropagation()
  closeSubmenu()
  const index = props.items.findIndex((item) => Object.is(item.key, activeKey.value))
  triggers.value[index]?.focus()
}
function directionDelta(event: KeyboardEvent) {
  const direction =
    root.value && typeof getComputedStyle !== 'undefined'
      ? getComputedStyle(root.value).direction
      : 'ltr'
  return (event.key === 'ArrowRight') !== (direction === 'rtl') ? 1 : -1
}
function onKeydown(event: KeyboardEvent, item: AvenCommand<Key>, index: number) {
  if (props.disabled || item.disabled) return
  const enabled = enabledItems()
  const active = enabled.findIndex((entry) => Object.is(entry.key, item.key))
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault()
    const delta = directionDelta(event)
    let next = active + delta
    if (props.loop) next = (next + enabled.length) % enabled.length
    else next = Math.max(0, Math.min(enabled.length - 1, next))
    const target = enabled[next]
    if (target) setActive(target.key)
    else if (openKey.value !== null) setOpen(null)
    return
  }
  if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault()
    const target = event.key === 'Home' ? enabled[0] : enabled.at(-1)
    if (target) setActive(target.key)
    return
  }
  if (event.key === 'ArrowDown' && item.children?.length) {
    event.preventDefault()
    if (!Object.is(openKey.value, item.key)) setOpen(item.key)
    return
  }
  if (event.key === 'Escape' && openKey.value !== null) {
    event.preventDefault()
    setOpen(null)
    triggers.value[index]?.focus()
  }
}
function activate(item: AvenCommand<Key>, event: MouseEvent) {
  if (props.disabled || item.disabled) return
  setActive(item.key, false)
  if (item.children?.length) setOpen(item.key)
  else emit('select', { key: item.key, item, originalEvent: event })
}
function selectSubmenu(payload: { key: Key; item: AvenCommand<Key>; originalEvent: Event }) {
  emit('select', payload)
  setOpen(null)
}
function closeSubmenu() {
  if (openKey.value !== null) setOpen(null)
}
defineExpose({
  focusFirst: () => {
    const item = firstEnabled()
    if (item) setActive(item.key)
  },
  focusLast: () => {
    const item = enabledItems().at(-1)
    if (item) setActive(item.key)
  },
  close: closeSubmenu,
})
</script>

<template>
  <nav
    v-bind="attrs"
    :class="['aven-menubar-nav', { 'is-disabled': disabled }, attrs.class]"
    :style="attrs.style"
  >
    <div
      ref="root"
      role="menubar"
      :aria-label="label"
      :aria-orientation="'horizontal'"
      :aria-disabled="disabled || undefined"
      v-bind="ui?.root?.attrs"
      :class="['aven-menubar', `density-${density}`, { 'is-unstyled': unstyled }, ui?.root?.class]"
      :style="ui?.root?.style"
      @keydown="onRootKeydown"
    >
      <div
        v-for="(item, index) in items"
        :key="`${typeof item.key}:${String(item.key)}`"
        class="menubar-item-wrap"
      >
        <slot
          name="trigger"
          :item="item"
          :open="Object.is(openKey, item.key)"
          :active="Object.is(activeKey, item.key)"
          :trigger-attrs="{
            role: 'menuitem',
            'aria-haspopup': item.children?.length ? 'menu' : undefined,
            'aria-expanded': item.children?.length ? Object.is(openKey, item.key) : undefined,
            disabled: disabled || item.disabled,
            tabindex: Object.is(activeKey, item.key) ? 0 : -1,
            onFocus: () => setActive(item.key, false),
            onClick: (event: MouseEvent) => activate(item, event),
            onKeydown: (event: KeyboardEvent) => onKeydown(event, item, index),
          }"
          :trigger-ref="(element) => setTriggerRef(index, element)"
        >
          <button
            :ref="(element) => setTriggerRef(index, element)"
            v-bind="ui?.trigger?.attrs"
            type="button"
            role="menuitem"
            :aria-haspopup="item.children?.length ? 'menu' : undefined"
            :aria-controls="item.children?.length ? itemId(item.key) : undefined"
            :aria-expanded="item.children?.length ? Object.is(openKey, item.key) : undefined"
            :disabled="disabled || item.disabled"
            :tabindex="Object.is(activeKey, item.key) ? 0 : -1"
            :class="[
              'menubar-trigger',
              {
                'is-active': Object.is(activeKey, item.key),
                'is-open': Object.is(openKey, item.key),
              },
              ui?.trigger?.class,
            ]"
            :style="ui?.trigger?.style"
            @focus="setActive(item.key, false)"
            @click="activate(item, $event)"
            @keydown="onKeydown($event, item, index)"
          >
            <slot
              name="item"
              :item="item"
              :key="item.key"
              :active="Object.is(activeKey, item.key)"
              :disabled="disabled || !!item.disabled"
              >{{ item.label }}</slot
            >
            <slot name="submenu-trigger" :item="item" :open="Object.is(openKey, item.key)"
              ><span v-if="item.children?.length" aria-hidden="true" class="menubar-caret"
                >▾</span
              ></slot
            >
          </button>
        </slot>
        <div
          v-if="item.children?.length && Object.is(openKey, item.key)"
          :id="itemId(item.key)"
          role="presentation"
          :class="['menubar-submenu', ui?.submenu?.class]"
          :style="ui?.submenu?.style"
          v-bind="ui?.submenu?.attrs"
        >
          <AvenMenu
            :ref="(instance) => setSubmenuRef(item.key, instance)"
            :items="item.children"
            loop
            :unstyled="unstyled"
            :ui="{ item: ui?.item }"
            @select="selectSubmenu"
            @submenu-change="emit('submenuChange', $event)"
          >
            <template #item="scope"
              ><slot name="item" v-bind="scope">{{ scope.item.label }}</slot></template
            >
            <template #header><slot name="header" /></template>
            <template #footer><slot name="footer" /></template>
          </AvenMenu>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.aven-menubar-nav {
  max-inline-size: 100%;
  overflow: visible;
  color: var(--aven-color-text-primary);
}
.aven-menubar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--aven-space-1);
  min-block-size: 2.75rem;
  padding: var(--aven-space-1);
  border-block-end: 0.0625rem solid var(--aven-color-border-subtle);
  background: var(--aven-color-surface-base);
}
.menubar-item-wrap {
  position: relative;
}
.menubar-trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--aven-space-2);
  min-block-size: 2.5rem;
  padding-inline: var(--aven-space-3);
  border: 0;
  border-radius: var(--aven-radius-sm);
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.density-compact .menubar-trigger {
  min-block-size: 2rem;
  padding-inline: var(--aven-space-2);
}
.menubar-trigger:hover,
.menubar-trigger.is-active,
.menubar-trigger.is-open {
  background: var(--aven-color-surface-hover);
}
.menubar-trigger:focus-visible {
  outline: 0.125rem solid var(--aven-color-focus-ring);
  outline-offset: -0.125rem;
}
.menubar-trigger:disabled {
  color: var(--aven-color-text-disabled);
  cursor: not-allowed;
}
.menubar-caret {
  font-size: 0.75em;
}
.menubar-submenu {
  position: absolute;
  z-index: 950;
  inset-block-start: calc(100% + var(--aven-space-1));
  inset-inline-start: 0;
  min-inline-size: 12rem;
  max-inline-size: min(24rem, calc(100vw - 1rem));
}
.is-disabled {
  color: var(--aven-color-text-disabled);
}
.is-unstyled {
  border: 0;
  background: transparent;
}
@media (forced-colors: active) {
  .menubar-trigger.is-open {
    outline: 0.0625rem solid Highlight;
  }
}
</style>
