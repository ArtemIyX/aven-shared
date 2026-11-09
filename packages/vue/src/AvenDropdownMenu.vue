<script setup lang="ts" generic="Key extends string | number">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AvenMenu from './AvenMenu.vue'
import { isTopAvenOverlayLayer, registerAvenOverlayLayer, useAvenId } from './composables.js'
import type {
  AvenCommand,
  AvenDropdownMenuEvents,
  AvenDropdownMenuProps,
  AvenDropdownMenuSlots,
} from './types.js'
import { cssPixelsToRem } from './cssLength.js'
const props = withDefaults(defineProps<AvenDropdownMenuProps<Key>>(), {
  open: undefined,
  placement: 'bottom-start',
  offset: 4,
  collisionPadding: 8,
  teleportTo: null,
  strategy: 'fixed',
  closeOnSelect: true,
  disabled: false,
  matchTriggerWidth: false,
  label: 'Actions',
  unstyled: false,
})
const emit = defineEmits<AvenDropdownMenuEvents<Key>>()
defineSlots<AvenDropdownMenuSlots<Key>>()
const overlayLayer = {}
let unregisterOverlay: (() => void) | undefined
let resizeObserver: ResizeObserver | undefined
let disposed = false
const local = ref(props.defaultOpen ?? false),
  isOpen = computed(() => (props.open === undefined ? local.value : props.open)),
  root = ref<HTMLElement>(),
  trigger = ref<HTMLElement>(),
  contentRoot = ref<HTMLElement>(),
  floatingStyle = ref<Record<string, string>>({}),
  menuId = useAvenId(undefined, 'dropdown-menu'),
  menu = ref<{ focusFirst: () => void } | null>()
