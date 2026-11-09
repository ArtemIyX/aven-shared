<script setup lang="ts" generic="Key extends string | number = string | number">
import { computed, onBeforeUnmount, onMounted, useAttrs } from 'vue'
import type { AvenToastEvents, AvenToastProps, AvenToastSlots } from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenToastProps<Key>>(), {
  tone: 'neutral',
  duration: 5000,
  closable: true,
  pauseOnHover: true,
  pauseOnFocus: true,
  unstyled: false,
})
const emit = defineEmits<AvenToastEvents<Key>>()
defineSlots<AvenToastSlots>()
const attrs = useAttrs()
const liveMode = computed(() => props.live ?? (props.tone === 'critical' ? 'assertive' : 'polite'))
let timer: ReturnType<typeof setTimeout> | undefined
let deadline = 0
let remaining = 0
let hovered = false
let focused = false
let requested = false

function clearTimer() {
  if (timer !== undefined) clearTimeout(timer)
  timer = undefined
}
function startTimer() {
  clearTimer()
  if (props.duration <= 0 || requested) return
  if (remaining <= 0) remaining = props.duration
  deadline = Date.now() + remaining
  timer = setTimeout(() => requestDismiss('timeout'), remaining)
}
function pauseTimer() {
  if (timer === undefined) return
  remaining = Math.max(0, deadline - Date.now())
  clearTimer()
}
function syncPause() {
  if ((props.pauseOnHover && hovered) || (props.pauseOnFocus && focused)) pauseTimer()
  else startTimer()
}
function requestDismiss(reason: 'timeout' | 'close' | 'action' | 'programmatic') {
  if (requested) return
  requested = true
  clearTimer()
  emit('dismiss', { id: props.id, reason })
}
function onPointerEnter() {
  hovered = true
  syncPause()
}
function onPointerLeave() {
  hovered = false
  syncPause()
}
function onFocusIn() {
  focused = true
  syncPause()
}
function onFocusOut(event: FocusEvent) {
  const next = event.relatedTarget
  if (
    typeof Node !== 'undefined' &&
    next instanceof Node &&
    (event.currentTarget as HTMLElement).contains(next)
  )
    return
  focused = false
  syncPause()
}
function selectAction(originalEvent: MouseEvent) {
  if (!props.action || requested) return
  emit('action', { id: props.id, key: props.action.key, originalEvent })
  requestDismiss('action')
}
onMounted(() => {
  remaining = props.duration
  startTimer()
})
onBeforeUnmount(clearTimer)
defineExpose({ dismiss: () => requestDismiss('programmatic') })
</script>

<template>
  <section
    v-bind="{ ...attrs, ...props.ui?.root?.attrs }"
    :data-toast-key="`${typeof props.id}:${props.id}`"
    :class="[
      'aven-toast',
      `tone-${props.tone}`,
      { 'is-unstyled': props.unstyled },
      attrs.class,
      props.ui?.root?.class,
    ]"
    :style="[attrs.style, props.ui?.root?.style]"
    :role="liveMode === 'assertive' ? 'alert' : liveMode === 'polite' ? 'status' : undefined"
    :aria-live="liveMode === 'off' ? undefined : liveMode"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <span
      v-bind="props.ui?.icon?.attrs"
      v-if="$slots.icon"
      :class="['toast-icon', props.ui?.icon?.class]"
      :style="props.ui?.icon?.style"
    >
      <slot name="icon" />
    </span>
    <div
      v-bind="props.ui?.content?.attrs"
      :class="['toast-content', props.ui?.content?.class]"
      :style="props.ui?.content?.style"
    >
      <strong
        v-bind="props.ui?.title?.attrs"
        v-if="props.title || $slots.title"
        :class="props.ui?.title?.class"
        :style="props.ui?.title?.style"
      >
        <slot name="title">{{ props.title }}</slot>
      </strong>
      <p
        v-bind="props.ui?.description?.attrs"
        v-if="props.description"
        :class="props.ui?.description?.class"
        :style="props.ui?.description?.style"
      >
        {{ props.description }}
      </p>
      <div v-if="$slots.default" class="toast-extra"><slot /></div>
    </div>
    <div
      v-bind="props.ui?.actions?.attrs"
      v-if="props.action || props.closable"
      :class="['toast-actions', props.ui?.actions?.class]"
      :style="props.ui?.actions?.style"
    >
      <button v-if="props.action" type="button" @click="selectAction($event)">
        <slot name="action" :action="props.action" :dismiss="() => requestDismiss('programmatic')">
          {{ props.action.label }}
        </slot>
      </button>
      <button
        v-bind="props.ui?.close?.attrs"
        v-if="props.closable"
        type="button"
        :aria-label="`Dismiss ${props.title || 'notification'}`"
        :class="props.ui?.close?.class"
        :style="props.ui?.close?.style"
        @click="requestDismiss('close')"
      >
        <slot name="close-icon">×</slot>
      </button>
    </div>
  </section>
</template>

<style scoped>
.aven-toast {
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  gap: var(--aven-space-3);
  inline-size: min(26rem, calc(100vw - 2rem));
  max-inline-size: 100%;
  padding: var(--aven-space-4);
  border: 0.0625rem solid var(--toast-border, var(--aven-color-border-default));
  border-radius: var(--aven-radius-lg);
  background: var(--toast-bg, var(--aven-color-surface-raised));
  color: var(--toast-fg, var(--aven-color-text-primary));
  box-shadow: var(--aven-shadow-lg);
}
.tone-success {
  --toast-border: var(--aven-color-success-border);
  --toast-bg: var(--aven-color-success-subtle);
  --toast-fg: var(--aven-color-success-text);
}
.tone-warning {
  --toast-border: var(--aven-color-warning-border);
  --toast-bg: var(--aven-color-warning-subtle);
  --toast-fg: var(--aven-color-warning-text);
}
.tone-danger,
.tone-critical {
  --toast-border: var(--aven-color-danger-border);
  --toast-bg: var(--aven-color-danger-subtle);
  --toast-fg: var(--aven-color-danger-text);
}
.tone-accent {
  --toast-border: var(--aven-color-accent-border);
  --toast-bg: var(--aven-color-accent-subtle);
  --toast-fg: var(--aven-color-accent-text);
}
.toast-icon {
  flex: none;
}
.toast-content {
  display: grid;
  flex: 1 1 auto;
  gap: var(--aven-space-1);
  min-inline-size: 0;
  overflow-wrap: anywhere;
}
.toast-content p {
  margin: 0;
  color: var(--aven-color-text-secondary);
}
.toast-actions {
  display: flex;
  flex: none;
  align-items: center;
  gap: var(--aven-space-2);
}
.toast-actions button {
  min-inline-size: 2.5rem;
  min-block-size: 2.5rem;
  padding-inline: var(--aven-space-2);
  border: 0.0625rem solid var(--aven-color-border-default);
  border-radius: var(--aven-radius-md);
  background: var(--aven-color-surface-base);
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.toast-actions button:focus-visible {
  outline: 0.125rem solid var(--aven-color-focus-ring);
  outline-offset: 0.125rem;
}
.is-unstyled {
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}
@media (prefers-reduced-motion: reduce) {
  .aven-toast {
    animation: none;
    transition: none;
  }
}
@media (forced-colors: active) {
  .aven-toast,
  .toast-actions button {
    border-color: CanvasText;
  }
}
@media print {
  .aven-toast {
    border-color: currentColor;
    background: transparent;
    box-shadow: none;
    color: currentColor;
  }
}
</style>
