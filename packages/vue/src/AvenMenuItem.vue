<script setup lang="ts" generic="Key extends string | number">
import { computed, nextTick, ref, useAttrs } from 'vue'
import AvenMenu from './AvenMenu.vue'
import type {
  AvenMenuEvents,
  AvenMenuItemEvents,
  AvenMenuItemProps,
  AvenMenuItemSlots,
} from './types.js'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenMenuItemProps<Key>>(), {
  active: false,
  unstyled: false,
})
const emit = defineEmits<AvenMenuItemEvents<Key>>(),
  attrs = useAttrs()
defineSlots<AvenMenuItemSlots<Key>>()
const button = ref<HTMLButtonElement>(),
  wrapper = ref<HTMLElement>(),
  nested = ref<{ focusFirst: () => void } | null>(null),
  submenuOpen = ref(false)
const rtl = computed(
  () =>
    !!wrapper.value &&
    typeof globalThis.getComputedStyle !== 'undefined' &&
    globalThis.getComputedStyle(wrapper.value).direction === 'rtl',
)
const checked = () => !!props.item.checked
function focus() {
  button.value?.focus()
}
function setSubmenu(next: boolean) {
  if (props.item.kind !== 'submenu' || !props.item.children?.length || submenuOpen.value === next)
    return
  submenuOpen.value = next
  emit('submenuChange', { key: props.item.key, open: next })
  if (next) void nextTick(() => nested.value?.focusFirst())
}
function activate(event: Event) {
  if (props.item.disabled) return
  if (props.item.kind === 'submenu') {
    setSubmenu(!submenuOpen.value)
    return
  }
  if (props.item.kind === 'checkbox')
    emit('update:checked', { key: props.item.key, checked: !checked() })
  if (props.item.kind === 'radio' && props.item.value !== undefined)
    emit('update:value', { group: props.item.group ?? 'default', value: props.item.value })
  emit('select', { key: props.item.key, item: props.item, originalEvent: event })
}
function keydown(event: KeyboardEvent) {
  if (props.item.kind !== 'submenu') return
  const rtl =
    wrapper.value &&
    typeof globalThis.getComputedStyle !== 'undefined' &&
    globalThis.getComputedStyle(wrapper.value).direction === 'rtl'
  const openKey = rtl ? 'ArrowLeft' : 'ArrowRight',
    closeKey = rtl ? 'ArrowRight' : 'ArrowLeft'
  if (event.key === openKey) {
    event.preventDefault()
    event.stopPropagation()
    setSubmenu(true)
  } else if (event.key === closeKey && submenuOpen.value) {
    event.preventDefault()
    event.stopPropagation()
    setSubmenu(false)
    focus()
  }
}
function closeFromEscape() {
  setSubmenu(false)
  focus()
}
function relaySelect(payload: AvenMenuEvents<Key>['select'][0]) {
  emit('select', payload)
  setSubmenu(false)
}
function relayChecked(payload: AvenMenuEvents<Key>['update:checked'][0]) {
  emit('update:checked', payload)
}
function relayValue(payload: AvenMenuEvents<Key>['update:value'][0]) {
  emit('update:value', payload)
}
function relayHighlight(payload: AvenMenuEvents<Key>['highlight'][0]) {
  emit('highlight', payload)
}
function relaySubmenu(payload: AvenMenuEvents<Key>['submenuChange'][0]) {
  emit('submenuChange', payload)
}
defineExpose({
  focus,
  activate,
  openSubmenu: () => setSubmenu(true),
  closeSubmenu: () => setSubmenu(false),
})
</script>
<template>
  <div
    ref="wrapper"
    role="presentation"
    :class="['aven-menu-item-wrap', { 'is-submenu-open': submenuOpen }, ui?.root?.class]"
    :style="ui?.root?.style"
    @keydown.esc.stop.prevent="closeFromEscape"
  >
    <button
      ref="button"
      v-bind="{ ...attrs, ...ui?.item?.attrs }"
      :id="id"
      type="button"
      :role="
        item.kind === 'checkbox'
          ? 'menuitemcheckbox'
          : item.kind === 'radio'
            ? 'menuitemradio'
            : 'menuitem'
      "
      :aria-checked="item.kind === 'checkbox' || item.kind === 'radio' ? checked() : undefined"
      :aria-haspopup="item.kind === 'submenu' ? 'menu' : undefined"
      :aria-expanded="item.kind === 'submenu' ? submenuOpen : undefined"
      :tabindex="active ? 0 : -1"
      :disabled="item.disabled"
      :class="[
        'menu-item',
        { 'is-active': active, 'is-disabled': item.disabled, 'is-checked': checked() },
        { 'is-unstyled': unstyled },
        item.tone ? `tone-${item.tone}` : undefined,
        ui?.item?.class,
      ]"
      :style="ui?.item?.style"
      @keydown="keydown"
      @click="activate($event)"
      @focus="emit('highlight', { key: item.key })"
    >
      <span v-if="$slots.leading" :class="ui?.leading?.class"
        ><slot name="leading" :item="item"
      /></span>
      <span class="item-label"
        ><slot :item="item" :active="active" :disabled="!!item.disabled" :checked="checked()">{{
          item.label
        }}</slot
        ><small v-if="item.description">{{ item.description }}</small></span
      >
      <span v-if="item.shortcut" :class="ui?.shortcut?.class"
        ><slot name="shortcut" :item="item">{{ item.shortcut }}</slot></span
      >
      <span v-if="item.kind === 'submenu'" class="submenu-indicator" aria-hidden="true"
        ><slot name="submenu-trigger" :item="item" :open="submenuOpen">{{
          rtl ? '‹' : '›'
        }}</slot></span
      >
      <span v-if="$slots.trailing" :class="ui?.trailing?.class"
        ><slot name="trailing" :item="item"
      /></span>
    </button>
    <div
      v-if="item.kind === 'submenu' && submenuOpen && item.children?.length"
      class="submenu-surface"
      :class="ui?.submenu?.class"
      :style="ui?.submenu?.style"
    >
      <slot name="submenu" :item="item" :close="() => setSubmenu(false)"
        ><AvenMenu
          ref="nested"
          :items="item.children"
          :loop="false"
          @select="relaySelect"
          @update:checked="relayChecked"
          @update:value="relayValue"
          @highlight="relayHighlight"
          @submenu-change="relaySubmenu"
      /></slot>
    </div>
  </div>
</template>
<style scoped>
.aven-menu-item-wrap {
  position: relative;
  min-inline-size: 0;
}
.menu-item {
  display: flex;
  align-items: center;
  gap: var(--aven-space-3);
  inline-size: 100%;
  min-block-size: 2.5rem;
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
.menu-item:disabled {
  color: var(--aven-color-text-disabled);
  cursor: not-allowed;
}
.menu-item.is-checked::before {
  content: '✓';
  inline-size: 1em;
}
.menu-item.tone-danger,
.menu-item.tone-critical {
  color: var(--aven-color-danger-text);
}
.menu-item.is-unstyled {
  appearance: none;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
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
.submenu-indicator {
  margin-inline-start: auto;
}
.submenu-surface {
  position: absolute;
  z-index: 2;
  inset-block-start: 0;
  inset-inline-start: 100%;
  max-inline-size: min(24rem, calc(100vw - 1rem));
  background: var(--aven-color-surface-dropdown);
}
@media (forced-colors: active) {
  .menu-item.is-checked {
    outline: 1px solid Highlight;
  }
}
@media print {
  .submenu-surface {
    position: static;
  }
}
</style>
