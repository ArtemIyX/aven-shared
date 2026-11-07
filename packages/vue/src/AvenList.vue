<script setup lang="ts" generic="T, Key extends string | number = string | number">
import { computed, ref, shallowRef, useAttrs } from 'vue'
import AvenListItem from './AvenListItem.vue'
import type { AvenListEvents, AvenListProps, AvenListSlots } from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenListProps<T, Key>>(), {
  loading: false,
  error: false,
  selectable: false,
  orientation: 'vertical',
  divided: false,
  dense: false,
  endThreshold: 32,
  unstyled: false,
})
const emit = defineEmits<AvenListEvents<T, Key>>()
defineSlots<AvenListSlots<T, Key>>()
const attrs = useAttrs()
const root = ref<HTMLElement | null>(null)
const localSelected = shallowRef<Key[]>([...(props.defaultSelectedKeys ?? [])])
const selectedKeys = computed(() => props.selectedKeys ?? localSelected.value)
const endNotified = ref(false)
const entries = computed(() =>
  props.items.map((item, index) => ({ item, index, key: props.itemKey(item, index) })),
)

function isDisabled(item: T, index: number) {
  return (
    props.itemDisabled?.(item, index) ??
    (typeof item === 'object' && item !== null && 'disabled' in item && Boolean(item.disabled))
  )
}
function isSelected(key: Key) {
  return selectedKeys.value.includes(key)
}
function scopeFor(item: T, key: Key, index: number) {
  return { item, key, index, selected: isSelected(key) }
}
function labelFor(item: T, index: number, key: Key) {
  if (props.getLabel) return props.getLabel(item, index)
  if (typeof item === 'object' && item !== null && 'label' in item) return String(item.label)
  return String(key)
}
function selectItem(item: T, key: Key, index: number, originalEvent: MouseEvent) {
  if (!props.selectable || isDisabled(item, index)) return
  const next = selectedKeys.value.includes(key)
    ? selectedKeys.value.filter((candidate) => candidate !== key)
    : [...selectedKeys.value, key]
  if (props.selectedKeys === undefined) localSelected.value = next
  emit('update:selectedKeys', next)
  emit('select', { key, item, originalEvent })
}
function onItemKeydown(event: KeyboardEvent) {
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
  const buttons = [
    ...(root.value?.querySelectorAll<HTMLButtonElement>('[data-aven-list-action]') ?? []),
  ]
  const currentIndex = buttons.indexOf(event.currentTarget as HTMLButtonElement)
  if (currentIndex < 0 || buttons.length === 0) return
  const direction = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0
  let nextIndex =
    event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : currentIndex + direction
  if (event.key === 'Home') {
    while (nextIndex < buttons.length && buttons[nextIndex]?.disabled) nextIndex += 1
  } else if (event.key === 'End') {
    while (nextIndex >= 0 && buttons[nextIndex]?.disabled) nextIndex -= 1
  } else {
    while (nextIndex >= 0 && nextIndex < buttons.length && buttons[nextIndex]?.disabled)
      nextIndex += direction
  }
  if (nextIndex < 0 || nextIndex >= buttons.length) return
  event.preventDefault()
  buttons[nextIndex]?.focus()
}
function onScroll(event: Event) {
  emit('scroll', event)
  const target = event.currentTarget as HTMLElement
  const atEnd =
    props.orientation === 'horizontal'
      ? target.scrollLeft + target.clientWidth >= target.scrollWidth - props.endThreshold
      : target.scrollTop + target.clientHeight >= target.scrollHeight - props.endThreshold
  if (!atEnd) {
    endNotified.value = false
    return
  }
  if (endNotified.value) return
  endNotified.value = true
  emit('endReached', { lastKey: entries.value.at(-1)?.key })
}
function scrollToKey(key: Key, options?: ScrollIntoViewOptions) {
  const index = entries.value.findIndex((entry) => entry.key === key)
  const target =
    index < 0
      ? undefined
      : root.value?.querySelector<HTMLElement>(`[data-aven-list-index="${index}"]`)
  target?.scrollIntoView(options ?? { block: 'nearest', inline: 'nearest' })
  return Boolean(target)
}
function focus() {
  root.value?.focus()
}
defineExpose({ scrollToKey, focus })
</script>

