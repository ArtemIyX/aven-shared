<script setup lang="ts" generic="T, Key extends string | number = string | number">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
  useAttrs,
} from 'vue'
import type { AvenVirtualListEvents, AvenVirtualListProps, AvenVirtualListSlots } from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenVirtualListProps<T, Key>>(), {
  estimateSize: 40,
  overscan: 5,
  orientation: 'vertical',
  loading: false,
  unstyled: false,
})
const emit = defineEmits<AvenVirtualListEvents<T, Key>>()
defineSlots<AvenVirtualListSlots<T, Key>>()
const attrs = useAttrs()
const viewport = ref<HTMLElement | null>(null)
const scrollOffset = ref(0)
const viewportExtent = ref(0)
const rowSizes = shallowRef(new Map<Key, number>())
const focusedKey = shallowRef<Key | undefined>()
const rowElements = new Map<Key, HTMLElement>()
const rangeState = ref({ start: 0, end: -1 })
let observer: ResizeObserver | undefined
let lastEndNotification = false

const entries = computed(() =>
  props.items.map((item, index) => ({ item, index, key: props.itemKey(item, index) })),
)
const estimate = computed(() => Math.max(1, props.estimateSize))
const sizeFor = (key: Key) => rowSizes.value.get(key) ?? estimate.value
const starts = computed(() => {
  const result: number[] = []
  let position = 0
  for (const entry of entries.value) {
    result.push(position)
    position += sizeFor(entry.key)
  }
  return result
})
const totalExtent = computed(() => {
  const last = entries.value.at(-1)
  return last ? starts.value.at(-1)! + sizeFor(last.key) : 0
})
function indexAt(offset: number) {
  let low = 0
  let high = starts.value.length - 1
  while (low <= high) {
    const middle = (low + high) >> 1
    const start = starts.value[middle]!
    const end = start + sizeFor(entries.value[middle]!.key)
    if (offset < start) high = middle - 1
    else if (offset >= end) low = middle + 1
    else return middle
  }
  return Math.min(starts.value.length - 1, Math.max(0, low))
}
const visibleRange = computed(() => {
  if (!entries.value.length) return { start: 0, end: -1 }
  const extent = viewportExtent.value || estimate.value * (props.overscan + 2)
  return {
    start: indexAt(scrollOffset.value),
    end: indexAt(scrollOffset.value + Math.max(0, extent - 1)),
  }
})
const renderedEntries = computed(() => {
  const { start, end } = visibleRange.value
  if (end < start) return []
  const first = Math.max(0, start - Math.max(0, props.overscan))
  const last = Math.min(entries.value.length - 1, end + Math.max(0, props.overscan))
  const selected = entries.value.slice(first, last + 1)
  if (focusedKey.value !== undefined) {
    const pinned = entries.value.find((entry) => entry.key === focusedKey.value)
    if (pinned && !selected.some((entry) => entry.key === pinned.key)) selected.push(pinned)
  }
  return selected.sort((left, right) => left.index - right.index)
})
const axisStart = computed(() =>
  props.orientation === 'vertical' ? 'insetBlockStart' : 'insetInlineStart',
)
function isRtl() {
  return (
    props.orientation === 'horizontal' &&
    (props.dir === 'rtl' ||
      (props.dir === undefined &&
        viewport.value !== null &&
        typeof window !== 'undefined' &&
        getComputedStyle(viewport.value).direction === 'rtl'))
  )
}