function positionContent() {
  const anchor = trigger.value
  const content = contentRoot.value
  if (!props.teleportTo || !anchor || !content || typeof window === 'undefined') return
  const anchorRect = anchor.getBoundingClientRect()
  const contentRect = content.getBoundingClientRect()
  const width = props.matchTriggerWidth
    ? Math.max(anchorRect.width, contentRect.width)
    : contentRect.width
  const padding = Math.max(0, props.collisionPadding)
  const direction =
    typeof getComputedStyle === 'undefined' ? 'ltr' : getComputedStyle(anchor).direction
  const alignRight = props.placement.endsWith('end') !== (direction === 'rtl')
  let side: 'top' | 'bottom' = props.placement.startsWith('top') ? 'top' : 'bottom'
  const fitsAbove = anchorRect.top - contentRect.height - props.offset >= padding
  const fitsBelow =
    window.innerHeight - anchorRect.bottom - contentRect.height - props.offset >= padding
  if (side === 'bottom' && !fitsBelow && fitsAbove) side = 'top'
  else if (side === 'top' && !fitsAbove && fitsBelow) side = 'bottom'
  const maxLeft = Math.max(padding, window.innerWidth - width - padding)
  const requestedLeft = alignRight ? anchorRect.right - width : anchorRect.left
  const left = Math.min(maxLeft, Math.max(padding, requestedLeft))
  const maxTop = Math.max(padding, window.innerHeight - contentRect.height - padding)
  const requestedTop =
    side === 'top'
      ? anchorRect.top - contentRect.height - props.offset
      : anchorRect.bottom + props.offset
  const top = Math.min(maxTop, Math.max(padding, requestedTop))
  const scrollX = props.strategy === 'absolute' ? window.scrollX : 0
  const scrollY = props.strategy === 'absolute' ? window.scrollY : 0
  floatingStyle.value = {
    position: props.strategy,
    insetBlockStart: cssPixelsToRem(top + scrollY),
    insetBlockEnd: 'auto',
    insetInlineStart: cssPixelsToRem(left + scrollX),
    insetInlineEnd: 'auto',
    minInlineSize: props.matchTriggerWidth ? cssPixelsToRem(anchorRect.width) : '12rem',
    maxBlockSize: cssPixelsToRem(Math.max(0, window.innerHeight - padding * 2)),
    overflowY: 'auto',
  }
}
function observeFloatingContent() {
  resizeObserver?.disconnect()
  resizeObserver = undefined
  if (!props.teleportTo || typeof ResizeObserver === 'undefined') return
  resizeObserver = new ResizeObserver(positionContent)
  if (trigger.value) resizeObserver.observe(trigger.value)
  if (contentRoot.value) resizeObserver.observe(contentRoot.value)
}
function restoreTriggerFocus() {
  void nextTick(() => {
    const target = trigger.value
    if (
      !disposed &&
      !isOpen.value &&
      target &&
      target.isConnected !== false &&
      !('disabled' in target && target.disabled)
    )
      target.focus()
  })
}
function setOpen(
  next: boolean,
  reason: 'trigger' | 'select' | 'escape' | 'outside' | 'programmatic',
  originalEvent?: Event,
) {
  if (isOpen.value === next) return false
  if (!next) {
    let prevented = false
    emit('beforeClose', {
      reason,
      originalEvent,
      preventDefault: () => {
        prevented = true
      },
    })
    if (prevented) return false
  }
  if (props.open === undefined) local.value = next
  emit('update:open', next)
  emit('openChange', { open: next, reason })
  return true
}
function toggle() {
  if (!props.disabled) setOpen(!isOpen.value, 'trigger')
}
function outside(e: PointerEvent) {
  if (
    isTopAvenOverlayLayer(overlayLayer) &&
    isOpen.value &&
    !root.value?.contains(e.target as Node) &&
    !contentRoot.value?.contains(e.target as Node)
  )
    setOpen(false, 'outside', e)
}
function keydown(e: KeyboardEvent) {
  if (isTopAvenOverlayLayer(overlayLayer) && e.key === 'Escape' && isOpen.value) {
    e.stopPropagation()
    if (setOpen(false, 'escape', e)) restoreTriggerFocus()
  }
}
function attachDismissListener() {
  if (typeof document === 'undefined' || unregisterOverlay) return
  unregisterOverlay = registerAvenOverlayLayer(overlayLayer)
  document.addEventListener('pointerdown', outside, true)
  document.addEventListener('keydown', keydown)
  document.addEventListener('scroll', positionContent, true)
  if (typeof window !== 'undefined') window.addEventListener('resize', positionContent)
}
function detachDismissListener() {
  if (typeof document !== 'undefined') {
    document.removeEventListener('pointerdown', outside, true)
    document.removeEventListener('keydown', keydown)
    document.removeEventListener('scroll', positionContent, true)
  }
  if (typeof window !== 'undefined') window.removeEventListener('resize', positionContent)
  resizeObserver?.disconnect()
  resizeObserver = undefined
  unregisterOverlay?.()
  unregisterOverlay = undefined
}
watch(isOpen, async (value) => {
  if (value) {
    attachDismissListener()
    await nextTick()
    if (isOpen.value && !disposed) {
      positionContent()
      observeFloatingContent()
      menu.value?.focusFirst()
      await nextTick()
    }
    if (isOpen.value && !disposed) {
      emit('afterOpen')
    }
  } else {
    detachDismissListener()
    floatingStyle.value = {}
    await nextTick()
    if (!isOpen.value && !disposed) emit('afterClose')
  }
})
onMounted(() => {
  if (isOpen.value) {
    attachDismissListener()
    void nextTick(async () => {
      if (isOpen.value && !disposed) {
        positionContent()
        observeFloatingContent()
        menu.value?.focusFirst()
        await nextTick()
      }
      if (isOpen.value && !disposed) {
        emit('afterOpen')
      }
    })
  }
})
onBeforeUnmount(() => {
  disposed = true
  detachDismissListener()
})
watch(
  () => [
    props.teleportTo,
    props.placement,
    props.offset,
    props.collisionPadding,
    props.strategy,
    props.matchTriggerWidth,
  ],
  async () => {
    if (!isOpen.value) return
    await nextTick()
    if (!disposed && isOpen.value) {
      positionContent()
      observeFloatingContent()
    }
  },
)
function select(payload: { key: Key; item: AvenCommand<Key>; originalEvent: Event }) {
  emit('select', payload)
  if (props.closeOnSelect) {
    if (setOpen(false, 'select', payload.originalEvent)) restoreTriggerFocus()
  }
}
const triggerAttrs = computed(() => ({
  'aria-haspopup': 'menu' as const,
  'aria-expanded': isOpen.value,
  'aria-controls': isOpen.value ? menuId : undefined,
  disabled: props.disabled,
  onClick: toggle,
  onKeydown: (e: KeyboardEvent) => {
    if ((e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') && !isOpen.value) {
      e.preventDefault()
      setOpen(true, 'trigger')
    }
  },
}))
function setTrigger(el: unknown) {
  trigger.value =
    el && typeof el === 'object' && 'focus' in el && typeof el.focus === 'function'
      ? (el as HTMLElement)
      : undefined
}
</script>
<template>
  <span
    ref="root"
    v-bind="ui?.root?.attrs"
    :class="[
      'aven-dropdown-menu',
      `place-${placement}`,
      { 'is-open': isOpen, 'is-unstyled': unstyled },
      ui?.root?.class,
    ]"
    :style="[
      {
        '--aven-menu-offset': cssPixelsToRem(offset),
        ...(matchTriggerWidth ? { '--aven-menu-width': '100%' } : {}),
      },
      ui?.root?.style,
    ]"
    ><slot name="trigger" :trigger-attrs="triggerAttrs" :trigger-ref="setTrigger" :open="isOpen"
      ><button
        ref="trigger"
        type="button"
        v-bind="{ ...ui?.trigger?.attrs, ...triggerAttrs }"
        :class="['dropdown-trigger', ui?.trigger?.class]"
        :style="ui?.trigger?.style"
      >
        <slot name="trigger-leading" />{{ label }}<slot name="trigger-trailing" /></button
    ></slot>
    <Teleport :to="teleportTo ?? 'body'" :disabled="!teleportTo">
      <div
        v-if="isOpen"
        ref="contentRoot"
        v-bind="ui?.content?.attrs"
        :class="['dropdown-content', { 'is-teleported': teleportTo }, ui?.content?.class]"
        :style="[floatingStyle, ui?.content?.style]"
      >
        <AvenMenu
          ref="menu"
          :id="menuId"
          :items="items"
          :unstyled="unstyled"
          @select="select"
          @update:checked="emit('update:checked', $event)"
          @update:value="emit('update:value', $event)"
          @highlight="emit('highlight', $event)"
          @submenu-change="emit('submenuChange', $event)"
          ><template #item="scope"
            ><slot name="item" v-bind="scope">{{ scope.item.label }}</slot></template
          ><template v-if="$slots.leading" #leading="scope"
            ><slot name="leading" v-bind="scope" /></template
          ><template v-if="$slots.trailing" #trailing="scope"
            ><slot name="trailing" v-bind="scope" /></template
          ><template v-if="$slots.shortcut" #shortcut="scope"
            ><slot name="shortcut" v-bind="scope" /></template
          ><template v-if="$slots['group-label']" #group-label="scope"
            ><slot name="group-label" v-bind="scope" /></template
          ><template v-if="$slots['submenu-trigger']" #submenu-trigger="scope"
            ><slot name="submenu-trigger" v-bind="scope" /></template
          ><template v-if="$slots.submenu" #submenu="scope"
            ><slot name="submenu" v-bind="scope" /></template
          ><template #header><slot name="header" /></template
          ><template #footer><slot name="footer" /></template
          ><template #empty><slot name="empty">No actions</slot></template></AvenMenu
        >
      </div>
    </Teleport></span
  >
