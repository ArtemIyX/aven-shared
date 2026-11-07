<script
  setup
  lang="ts"
  generic="
    Item,
    ItemKey extends string | number = string,
    ColumnKey extends string | number = string
  "
>
import { computed, ref, useAttrs } from 'vue'
import { useAvenId } from './composables.js'
import type { AvenBoardColumnEvents, AvenBoardColumnProps, AvenBoardColumnSlots } from './types.js'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenBoardColumnProps<Item, ItemKey, ColumnKey>>(), {
  disabled: false,
  draggable: false,
  unstyled: false,
})
const emit = defineEmits<AvenBoardColumnEvents<ItemKey, ColumnKey>>()
defineSlots<AvenBoardColumnSlots<Item, ItemKey, ColumnKey>>()
const attrs = useAttrs()
const root = ref<HTMLElement>()
const titleId = useAvenId(undefined, 'board-column')
const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return { ...rest, ...props.ui?.root?.attrs }
})
function start(
  entry: AvenBoardColumnProps<Item, ItemKey, ColumnKey>['entries'][number],
  originalEvent: DragEvent,
) {
  if (props.disabled || !props.draggable || entry.loading) {
    originalEvent.preventDefault()
    return
  }
  if (originalEvent.dataTransfer) originalEvent.dataTransfer.effectAllowed = 'move'
  emit('dragStart', {
    key: entry.key,
    index: entry.index,
    columnKey: props.column.key,
    originalEvent,
  })
}
function drop(index: number, originalEvent: DragEvent) {
  if (props.disabled || !props.draggable) return
  originalEvent.preventDefault()
  emit('drop', { index, columnKey: props.column.key, originalEvent })
}
function end(entry: AvenBoardColumnProps<Item, ItemKey, ColumnKey>['entries'][number]) {
  emit('dragEnd', { key: entry.key, index: entry.index, columnKey: props.column.key })
}
function allowDrop(event: DragEvent) {
  if (props.draggable && !props.disabled) event.preventDefault()
}
function add() {
  if (!props.disabled) emit('add', { columnKey: props.column.key })
}
</script>
<template>
  <section
    ref="root"
    v-bind="rootAttrs"
    :id="id"
    :class="['aven-board-column', attrs.class, { 'is-unstyled': unstyled }, ui?.root?.class]"
    :style="[attrs.style, ui?.root?.style]"
    :aria-labelledby="titleId"
  >
    <header
      :class="['column-header', ui?.header?.class]"
      :style="ui?.header?.style"
      v-bind="ui?.header?.attrs"
    >
      <slot name="header" :column="column" :count="entries.length" :title-id="titleId">
        <h2
          :id="titleId"
          :class="ui?.title?.class"
          :style="ui?.title?.style"
          v-bind="ui?.title?.attrs"
        >
          {{ column.label }}
        </h2>
        <span
          :class="['column-count', ui?.count?.class]"
          :style="ui?.count?.style"
          v-bind="ui?.count?.attrs"
          >{{ entries.length }}</span
        >
      </slot>
    </header>
    <ol
      :class="['column-list', ui?.list?.class]"
      :style="ui?.list?.style"
      v-bind="ui?.list?.attrs"
      :aria-label="`${column.label} items`"
      @dragover="allowDrop"
      @drop="drop(entries.length, $event)"
    >
      <li
        v-for="entry in entries"
        :key="entry.key"
        :class="['board-card', ui?.card?.class]"
        :style="ui?.card?.style"
        v-bind="ui?.card?.attrs"
        :draggable="draggable && !disabled && !entry.loading"
        :aria-busy="entry.loading || undefined"
        @dragstart.stop="start(entry, $event)"
        @dragend="end(entry)"
        @dragover="allowDrop"
        @drop.stop="drop(entry.index, $event)"
      >
        <slot :entry="entry" :column="column">
          <span>{{ String(entry.key) }}</span>
        </slot>
      </li>
      <li
        v-if="entries.length === 0"
        :class="['column-empty', ui?.empty?.class]"
        :style="ui?.empty?.style"
        v-bind="ui?.empty?.attrs"
      >
        <slot name="empty" :column="column">Drop an item here</slot>
      </li>
    </ol>
    <footer
      :class="['column-footer', ui?.footer?.class]"
      :style="ui?.footer?.style"
      v-bind="ui?.footer?.attrs"
    >
      <slot name="footer" :column="column" :add="add">
        <button type="button" :disabled="disabled" @click="add">Add item</button>
      </slot>
    </footer>
  </section>
</template>
<style scoped>
.aven-board-column {
  display: flex;
  flex: 0 0 var(--aven-board-column-width, min(20rem, 84vw));
  flex-direction: column;
  gap: var(--aven-space-3);
  min-inline-size: var(--aven-board-column-min-width, min(16rem, 78vw));
  max-block-size: min(80vh, 52rem);
  padding: var(--aven-space-3);
  border: 1px solid var(--aven-board-column-border, var(--aven-color-border-subtle));
  border-radius: var(--aven-radius-md);
  background: var(--aven-board-column-bg, var(--aven-color-surface-subtle));
}
.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--aven-space-2);
  min-inline-size: 0;
}
.column-header h2 {
  min-inline-size: 0;
  margin: 0;
  overflow-wrap: anywhere;
  font-size: var(--aven-font-size-md);
}
.column-count {
  flex: none;
  color: var(--aven-color-text-secondary);
  font-size: var(--aven-font-size-sm);
}
.column-list {
  display: grid;
  align-content: start;
  gap: var(--aven-board-gap, var(--aven-space-2));
  min-block-size: 4rem;
  min-inline-size: 0;
  overflow: auto;
  margin: 0;
  padding: 0;
  list-style: none;
}
.board-card,
.column-empty {
  min-inline-size: 0;
  padding: var(--aven-space-3);
  border: 1px solid var(--aven-board-card-border, var(--aven-color-border-subtle));
  border-radius: var(--aven-radius-sm);
  background: var(--aven-board-card-bg, var(--aven-color-surface-card));
  overflow-wrap: anywhere;
}
.board-card[draggable='true'] {
  cursor: grab;
}
.board-card[draggable='true']:active {
  cursor: grabbing;
}
.column-empty {
  min-block-size: 4rem;
  border-style: dashed;
  color: var(--aven-color-text-secondary);
}
.column-footer button {
  min-block-size: 2.75rem;
  padding-inline: var(--aven-space-3);
  border: 1px solid var(--aven-color-border-subtle);
  border-radius: var(--aven-radius-sm);
  background: var(--aven-color-surface-card);
  color: inherit;
  font: inherit;
}
.column-footer button:focus-visible,
.column-footer button:enabled:hover {
  outline: 2px solid var(--aven-board-focus, var(--aven-color-focus-ring));
  outline-offset: 2px;
}
.column-footer button:disabled {
  color: var(--aven-color-text-disabled);
}
.is-unstyled {
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
}
.is-unstyled .board-card,
.is-unstyled .column-empty,
.is-unstyled .column-footer button {
  border: 0;
  border-radius: 0;
  background: transparent;
}
@media (forced-colors: active) {
  .aven-board-column,
  .board-card,
  .column-empty,
  .column-footer button {
    border-color: CanvasText;
  }
}
@media print {
  .aven-board-column {
    max-block-size: none;
    overflow: visible;
    background: Canvas;
  }
  .column-list {
    overflow: visible;
  }
}
</style>