function setRowRef(key: Key, element: Element | null) {
  const previous = rowElements.get(key)
  if (previous && previous !== element) observer?.unobserve(previous)
  if (!element) {
    rowElements.delete(key)
    return
  }
  const row = element as HTMLElement
  rowElements.set(key, row)
  observer?.observe(row)
}
function measureRows() {
  for (const [key, element] of rowElements) {
    if (typeof element.getBoundingClientRect !== 'function') continue
    const bounds = element.getBoundingClientRect()
    const size = props.orientation === 'vertical' ? bounds.height : bounds.width
    if (size > 0 && rowSizes.value.get(key) !== size) {
      const next = new Map(rowSizes.value)
      next.set(key, size)
      rowSizes.value = next
    }
  }
}
function updateRange() {
  const next = visibleRange.value
  if (next.start === rangeState.value.start && next.end === rangeState.value.end) return
  rangeState.value = next
  if (next.end >= next.start) emit('rangeChange', { start: next.start, end: next.end })
}
function onScroll(event: Event) {
  emit('scroll', event)
  const target = event.currentTarget as HTMLElement
  scrollOffset.value =
    props.orientation === 'vertical'
      ? target.scrollTop
      : isRtl()
        ? -target.scrollLeft
        : target.scrollLeft
  viewportExtent.value = props.orientation === 'vertical' ? target.clientHeight : target.clientWidth
  updateRange()
  const atEnd = scrollOffset.value + viewportExtent.value >= totalExtent.value - 32
  if (!atEnd) {
    lastEndNotification = false
    return
  }
  if (lastEndNotification) return
  lastEndNotification = true
  emit('endReached', { lastKey: entries.value.at(-1)?.key })
}
function onKeydown(event: KeyboardEvent) {
  if (
    typeof Element !== 'undefined' &&
    event.target instanceof Element &&
    event.target.closest('input, textarea, select, [contenteditable="true"]')
  )
    return
  if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key))
    return
  const row = (event.target as Element | null)?.closest<HTMLElement>('[data-aven-virtual-index]')
  const current = Number(row?.dataset.avenVirtualIndex ?? visibleRange.value.start)
  const rtl = isRtl()
  const forwardKey =
    props.orientation === 'vertical' ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight'
  const backwardKey =
    props.orientation === 'vertical' ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft'
  const direction = event.key === forwardKey ? 1 : event.key === backwardKey ? -1 : 0
  const index =
    event.key === 'Home' ? 0 : event.key === 'End' ? entries.value.length - 1 : current + direction
  if (direction === 0 && event.key !== 'Home' && event.key !== 'End') return
  if (index < 0 || index >= entries.value.length) return
  event.preventDefault()
  scrollToIndex(index)
}
function onFocusIn(event: FocusEvent) {
  const row = (event.target as Element | null)?.closest<HTMLElement>('[data-aven-virtual-index]')
  const index = Number(row?.dataset.avenVirtualIndex)
  if (Number.isInteger(index) && entries.value[index]) focusedKey.value = entries.value[index]!.key
}
function onFocusOut(event: FocusEvent) {
  if (event.relatedTarget instanceof Node && viewport.value?.contains(event.relatedTarget)) return
  focusedKey.value = undefined
}
function scrollToIndex(index: number, options?: ScrollToOptions) {
  if (!Number.isInteger(index) || index < 0 || index >= entries.value.length) return false
  const offset = starts.value[index] ?? index * estimate.value
  if (props.orientation === 'vertical') viewport.value?.scrollTo({ top: offset, ...options })
  else viewport.value?.scrollTo({ left: isRtl() ? -offset : offset, ...options })
  scrollOffset.value = offset
  viewportExtent.value =
    props.orientation === 'vertical'
      ? (viewport.value?.clientHeight ?? viewportExtent.value)
      : (viewport.value?.clientWidth ?? viewportExtent.value)
  updateRange()
  void nextTick(() => {
    const row = viewport.value?.querySelector<HTMLElement>(`[data-aven-virtual-index="${index}"]`)
    const focusable = row?.querySelector<HTMLElement>(
      'button:not(:disabled), a[href], input:not(:disabled), [tabindex]:not([tabindex="-1"])',
    )
    ;(focusable ?? row)?.focus()
  })
  return true
}
function scrollToKey(key: Key, options?: ScrollToOptions) {
  return scrollToIndex(
    entries.value.findIndex((entry) => entry.key === key),
    options,
  )
}
function focus() {
  viewport.value?.focus()
}
defineExpose({ scrollToIndex, scrollToKey, focus })

