<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { AvenOpenReason } from './composables.js'
import type { AvenUi } from './types.js'
const props = withDefaults(
  defineProps<{
    open?: boolean
    defaultOpen?: boolean
    placement?: 'top' | 'bottom' | 'left' | 'right'
    offset?: number
    showArrow?: boolean
    dismissible?: boolean
    matchTriggerWidth?: boolean
    unstyled?: boolean
    ui?: AvenUi<'root' | 'trigger' | 'content' | 'header' | 'footer' | 'arrow'>
  }>(),
  {
    placement: 'bottom',
    offset: 8,
    showArrow: false,
    dismissible: true,
    matchTriggerWidth: false,
    unstyled: false,
  },
)
const emit = defineEmits<{
  'update:open': [open: boolean]
  openChange: [change: { open: boolean; reason: AvenOpenReason }]
  dismiss: [payload: { reason: AvenOpenReason; originalEvent?: Event }]
}>()
const local = ref(props.defaultOpen ?? false),
  isOpen = computed(() => (props.open === undefined ? local.value : props.open)),
  root = ref<HTMLElement>(),
  trigger = ref<HTMLElement>()
function setOpen(value: boolean, reason: AvenOpenReason, event?: Event) {
  if (isOpen.value === value) return
  if (props.open === undefined) local.value = value
  emit('update:open', value)
  emit('openChange', { open: value, reason })
  if (!value) emit('dismiss', { reason, originalEvent: event })
}
function outside(e: PointerEvent) {
  if (isOpen.value && !root.value?.contains(e.target as Node)) setOpen(false, 'outside', e)
}
function keydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value) {
    e.stopPropagation()
    setOpen(false, 'escape', e)
    trigger.value?.focus()
  }
}
watch(isOpen, (v) => {
  if (v) {
    document.addEventListener('pointerdown', outside, true)
    document.addEventListener('keydown', keydown)
  } else {
    document.removeEventListener('pointerdown', outside, true)
    document.removeEventListener('keydown', keydown)
  }
})
onMounted(() => {
  if (isOpen.value) {
    document.addEventListener('pointerdown', outside, true)
    document.addEventListener('keydown', keydown)
  }
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', outside, true)
  document.removeEventListener('keydown', keydown)
})
const triggerAttrs = computed(() => ({
  'aria-expanded': isOpen.value,
  'aria-haspopup': 'dialog',
  onClick: () => setOpen(!isOpen.value, 'trigger'),
}))
function setTrigger(el: Element | null) {
  trigger.value = el instanceof HTMLElement ? el : undefined
}
</script>
<template>
  <span
    ref="root"
    :class="[
      'aven-popover',
      `place-${placement}`,
      { 'is-open': isOpen, 'is-unstyled': unstyled },
      ui?.root?.class,
    ]"
    :style="[
      {
        '--aven-popover-offset': `${offset}px`,
        ...(matchTriggerWidth ? { '--aven-popover-width': '100%' } : {}),
      },
      ui?.root?.style,
    ]"
    ><slot name="trigger" :trigger-attrs="triggerAttrs" :trigger-ref="setTrigger" :open="isOpen" />
    <section
      v-if="isOpen"
      role="dialog"
      :class="['popover-content', ui?.content?.class]"
      :style="ui?.content?.style"
    >
      <header v-if="$slots.header" :class="['popover-header', ui?.header?.class]">
        <slot name="header" :close="() => setOpen(false, 'programmatic')" />
      </header>
      <div class="popover-body"><slot :close="() => setOpen(false, 'programmatic')" /></div>
      <footer v-if="$slots.footer" :class="['popover-footer', ui?.footer?.class]">
        <slot name="footer" :close="() => setOpen(false, 'programmatic')" />
      </footer>
      <span
        v-if="showArrow"
        aria-hidden="true"
        :class="['popover-arrow', ui?.arrow?.class]"
      /></section
  ></span>
</template>
<style scoped>
.aven-popover {
  position: relative;
  display: inline-flex;
  max-inline-size: 100%;
}
.popover-content {
  position: absolute;
  z-index: 900;
  inline-size: var(--aven-popover-width, min(22rem, calc(100vw - 1rem)));
  max-block-size: min(32rem, calc(100vh - 2rem));
  overflow: auto;
  border: 1px solid var(--aven-color-border-subtle);
  border-radius: var(--aven-radius-lg);
  background: var(--aven-color-surface-popover);
  color: var(--aven-color-text-primary);
  box-shadow: 0 8px 24px var(--aven-color-shadow-ambient);
  overscroll-behavior: contain;
}
.place-bottom .popover-content {
  inset-block-start: calc(100% + var(--aven-popover-offset));
  inset-inline-start: 0;
}
.place-top .popover-content {
  inset-block-end: calc(100% + var(--aven-popover-offset));
  inset-inline-start: 0;
}
.place-left .popover-content {
  inset-inline-end: calc(100% + var(--aven-popover-offset));
  inset-block-start: 0;
}
.place-right .popover-content {
  inset-inline-start: calc(100% + var(--aven-popover-offset));
  inset-block-start: 0;
}
.popover-header,
.popover-footer {
  padding: var(--aven-space-3) var(--aven-space-4);
  border-block-end: 1px solid var(--aven-color-border-subtle);
}
.popover-footer {
  border-block-start: 1px solid var(--aven-color-border-subtle);
  border-block-end: 0;
}
.popover-body {
  padding: var(--aven-space-4);
}
.popover-arrow {
  position: absolute;
  inline-size: 0.5rem;
  block-size: 0.5rem;
  background: var(--aven-color-surface-popover);
  transform: rotate(45deg);
}
.is-unstyled .popover-content {
  border: 0;
  border-radius: 0;
  box-shadow: none;
}
.is-unstyled .popover-body {
  padding: 0;
}
</style>