<template>
  <div
    ref="root"
    v-bind="{ ...attrs, ...props.ui?.root?.attrs }"
    :role="props.label ? 'region' : undefined"
    :aria-label="props.label"
    :aria-busy="props.loading ? 'true' : undefined"
    :class="[
      'aven-list',
      `is-${props.orientation}`,
      { 'is-selectable': props.selectable, 'is-dense': props.dense, 'is-unstyled': props.unstyled },
      attrs.class,
      props.ui?.root?.class,
    ]"
    :style="[attrs.style, props.ui?.root?.style]"
    :tabindex="props.selectable ? undefined : 0"
    @scroll="onScroll"
  >
    <slot name="header" />
    <slot v-if="props.loading" name="loading"
      ><div class="list-state" role="status">Loading…</div></slot
    >
    <slot v-else-if="props.error" name="error"
      ><div class="list-state" role="alert">Unable to load items.</div></slot
    >
    <slot v-else-if="entries.length === 0" name="empty"
      ><div class="list-state">No items.</div></slot
    >
    <ul
      v-bind="props.ui?.list?.attrs"
      v-else
      :class="['list-content', props.ui?.list?.class]"
      :style="props.ui?.list?.style"
    >
      <AvenListItem
        v-bind="props.ui?.item?.attrs"
        v-for="entry in entries"
        :key="entry.key"
        :data-aven-list-key="String(entry.key)"
        :data-aven-list-index="entry.index"
        :selected="isSelected(entry.key)"
        :disabled="isDisabled(entry.item, entry.index)"
        :dense="props.dense"
        :divided="props.divided"
        :unstyled="props.unstyled"
        :class="props.ui?.item?.class"
        :style="props.ui?.item?.style"
      >
        <template v-if="props.selectable">
          <button
            type="button"
            data-aven-list-action
            class="list-action"
            :aria-pressed="isSelected(entry.key)"
            :disabled="isDisabled(entry.item, entry.index)"
            @click="selectItem(entry.item, entry.key, entry.index, $event)"
            @keydown="onItemKeydown"
          >
            <span
              v-bind="props.ui?.leading?.attrs"
              v-if="$slots.leading"
              :class="['list-leading', props.ui?.leading?.class]"
              :style="props.ui?.leading?.style"
            >
              <slot name="leading" v-bind="scopeFor(entry.item, entry.key, entry.index)" />
            </span>
            <span
              v-bind="props.ui?.content?.attrs"
              :class="['list-item-content', props.ui?.content?.class]"
              :style="props.ui?.content?.style"
            >
              <slot name="item" v-bind="scopeFor(entry.item, entry.key, entry.index)">{{
                labelFor(entry.item, entry.index, entry.key)
              }}</slot>
            </span>
          </button>
        </template>
        <template v-else>
          <span
            v-bind="props.ui?.leading?.attrs"
            v-if="$slots.leading"
            :class="['list-leading', props.ui?.leading?.class]"
            :style="props.ui?.leading?.style"
          >
            <slot name="leading" v-bind="scopeFor(entry.item, entry.key, entry.index)" />
          </span>
          <span
            v-bind="props.ui?.content?.attrs"
            :class="['list-item-content', props.ui?.content?.class]"
            :style="props.ui?.content?.style"
          >
            <slot name="item" v-bind="scopeFor(entry.item, entry.key, entry.index)">{{
              labelFor(entry.item, entry.index, entry.key)
            }}</slot>
          </span>
          <span
            v-bind="props.ui?.trailing?.attrs"
            v-if="$slots.trailing"
            :class="['list-trailing', props.ui?.trailing?.class]"
            :style="props.ui?.trailing?.style"
          >
            <slot name="trailing" v-bind="scopeFor(entry.item, entry.key, entry.index)" />
          </span>
        </template>
        <template #trailing>
          <span
            v-bind="props.ui?.trailing?.attrs"
            v-if="props.selectable && $slots.trailing"
            :class="['list-trailing', props.ui?.trailing?.class]"
            :style="props.ui?.trailing?.style"
          >
            <slot name="trailing" v-bind="scopeFor(entry.item, entry.key, entry.index)" />
          </span>
        </template>
        <template #separator>
          <span v-if="$slots.separator">
            <slot name="separator" v-bind="scopeFor(entry.item, entry.key, entry.index)" />
          </span>
        </template>
      </AvenListItem>
    </ul>
    <slot name="footer" />
  </div>
</template>

<style scoped>
.aven-list {
  --aven-list-row: var(--aven-color-surface-base);
  --aven-list-hover: var(--aven-color-surface-hover);
  box-sizing: border-box;
  min-inline-size: 0;
  max-block-size: 100%;
  overflow: auto;
  color: var(--aven-color-text-primary);
}
.aven-list:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 2px;
}
.list-content {
  margin: 0;
  padding: 0;
  list-style: none;
}
.is-horizontal .list-content {
  display: flex;
  flex-direction: row;
  min-inline-size: max-content;
}
.is-horizontal :deep(.aven-list-item) {
  border-inline-end: 1px solid var(--aven-color-separator-column);
  border-block-end: 0;
}
.list-action {
  display: flex;
  align-items: center;
  gap: var(--aven-space-3);
  inline-size: 100%;
  min-block-size: inherit;
  padding: 0;
  border: 0;
  background: var(--aven-list-row);
  color: inherit;
  text-align: start;
  font: inherit;
  cursor: pointer;
}
.list-action:not(:disabled):hover {
  background: var(--aven-list-hover);
}
.list-action:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: -2px;
}
.list-action:disabled {
  cursor: not-allowed;
}
.list-leading,
.list-trailing {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
}
.list-item-content {
  flex: 1 1 auto;
  min-inline-size: 0;
  overflow-wrap: anywhere;
}
.list-state {
  padding: var(--aven-space-4);
  color: var(--aven-color-text-secondary);
}
.is-unstyled {
  --aven-list-row: transparent;
  --aven-list-hover: transparent;
}
@media (forced-colors: active) {
  .aven-list:focus-visible,
  .list-action:focus-visible {
    outline-color: Highlight;
  }
}
@media print {
  .aven-list {
    max-block-size: none;
    overflow: visible;
    color: #000;
  }
}
</style>