</template>
<style scoped>
.aven-dropdown-menu {
  position: relative;
  display: inline-flex;
}
.dropdown-trigger {
  min-block-size: 2.25rem;
  padding-inline: var(--aven-space-3);
  border: 0.0625rem solid var(--aven-color-border-interactive);
  border-radius: var(--aven-radius-md);
  background: var(--aven-color-surface-base);
  color: var(--aven-color-text-primary);
  font: inherit;
  cursor: pointer;
}
.dropdown-trigger:focus-visible {
  outline: 0.125rem solid var(--aven-color-focus-ring);
  outline-offset: 0.125rem;
}
.dropdown-content {
  position: absolute;
  z-index: 950;
  inline-size: var(--aven-menu-width, max-content);
  min-inline-size: 12rem;
  max-inline-size: calc(100vw - 1rem);
  inset-block-start: calc(100% + var(--aven-menu-offset));
  inset-inline-start: 0;
}
.dropdown-content.is-teleported {
  inset: auto;
  z-index: 950;
}
.place-bottom-end .dropdown-content,
.place-top-end .dropdown-content {
  inset-inline-start: auto;
  inset-inline-end: 0;
}
.place-top-start .dropdown-content,
.place-top-end .dropdown-content {
  inset-block-start: auto;
  inset-block-end: calc(100% + var(--aven-menu-offset));
}
.is-unstyled .dropdown-trigger {
  border: 0;
  border-radius: 0;
  background: transparent;
  color: inherit;
  padding: 0;
}
</style>