watch(renderedEntries, () => void nextTick(measureRows), { flush: 'post' })
watch(visibleRange, updateRange)
watch(entries, (nextEntries) => {
  const keys = new Set(nextEntries.map((entry) => entry.key))
  rowSizes.value = new Map([...rowSizes.value].filter(([key]) => keys.has(key)))
  if (focusedKey.value !== undefined && !keys.has(focusedKey.value)) focusedKey.value = undefined
  lastEndNotification = false
})
onMounted(() => {
  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(measureRows)
    for (const element of rowElements.values()) observer.observe(element)
  }
  if (viewport.value) {
    viewportExtent.value =
      props.orientation === 'vertical' ? viewport.value.clientHeight : viewport.value.clientWidth
    updateRange()
  }
})
onBeforeUnmount(() => {
  observer?.disconnect()
  rowElements.clear()
})
</script>

<template>
  <div
    ref="viewport"
    v-bind="{ ...attrs, ...props.ui?.root?.attrs }"
    :role="props.label ? 'region' : undefined"
    :aria-label="props.label"
    :dir="props.dir"
    :aria-busy="props.loading ? 'true' : undefined"
    :class="[
      'aven-virtual-list',
      `is-${props.orientation}`,
      { 'is-unstyled': props.unstyled },
      attrs.class,
      props.ui?.root?.class,
    ]"
    :style="[attrs.style, props.ui?.root?.style]"
    tabindex="0"
    @scroll="onScroll"
    @keydown="onKeydown"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <slot v-if="props.loading" name="loading"><div role="status">Loading…</div></slot>
    <slot v-else-if="entries.length === 0" name="empty"><div>No items.</div></slot>
    <ul
      v-else
      :class="['virtual-list-track', props.ui?.list?.class]"
      :style="[
        props.ui?.list?.style,
        props.orientation === 'vertical'
          ? { blockSize: `${totalExtent}px` }
          : { inlineSize: `${totalExtent}px` },
      ]"
      role="list"
    >
      <li
        v-for="entry in renderedEntries"
        :key="entry.key"
        :ref="(element) => setRowRef(entry.key, element as Element | null)"
        :data-aven-virtual-index="entry.index"
        :aria-posinset="entry.index + 1"
        :aria-setsize="entries.length"
        role="listitem"
        tabindex="-1"
        :class="['virtual-list-item', props.ui?.item?.class]"
        :style="[
          props.ui?.item?.style,
          { [axisStart]: `${starts[entry.index] ?? 0}px` },
          props.orientation === 'vertical'
            ? { minBlockSize: `${estimate}px` }
            : { minInlineSize: `${estimate}px` },
        ]"
      >
        <slot name="item" :item="entry.item" :key="entry.key" :index="entry.index" />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.aven-virtual-list {
  position: relative;
  box-sizing: border-box;
  min-inline-size: 0;
  min-block-size: 0;
  overflow: auto;
  color: var(--aven-color-text-primary);
}
.aven-virtual-list:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 2px;
}
.virtual-list-track {
  position: relative;
  min-inline-size: 100%;
  min-block-size: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}
.is-horizontal .virtual-list-track {
  display: flex;
  min-inline-size: 0;
  block-size: 100%;
}
.virtual-list-item {
  position: absolute;
  inset-inline: 0;
  inset-block-start: 0;
  box-sizing: border-box;
  min-inline-size: 0;
  overflow-wrap: anywhere;
}
.is-horizontal .virtual-list-item {
  inset-block: 0;
  inset-inline-end: auto;
  inline-size: max-content;
}
.is-unstyled {
  color: inherit;
}
@media (forced-colors: active) {
  .aven-virtual-list:focus-visible {
    outline-color: Highlight;
  }
}
@media print {
  .aven-virtual-list {
    max-block-size: none;
    overflow: visible;
  }
  .virtual-list-track {
    block-size: auto !important;
    inline-size: auto !important;
  }
  .virtual-list-item {
    position: static;
    transform: none !important;
    break-inside: avoid;
  }
}
</style>
