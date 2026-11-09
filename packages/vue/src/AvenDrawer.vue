<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useAttrs } from 'vue'
import type { CSSProperties } from 'vue'
import AvenDialog from './AvenDialog.vue'
import type {
  AvenDialogProps,
  AvenDrawerEvents,
  AvenDrawerProps,
  AvenDrawerSlots,
} from './types.js'
import { cssPixelsToRem } from './cssLength.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenDrawerProps>(), {
  open: undefined,
  defaultOpen: false,
  side: 'end',
  defaultSize: '24rem',
  minSize: '14rem',
  resizable: false,
  resizeDisabled: false,
  modal: true,
  closeOnEscape: true,
  closeOnOutside: true,
  showClose: true,
  restoreFocus: true,
  unstyled: false,
})
const emit = defineEmits<AvenDrawerEvents>()
defineSlots<AvenDrawerSlots>()
const attrs = useAttrs()
const root = ref<HTMLElement>()
const dialog = ref<{ close: () => void; focus: () => void } | null>(null)
const localSize = ref(props.defaultSize)
const size = computed(() => props.size ?? localSize.value)
const dialogUi = computed<AvenDialogProps['ui']>(() => ({
  root: props.ui?.root,
  content: props.ui?.content,
  header: props.ui?.header,
  title: props.ui?.title,
  description: props.ui?.description,
  body: props.ui?.body,
  footer: props.ui?.footer,
  close: props.ui?.close,
}))
let resizeSession: { coordinate: number; size: number; pointerId: number } | null = null
function pixels(value: number | string | undefined, fallback: number) {
  if (typeof value === 'number') return value
  if (!value) return fallback
  const amount = Number.parseFloat(value)
  if (!Number.isFinite(amount)) return fallback
  if (value.endsWith('rem') && typeof document !== 'undefined')
    return amount * Number.parseFloat(getComputedStyle(document.documentElement).fontSize || '16')
  if (value.endsWith('vw') && typeof window !== 'undefined')
    return (amount / 100) * window.innerWidth
  if (value.endsWith('vh') && typeof window !== 'undefined')
    return (amount / 100) * window.innerHeight
  return amount
}
function isInlineSide() {
  return props.side === 'start' || props.side === 'end'
}
function currentPixels() {
  const rect = root.value?.querySelector('dialog')?.getBoundingClientRect()
  return rect ? (isInlineSide() ? rect.width : rect.height) : pixels(size.value, 384)
}
function limits() {
  const min = pixels(props.minSize, 224)
  const fallbackMax =
    typeof window === 'undefined' ? 768 : Math.min(window.innerWidth, window.innerHeight) * 0.9
  return [min, Math.max(min, pixels(props.maxSize, fallbackMax))] as const
}
function requestSize(next: number) {
  const [min, max] = limits()
  const nextSize = Math.round(Math.max(min, Math.min(max, next)))
  if (nextSize === Math.round(currentPixels())) return
  const value = cssPixelsToRem(nextSize)
  if (props.size === undefined) localSize.value = value
  emit('update:size', value)
}
function movementSign() {
  if (!isInlineSide()) return props.side === 'top' ? 1 : -1
  const direction =
    root.value && typeof getComputedStyle !== 'undefined'
      ? getComputedStyle(root.value).direction
      : 'ltr'
  return props.side === 'start' ? (direction === 'ltr' ? 1 : -1) : direction === 'rtl' ? 1 : -1
}
function onPointerMove(event: PointerEvent) {
  if (!resizeSession || event.pointerId !== resizeSession.pointerId) return
  const coordinate = isInlineSide() ? event.clientX : event.clientY
  requestSize(resizeSession.size + (coordinate - resizeSession.coordinate) * movementSign())
}
function onPointerUp(event: PointerEvent) {
  if (!resizeSession || event.pointerId !== resizeSession.pointerId) return
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
  resizeSession = null
  emit('resizeEnd', { size: size.value })
}
function startResize(event: PointerEvent) {
  if (!props.resizable || props.resizeDisabled) return
  event.preventDefault()
  resizeSession = {
    coordinate: isInlineSide() ? event.clientX : event.clientY,
    size: currentPixels(),
    pointerId: event.pointerId,
  }
  emit('resizeStart', { size: size.value })
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerUp)
}
function onResizeKeydown(event: KeyboardEvent) {
  if (!props.resizable || props.resizeDisabled) return
  const key = isInlineSide()
    ? movementSign() > 0
      ? 'ArrowRight'
      : 'ArrowLeft'
    : movementSign() > 0
      ? 'ArrowDown'
      : 'ArrowUp'
  if (
    event.key !== key &&
    event.key !==
      (key === 'ArrowRight'
        ? 'ArrowLeft'
        : key === 'ArrowLeft'
          ? 'ArrowRight'
          : key === 'ArrowDown'
            ? 'ArrowUp'
            : 'ArrowDown')
  )
    return
  event.preventDefault()
  requestSize(currentPixels() + (event.key === key ? 16 : -16))
}
const dialogStyle = computed<CSSProperties>(
  () => ({ '--aven-drawer-size': size.value }) as CSSProperties,
)
onBeforeUnmount(() => {
  if (!resizeSession || typeof window === 'undefined') return
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
  resizeSession = null
})
defineExpose({
  close: () => dialog.value?.close(),
  focus: () => dialog.value?.focus(),
  resize: requestSize,
})
</script>

