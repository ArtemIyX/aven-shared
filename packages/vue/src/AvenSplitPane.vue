<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useAttrs } from 'vue'
import type { AvenSplitPaneEvents, AvenSplitPaneProps, AvenSplitPaneSlots } from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenSplitPaneProps>(), {
  panes: 2,
  orientation: 'horizontal',
  collapsible: false,
  resizeStep: 1,
  unstyled: false,
})
const emit = defineEmits<AvenSplitPaneEvents>()
defineSlots<AvenSplitPaneSlots>()
const attrs = useAttrs()
const root = ref<HTMLElement | null>(null)
const localSizes = ref<number[]>(normalize(props.defaultValue, props.panes))
const sizes = computed(() => normalize(props.modelValue ?? localSizes.value, props.panes))
const paneIndexes = computed(() =>
  Array.from({ length: Math.max(1, props.panes) }, (_, index) => index),
)
const handleIndexes = computed(() => paneIndexes.value.slice(0, -1))
const drag = ref<{
  index: number
  pointerId: number
  startCoordinate: number
  startSizes: number[]
  lastSizes: number[]
} | null>(null)

function normalize(value: number[] | undefined, count: number) {
  const safeCount = Math.max(1, Math.floor(count || 1))
  const input =
    value?.length === safeCount ? value : Array.from({ length: safeCount }, () => 100 / safeCount)
  const clean = input.map((size) => (Number.isFinite(size) && size > 0 ? size : 0))
  const total = clean.reduce((sum, size) => sum + size, 0)
  if (total <= 0) return Array.from({ length: safeCount }, () => 100 / safeCount)
  const result = clean.map((size) => (size / total) * 100)
  result[result.length - 1] = 100 - result.slice(0, -1).reduce((sum, size) => sum + size, 0)
  return result
}
function minFor(index: number) {
  return Math.max(0, props.minSizes?.[index] ?? (props.collapsible ? 0 : 10))
}
function maxFor(index: number) {
  return Math.min(100, Math.max(minFor(index), props.maxSizes?.[index] ?? 100))
}
function pairFor(index: number, base = sizes.value) {
  const total = base[index]! + base[index + 1]!
  const min = Math.max(minFor(index), total - maxFor(index + 1))
  const max = Math.min(maxFor(index), total - minFor(index + 1))
  return { total, min, max }
}
function rounded(values: number[]) {
  const result = values.map((value) => Math.round(value * 100) / 100)
  result[result.length - 1] =
    Math.round((100 - result.slice(0, -1).reduce((sum, value) => sum + value, 0)) * 100) / 100
  return result
}
function resize(index: number, nextSize: number, base = sizes.value) {
  const { total, min, max } = pairFor(index, base)
  const next = [...base]
  next[index] = Math.min(max, Math.max(min, nextSize))
  next[index + 1] = total - next[index]!
  return rounded(next)
}
function requestSizes(next: number[]) {
  if (props.modelValue === undefined) localSizes.value = next
  emit('update:modelValue', next)
}
function startResize(index: number, event: PointerEvent) {
  if (event.button !== 0 || typeof window === 'undefined') return
  event.preventDefault()
  drag.value = {
    index,
    pointerId: event.pointerId,
    startCoordinate: props.orientation === 'horizontal' ? event.clientX : event.clientY,
    startSizes: [...sizes.value],
    lastSizes: [...sizes.value],
  }
  emit('resizeStart', { sizes: [...sizes.value] })
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', stopResize)
  window.addEventListener('pointercancel', stopResize)
}
function onPointerMove(event: PointerEvent) {
  if (!drag.value || drag.value.pointerId !== event.pointerId) return
  const rootSize =
    props.orientation === 'horizontal' ? root.value?.clientWidth : root.value?.clientHeight
  if (!rootSize) return
  const coordinate = props.orientation === 'horizontal' ? event.clientX : event.clientY
  const direction =
    props.orientation === 'horizontal' &&
    typeof document !== 'undefined' &&
    getComputedStyle(document.documentElement).direction === 'rtl'
      ? -1
      : 1
  const delta = ((coordinate - drag.value.startCoordinate) / rootSize) * 100 * direction
  drag.value.lastSizes = resize(
    drag.value.index,
    drag.value.startSizes[drag.value.index]! + delta,
    drag.value.startSizes,
  )
  requestSizes(drag.value.lastSizes)
}
function stopResize(event: PointerEvent) {
  if (!drag.value || (event.pointerId !== undefined && drag.value.pointerId !== event.pointerId))
    return
  const lastSizes = drag.value.lastSizes
  drag.value = null
  if (typeof window !== 'undefined') {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', stopResize)
    window.removeEventListener('pointercancel', stopResize)
  }
  emit('resizeEnd', { sizes: [...lastSizes] })
}
function onKeydown(index: number, event: KeyboardEvent) {
  const current = sizes.value[index]!
  const { min, max } = pairFor(index)
  const isHorizontal = props.orientation === 'horizontal'
  const rtl =
    isHorizontal &&
    typeof document !== 'undefined' &&
    getComputedStyle(document.documentElement).direction === 'rtl'
  let next: number | undefined
  if (isHorizontal && event.key === (rtl ? 'ArrowLeft' : 'ArrowRight'))
    next = current + props.resizeStep
  else if (isHorizontal && event.key === (rtl ? 'ArrowRight' : 'ArrowLeft'))
    next = current - props.resizeStep
  else if (!isHorizontal && event.key === 'ArrowDown') next = current + props.resizeStep
  else if (!isHorizontal && event.key === 'ArrowUp') next = current - props.resizeStep
  else if (event.key === 'Home') next = min
  else if (event.key === 'End') next = max
  if (next === undefined) return
  event.preventDefault()
  const adjusted = resize(index, next)
  requestSizes(adjusted)
}
onBeforeUnmount(() => {
  drag.value = null
  if (typeof window !== 'undefined') {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', stopResize)
    window.removeEventListener('pointercancel', stopResize)
  }
})
</script>

