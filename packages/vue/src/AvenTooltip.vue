<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { AvenOpenReason } from './composables.js'
import type { AvenUi } from './types.js'
const props = withDefaults(
  defineProps<{
    text?: string
    open?: boolean
    defaultOpen?: boolean
    openDelay?: number
    closeDelay?: number
    placement?: 'top' | 'bottom' | 'left' | 'right'
    disabled?: boolean
    showArrow?: boolean
    unstyled?: boolean
    ui?: AvenUi<'root' | 'trigger' | 'content' | 'arrow'>
  }>(),
  {
    openDelay: 400,
    closeDelay: 100,
    placement: 'top',
    disabled: false,
    showArrow: true,
    unstyled: false,
  },
)
const emit = defineEmits<{
  'update:open': [open: boolean]
  openChange: [change: { open: boolean; reason: AvenOpenReason }]
}>()
const local = ref(props.defaultOpen ?? false),
  isOpen = computed(() => (props.open === undefined ? local.value : props.open)),
  trigger = ref<HTMLElement>(),
  timer = ref<ReturnType<typeof setTimeout>>(),
  id = `aven-tooltip-${Math.random().toString(36).slice(2)}`
function setOpen(value: boolean, reason: AvenOpenReason) {
  if (props.disabled || isOpen.value === value) return
  if (props.open === undefined) local.value = value
  emit('update:open', value)
  emit('openChange', { open: value, reason })
}
function schedule(value: boolean, reason: AvenOpenReason) {
  if (timer.value) clearTimeout(timer.value)
  timer.value = setTimeout(() => setOpen(value, reason), value ? props.openDelay : props.closeDelay)
}
function keydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value) {
    if (timer.value) clearTimeout(timer.value)
    setOpen(false, 'escape')
  }
}
watch(isOpen, (value) => {
  if (value) document.addEventListener('keydown', keydown)
  else document.removeEventListener('keydown', keydown)
})
onMounted(() => {
  if (isOpen.value) document.addEventListener('keydown', keydown)
})
onBeforeUnmount(() => {
  if (timer.value) clearTimeout(timer.value)
  document.removeEventListener('keydown', keydown)
})
const triggerAttrs = computed(() => ({
  'aria-describedby': isOpen.value ? id : undefined,
  'aria-haspopup': undefined,
}))
</script>
<template>
  <span
    :class="[
      'aven-tooltip',
      `place-${placement}`,
      { 'is-open': isOpen, 'is-unstyled': unstyled },
      ui?.root?.class,
    ]"
    :style="ui?.root?.style"
    @mouseenter="schedule(true, 'trigger')"
    @mouseleave="schedule(false, 'outside')"
    @focusin="schedule(true, 'trigger')"
    @focusout="schedule(false, 'outside')"
    ><slot
      name="trigger"
      :trigger-attrs="triggerAttrs"
      :trigger-ref="(el: HTMLElement | null) => (trigger = el ?? undefined)"
      :open="isOpen" /><span
      v-if="isOpen"
      :id="id"
      role="tooltip"
      :class="['tooltip-content', ui?.content?.class]"
      :style="ui?.content?.style"
      ><slot>{{ text }}</slot
      ><span
        v-if="showArrow"
        aria-hidden="true"
        :class="['tooltip-arrow', ui?.arrow?.class]" /></span
  ></span>
</template>
<style scoped>
.aven-tooltip {
  position: relative;
  display: inline-flex;
  max-inline-size: 100%;
}
.tooltip-content {
  position: absolute;
  z-index: 1000;
  inline-size: max-content;
  max-inline-size: min(20rem, calc(100vw - 1rem));
  padding: 0.4rem 0.65rem;
  border-radius: var(--aven-radius-sm);
  background: var(--aven-color-surface-context-menu);
  color: var(--aven-color-text-primary);
  box-shadow: 0 3px 12px var(--aven-color-shadow-ambient);
  font-size: var(--aven-font-size-sm);
  line-height: var(--aven-line-height-normal);
  overflow-wrap: anywhere;
}
.place-top .tooltip-content {
  inset-block-end: calc(100% + 0.5rem);
  inset-inline-start: 50%;
  transform: translateX(-50%);
}
.place-bottom .tooltip-content {
  inset-block-start: calc(100% + 0.5rem);
  inset-inline-start: 50%;
  transform: translateX(-50%);
}
.place-left .tooltip-content {
  inset-inline-end: calc(100% + 0.5rem);
  inset-block-start: 50%;
  transform: translateY(-50%);
}
.place-right .tooltip-content {
  inset-inline-start: calc(100% + 0.5rem);
  inset-block-start: 50%;
  transform: translateY(-50%);
}
.tooltip-arrow {
  position: absolute;
  inline-size: 0.5rem;
  block-size: 0.5rem;
  background: inherit;
  transform: rotate(45deg);
}
.place-top .tooltip-arrow {
  inset-block-end: -0.22rem;
  inset-inline-start: calc(50% - 0.25rem);
}
.place-bottom .tooltip-arrow {
  inset-block-start: -0.22rem;
  inset-inline-start: calc(50% - 0.25rem);
}
.place-left .tooltip-arrow {
  inset-inline-end: -0.22rem;
  inset-block-start: calc(50% - 0.25rem);
}
.place-right .tooltip-arrow {
  inset-inline-start: -0.22rem;
  inset-block-start: calc(50% - 0.25rem);
}
.is-unstyled .tooltip-content {
  border: 1px solid currentColor;
  box-shadow: none;
}
@media (prefers-reduced-motion: reduce) {
  .tooltip-content {
    scroll-behavior: auto;
  }
}
</style>