<template>
  <div ref="root" :class="['aven-drawer-host', { 'is-unstyled': unstyled }]">
    <AvenDialog
      ref="dialog"
      v-bind="{ ...attrs, ...props.ui?.root?.attrs }"
      :modal="modal"
      :open="open"
      :default-open="defaultOpen"
      :id="id"
      :title="title"
      :description="description"
      :close-on-escape="closeOnEscape"
      :close-on-outside="closeOnOutside"
      :show-close="showClose"
      :initial-focus="initialFocus"
      :restore-focus="restoreFocus"
      :unstyled="unstyled"
      :ui="dialogUi"
      :class="[
        'aven-drawer',
        `side-${side}`,
        { 'is-resizable': resizable, 'is-modal': modal },
        ui?.root?.class,
      ]"
      :style="[attrs.style, dialogStyle, ui?.root?.style]"
      @update:open="emit('update:open', $event)"
      @open-change="emit('openChange', $event)"
      @before-close="emit('beforeClose', $event)"
      @after-open="emit('afterOpen')"
      @after-close="emit('afterClose')"
    >
      <template v-if="$slots.header" #header="scope"
        ><slot name="header" v-bind="scope"
      /></template>
      <template v-if="$slots.title" #title><slot name="title" /></template>
      <template v-if="$slots.description" #description><slot name="description" /></template>
      <template v-if="$slots.footer" #footer="scope"
        ><slot name="footer" v-bind="scope"
      /></template>
      <template v-if="$slots.actions" #actions="scope"
        ><slot name="actions" v-bind="scope"
      /></template>
      <template v-if="$slots['close-icon']" #close-icon><slot name="close-icon" /></template>
      <template #default>
        <div class="drawer-body"><slot :close="() => dialog?.close()" /></div>
        <div
          v-if="resizable"
          v-bind="ui?.resizeHandle?.attrs"
          role="separator"
          :aria-label="`Resize ${title || 'drawer'}`"
          :aria-orientation="isInlineSide() ? 'vertical' : 'horizontal'"
          :aria-valuenow="Math.round(currentPixels())"
          :aria-disabled="resizeDisabled || undefined"
          :tabindex="resizeDisabled ? -1 : 0"
          :class="['drawer-resize-handle', ui?.resizeHandle?.class]"
          :style="ui?.resizeHandle?.style"
          @pointerdown="startResize"
          @keydown="onResizeKeydown"
        >
          <slot name="resize-handle" :size="size" />
        </div>
      </template>
    </AvenDialog>
  </div>