<template>
  <div
    ref="root"
    v-bind="{ ...attrs, ...props.ui?.root?.attrs }"
    :role="props.label ? 'group' : undefined"
    :aria-label="props.label"
    :class="[
      'aven-split-pane',
      `is-${props.orientation}`,
      { 'is-unstyled': props.unstyled, 'is-resizing': drag !== null },
      attrs.class,
      props.ui?.root?.class,
    ]"
    :style="[attrs.style, props.ui?.root?.style]"
  >
    <template v-for="(index, position) in paneIndexes" :key="`pane-${index}`">
      <section
        v-bind="props.ui?.pane?.attrs"
        :aria-label="props.labels?.[index]"
        :class="['split-pane-region', props.ui?.pane?.class]"
        :style="[{ flexBasis: `${sizes[index]}%` }, props.ui?.pane?.style]"
      >
        <slot name="pane" :index="index" :sizes="sizes" />
      </section>
      <div
        v-bind="props.ui?.handle?.attrs"
        v-if="position < paneIndexes.length - 1"
        role="separator"
        tabindex="0"
        :aria-label="`${props.labels?.[index] ?? `Pane ${index + 1}`} resize handle`"
        :aria-orientation="props.orientation === 'horizontal' ? 'vertical' : 'horizontal'"
        :aria-valuemin="pairFor(index).min"
        :aria-valuemax="pairFor(index).max"
        :aria-valuenow="sizes[index]"
        :class="['split-pane-handle', props.ui?.handle?.class]"
        :style="props.ui?.handle?.style"
        @pointerdown="startResize(index, $event)"
        @keydown="onKeydown(index, $event)"
      >
        <slot name="handle" :index="index" :sizes="sizes">
          <span class="split-pane-grip" aria-hidden="true" />
        </slot>
      </div>
    </template>
  </div>
</template>

<style scoped>
.aven-split-pane {
  --aven-splitter-size: 0.5rem;
  --aven-splitter-color: var(--aven-color-divider-resize);
  display: flex;
  min-inline-size: 0;
  min-block-size: 0;
  overflow: hidden;
}
.is-horizontal {
  flex-direction: row;
}
.is-vertical {
  flex-direction: column;
}
.split-pane-region {
  flex-grow: 0;
  flex-shrink: 0;
  min-inline-size: 0;
  min-block-size: 0;
  overflow: auto;
}
.is-horizontal .split-pane-region {
  inline-size: 0;
}
.is-vertical .split-pane-region {
  block-size: 0;
}
.split-pane-handle {
  position: relative;
  z-index: 1;
  display: grid;
  flex: 0 0 var(--aven-splitter-size);
  place-items: center;
  touch-action: none;
  outline: none;
}
.is-horizontal .split-pane-handle {
  cursor: col-resize;
}
.is-vertical .split-pane-handle {
  cursor: row-resize;
}
.split-pane-handle::before {
  position: absolute;
  content: '';
  background: var(--aven-splitter-color);
}
.is-horizontal .split-pane-handle::before {
  inset-block: 0;
  inset-inline: calc(50% - 1px);
}
.is-vertical .split-pane-handle::before {
  inset-inline: 0;
  inset-block: calc(50% - 1px);
}
.split-pane-handle:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: -2px;
}
.split-pane-grip {
  position: relative;
  inline-size: 0.25rem;
  block-size: 1.5rem;
  border-radius: var(--aven-radius-full);
  background: var(--aven-splitter-color);
}
.is-vertical .split-pane-grip {
  inline-size: 1.5rem;
  block-size: 0.25rem;
}
.is-resizing,
.is-resizing * {
  user-select: none;
}
.is-unstyled .split-pane-handle::before {
  background: currentColor;
  opacity: 0.4;
}
.is-unstyled .split-pane-grip {
  background: currentColor;
}
@media (forced-colors: active) {
  .split-pane-handle::before,
  .split-pane-grip {
    background: CanvasText;
  }
  .split-pane-handle:focus-visible {
    outline-color: Highlight;
  }
}
@media (prefers-reduced-motion: reduce) {
  .aven-split-pane,
  .split-pane-region,
  .split-pane-handle {
    scroll-behavior: auto;
    transition-duration: 0.01ms;
  }
}
@media print {
  .aven-split-pane {
    display: block;
    overflow: visible;
  }
  .split-pane-region {
    inline-size: auto !important;
    block-size: auto !important;
    overflow: visible;
    break-inside: avoid;
  }
  .split-pane-handle {
    display: none;
  }
}
</style>
