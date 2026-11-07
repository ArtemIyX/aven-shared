<script setup lang="ts" generic="Key extends string | number">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue'
import AvenMenu from './AvenMenu.vue'
import type { AvenContextMenuEvents, AvenContextMenuProps, AvenContextMenuSlots } from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenContextMenuProps<Key>>(), {
  defaultOpen: false,
  open: undefined,
  disabled: false,
  activation: 'contextmenu',
  label: 'Context actions',
  triggerLabel: 'More actions',
  unstyled: false,
})
const emit = defineEmits<AvenContextMenuEvents<Key>>()
defineSlots<AvenContextMenuSlots<Key>>()
const attrs = useAttrs()
const localOpen = ref(props.defaultOpen)
const isOpen = computed(() => props.open ?? localOpen.value)
const root = ref<HTMLElement>()
const menu = ref<{ focusFirst: () => void } | null>(null)
const position = ref({ x: 0, y: 0 })
let returnFocus: HTMLElement | null = null
function isHTMLElement(value: EventTarget | null): value is HTMLElement {
  return typeof HTMLElement !== 'undefined' && value instanceof HTMLElement
}
watch(
  () => props.open,
  (value) => {
    if (value !== undefined) localOpen.value = value
  },
)
watch(isOpen, async (open) => {
  if (typeof document === 'undefined') return
  if (open) {
    document.addEventListener('pointerdown', onOutside, true)
    document.addEventListener('keydown', onDocumentKeydown)
    await nextTick()
    menu.value?.focusFirst()
  } else {
    document.removeEventListener('pointerdown', onOutside, true)
    document.removeEventListener('keydown', onDocumentKeydown)
  }
})
onMounted(() => {
  if (isOpen.value && typeof document !== 'undefined') {
    document.addEventListener('pointerdown', onOutside, true)
    document.addEventListener('keydown', onDocumentKeydown)
    void nextTick(() => menu.value?.focusFirst())
  }
})
onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('pointerdown', onOutside, true)
    document.removeEventListener('keydown', onDocumentKeydown)
  }
})
function setOpen(
  next: boolean,
  reason:
    'contextmenu' | 'keyboard' | 'trigger' | 'selection' | 'escape' | 'outside' | 'programmatic',
  point?: { x: number; y: number },
) {
  if (props.disabled || isOpen.value === next) return
  if (props.open === undefined) localOpen.value = next
  emit('update:open', next)
  emit('openChange', { open: next, reason, point })
}
function openAt(
  x: number,
  y: number,
  reason: 'contextmenu' | 'keyboard' | 'trigger' = 'trigger',
  event?: Event,
) {
  if (props.disabled) return
  event?.preventDefault()
  const currentTarget = event?.currentTarget ?? null
  returnFocus = isHTMLElement(currentTarget) ? currentTarget : (root.value ?? null)
  if (typeof window !== 'undefined') {
    x = Math.max(8, Math.min(x, window.innerWidth - 220))
    y = Math.max(8, Math.min(y, window.innerHeight - 260))
  }
  position.value = { x, y }
  setOpen(true, reason, position.value)
}
function onContextMenu(event: MouseEvent) {
  openAt(event.clientX, event.clientY, 'contextmenu', event)
}
function onRootClick(event: MouseEvent) {
  if (props.activation === 'both' && !isOpen.value)
    openAt(event.clientX, event.clientY, 'trigger', event)
}
function onKeydown(event: KeyboardEvent) {
  if (
    props.disabled ||
    !['F10', 'ContextMenu'].includes(event.key) ||
    (event.key === 'F10' && !event.shiftKey)
  )
    return
  openAt(
    root.value?.getBoundingClientRect().left ?? 0,
    root.value?.getBoundingClientRect().bottom ?? 0,
    'keyboard',
    event,
  )
}
function onDocumentKeydown(event: KeyboardEvent) {
  if (!isOpen.value || event.key !== 'Escape') return
  event.stopPropagation()
  setOpen(false, 'escape')
  returnFocus?.focus()
}
function onOutside(event: PointerEvent) {
  if (isOpen.value && !root.value?.contains(event.target as Node)) setOpen(false, 'outside')
}
function onSelect(payload: { key: Key; item: (typeof props.items)[number]; originalEvent: Event }) {
  emit('select', payload)
  setOpen(false, 'selection')
  void nextTick(() => returnFocus?.focus())
}
const triggerAttrs = computed(() => ({
  type: 'button' as const,
  'aria-label': props.triggerLabel,
  'aria-haspopup': 'menu' as const,
  'aria-expanded': isOpen.value,
  disabled: props.disabled,
  onClick: (event: MouseEvent) =>
    openAt(
      isHTMLElement(event.currentTarget) ? event.currentTarget.getBoundingClientRect().left : 0,
      isHTMLElement(event.currentTarget) ? event.currentTarget.getBoundingClientRect().bottom : 0,
      'trigger',
      event,
    ),
}))
defineExpose({
  openAt,
  close: () => setOpen(false, 'programmatic'),
  focus: () => root.value?.focus(),
})
</script>

<template>
  <div
    ref="root"
    v-bind="{ ...attrs, ...ui?.root?.attrs }"
    :class="[
      'aven-context-menu',
      { 'is-open': isOpen, 'is-unstyled': unstyled },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[attrs.style, ui?.root?.style]"
    tabindex="0"
    @contextmenu="onContextMenu"
    @keydown="onKeydown"
    @click="onRootClick"
  >
    <slot :open-at="openAt" :open="isOpen" />
    <slot name="trigger" :trigger-attrs="triggerAttrs" :open="isOpen">
      <button
        v-bind="{ ...ui?.trigger?.attrs, ...triggerAttrs }"
        :class="['context-trigger', ui?.trigger?.class]"
        :style="ui?.trigger?.style"
      >
        {{ triggerLabel }}
      </button>
    </slot>
    <div
      v-if="isOpen"
      :class="['context-content', ui?.content?.class]"
      :style="[{ left: `${position.x}px`, top: `${position.y}px` }, ui?.content?.style]"
      v-bind="ui?.content?.attrs"
    >
      <AvenMenu
        ref="menu"
        :items="items"
        :aria-label="label"
        :unstyled="unstyled"
        :ui="{ item: ui?.item }"
        @select="onSelect"
      >
        <template #item="scope"
          ><slot name="item" v-bind="scope">{{ scope.item.label }}</slot></template
        >
        <template #header><slot name="header" /></template>
        <template #footer><slot name="footer" /></template>
      </AvenMenu>
    </div>
  </div>
</template>

<style scoped>
.aven-context-menu {
  position: relative;
  min-inline-size: 0;
  outline: none;
}
.aven-context-menu:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 2px;
}
.context-trigger {
  min-block-size: 2.25rem;
  padding-inline: var(--aven-space-3);
  border: 1px solid var(--aven-color-border-interactive);
  border-radius: var(--aven-radius-md);
  background: var(--aven-color-surface-base);
  color: var(--aven-color-text-primary);
  font: inherit;
  cursor: pointer;
}
.context-trigger:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 2px;
}
.context-content {
  position: fixed;
  z-index: 1000;
  max-inline-size: calc(100vw - 1rem);
  max-block-size: calc(100vh - 1rem);
  overflow: auto;
}
.is-unstyled .context-trigger {
  border: 0;
  border-radius: 0;
  background: transparent;
}
</style>