</template>

<style scoped>
.aven-drawer-host {
  display: contents;
}
.aven-drawer-host :deep(.aven-dialog.aven-drawer) {
  position: fixed;
  inset: auto;
  margin: 0;
  inline-size: var(--aven-drawer-size);
  block-size: 100dvh;
  max-inline-size: min(90vw, var(--aven-drawer-size));
  max-block-size: none;
  border-radius: 0;
}
.aven-drawer-host :deep(.aven-dialog.aven-drawer.side-start) {
  inset-block: 0;
  inset-inline-start: 0;
}
.aven-drawer-host :deep(.aven-dialog.aven-drawer.side-end) {
  inset-block: 0;
  inset-inline-end: 0;
}
.aven-drawer-host :deep(.aven-dialog.aven-drawer.side-top) {
  inset-inline: 0;
  inset-block-start: 0;
  inline-size: 100vw;
  block-size: var(--aven-drawer-size);
  max-inline-size: none;
  max-block-size: 90vh;
}
.aven-drawer-host :deep(.aven-dialog.aven-drawer.side-bottom) {
  inset-inline: 0;
  inset-block-end: 0;
  inline-size: 100vw;
  block-size: var(--aven-drawer-size);
  max-inline-size: none;
  max-block-size: 90vh;
}
.aven-drawer-host :deep(.aven-dialog.aven-drawer .dialog-content) {
  position: relative;
  inline-size: 100%;
  block-size: 100%;
  max-block-size: 100%;
}
.aven-drawer-host :deep(.aven-dialog.aven-drawer .dialog-body) {
  flex: 1;
  min-block-size: 0;
}
.aven-drawer-host :deep(.side-start) {
  border-inline-end: 0.0625rem solid var(--aven-color-border-subtle);
}
.aven-drawer-host :deep(.side-end) {
  border-inline-start: 0.0625rem solid var(--aven-color-border-subtle);
}
.aven-drawer-host :deep(.side-top) {
  border-block-end: 0.0625rem solid var(--aven-color-border-subtle);
}
.aven-drawer-host :deep(.side-bottom) {
  border-block-start: 0.0625rem solid var(--aven-color-border-subtle);
}
.drawer-body {
  min-inline-size: 0;
}
.drawer-resize-handle {
  position: absolute;
  z-index: 2;
  display: block;
  touch-action: none;
}
.side-start .drawer-resize-handle {
  inset-block: 0;
  inset-inline-end: -0.25rem;
  inline-size: 0.5rem;
  cursor: ew-resize;
}
.side-end .drawer-resize-handle {
  inset-block: 0;
  inset-inline-start: -0.25rem;
  inline-size: 0.5rem;
  cursor: ew-resize;
}
.side-top .drawer-resize-handle {
  inset-inline: 0;
  inset-block-end: -0.25rem;
  block-size: 0.5rem;
  cursor: ns-resize;
}
.side-bottom .drawer-resize-handle {
  inset-inline: 0;
  inset-block-start: -0.25rem;
  block-size: 0.5rem;
  cursor: ns-resize;
}
.drawer-resize-handle:focus-visible {
  outline: 0.125rem solid var(--aven-color-focus-ring);
  outline-offset: -0.125rem;
}
.is-unstyled :deep(.aven-drawer) {
  border: 0;
  border-radius: 0;
  box-shadow: none;
}
@media (max-width: 36rem) {
  .aven-drawer-host :deep(.aven-dialog.aven-drawer.side-start),
  .aven-drawer-host :deep(.aven-dialog.aven-drawer.side-end) {
    inline-size: min(var(--aven-drawer-size), 100vw);
    max-inline-size: 100vw;
  }
}
@media (forced-colors: active) {
  .drawer-resize-handle:focus-visible {
    outline-color: Highlight;
  }
}
</style>
