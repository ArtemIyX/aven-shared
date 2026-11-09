<script
  setup
  lang="ts"
  generic="
    Item,
    ItemKey extends string | number = string,
    ColumnKey extends string | number = string
  "
>
import { computed, nextTick, ref, useAttrs } from 'vue'
import AvenBoardColumn from './AvenBoardColumn.vue'
import type {
  AvenBoardColumnData as AvenBoardColumnModel,
  AvenBoardEntry,
  AvenBoardEvents,
  AvenBoardMoveRequest,
  AvenBoardProps,
  AvenBoardSlots,
} from './types.js'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenBoardProps<Item, ItemKey, ColumnKey>>(), {
  disabled: false,
  draggable: false,
  loadingKeys: () => [],
  label: 'Board',
  addLabel: 'Add item',
  moveLabel: 'Move item',
  unstyled: false,
})
const emit = defineEmits<AvenBoardEvents<Item, ItemKey, ColumnKey>>()
defineSlots<AvenBoardSlots<Item, ItemKey, ColumnKey>>()
const attrs = useAttrs()
const root = ref<HTMLElement>()
const movingKey = ref<ItemKey>()
const moveTarget = ref<ColumnKey>()
const dragOrigin = ref<{ key: ItemKey; fromColumn: ColumnKey; fromIndex: number }>()
const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return { ...rest, ...props.ui?.root?.attrs }
})
const disabled = computed(() => props.disabled)
function itemFor(key: ItemKey): Item | undefined {
  if (props.itemsByKey instanceof Map) return props.itemsByKey.get(key)
  return (props.itemsByKey as Partial<Record<ItemKey, Item>>)[key]
}
function entriesFor(column: AvenBoardColumnModel<ColumnKey, ItemKey>) {
  const entries: AvenBoardEntry<Item, ItemKey, ColumnKey>[] = []
  for (const [index, key] of column.itemKeys.entries()) {
    const item = itemFor(key)
    if (item === undefined) continue
    entries.push({
      key,
      item,
      index,
      column,
      loading: props.loadingKeys.some((loadingKey) => Object.is(loadingKey, key)),
    })
  }
  return entries
}
function boardEntryFor(
  entry: { key: ItemKey; item: Item; index: number; loading: boolean },
  column: AvenBoardColumnModel<ColumnKey, ItemKey>,
): AvenBoardEntry<Item, ItemKey, ColumnKey> {
  return { ...entry, column }
}
function itemLabel(item: Item, key: ItemKey): string {
  if (typeof item === 'string' || typeof item === 'number') return String(item)
  if (typeof item === 'object' && item !== null) {
    const record = item as Record<string, unknown>
    if (typeof record.label === 'string') return record.label
    if (typeof record.title === 'string') return record.title
    if (typeof record.name === 'string') return record.name
  }
  return String(key)
}
function select(entry: AvenBoardEntry<Item, ItemKey, ColumnKey>) {
  if (!disabled.value && !entry.loading) emit('select', { key: entry.key, item: entry.item })
}
function canMoveTo(request: Omit<AvenBoardMoveRequest<ItemKey, ColumnKey>, 'originalEvent'>) {
  return !disabled.value && props.canMove?.(request) !== false
}
function hasMoveTargets(entry: AvenBoardEntry<Item, ItemKey, ColumnKey>) {
  return props.columns.some((column) => {
    if (Object.is(column.key, entry.column.key)) return false
    return canMoveTo({
      itemKey: entry.key,
      fromColumn: entry.column.key,
      toColumn: column.key,
      fromIndex: entry.index,
      toIndex: column.itemKeys.length,
    })
  })
}
function selectMoveTarget(event: Event) {
  const index = Number((event.target as HTMLSelectElement).value)
  moveTarget.value = Number.isInteger(index) ? props.columns[index]?.key : undefined
}
function startMoving(entry: AvenBoardEntry<Item, ItemKey, ColumnKey>) {
  if (disabled.value || entry.loading) return
  movingKey.value = Object.is(movingKey.value, entry.key) ? undefined : entry.key
  const firstTarget = props.columns.find((column) => {
    if (Object.is(column.key, entry.column.key)) return false
    return canMoveTo({
      itemKey: entry.key,
      fromColumn: entry.column.key,
      toColumn: column.key,
      fromIndex: entry.index,
      toIndex: column.itemKeys.length,
    })
  })
  moveTarget.value = firstTarget?.key
}
function commitKeyboardMove(entry: AvenBoardEntry<Item, ItemKey, ColumnKey>, originalEvent: Event) {
  const column = props.columns.find((candidate) => Object.is(candidate.key, moveTarget.value))
  if (!column || Object.is(column.key, entry.column.key)) return
  const request = {
    itemKey: entry.key,
    fromColumn: entry.column.key,
    toColumn: column.key,
    fromIndex: entry.index,
    toIndex: column.itemKeys.length,
  }
  if (!canMoveTo(request)) return
  emit('moveRequest', { ...request, originalEvent })
  movingKey.value = undefined
  nextTick(() => {
    const button = Array.from(
      root.value?.querySelectorAll<HTMLButtonElement>('[data-move-key]') ?? [],
    ).find((candidate) => candidate.getAttribute('data-move-key') === String(entry.key))
    button?.focus()
  })
}
function onDragStart(payload: {
  key: ItemKey
  index: number
  columnKey: ColumnKey
  originalEvent: DragEvent
}) {
  if (disabled.value) return
  dragOrigin.value = { key: payload.key, fromColumn: payload.columnKey, fromIndex: payload.index }
  const preview = Array.from(
    root.value?.querySelectorAll<HTMLElement>('[data-board-preview]') ?? [],
  ).find((candidate) => candidate.getAttribute('data-board-preview') === String(payload.key))
  if (preview && payload.originalEvent.dataTransfer)
    payload.originalEvent.dataTransfer.setDragImage(preview, 0, 0)
}
function onDragEnd() {
  dragOrigin.value = undefined
}
function onDrop(payload: { index: number; columnKey: ColumnKey; originalEvent: DragEvent }) {
  const origin = dragOrigin.value
  dragOrigin.value = undefined
  if (!origin || disabled.value) return
  const destinationColumn = props.columns.find((column) => Object.is(column.key, payload.columnKey))
  if (!destinationColumn) return
  let toIndex = Math.max(0, Math.min(payload.index, destinationColumn.itemKeys.length))
  if (Object.is(origin.fromColumn, payload.columnKey)) {
    if (toIndex > origin.fromIndex) toIndex -= 1
    if (toIndex === origin.fromIndex) return
  }
  const request = {
    itemKey: origin.key,
    fromColumn: origin.fromColumn,
    toColumn: payload.columnKey,
    fromIndex: origin.fromIndex,
    toIndex,
  }
  if (!canMoveTo(request)) return
  emit('moveRequest', { ...request, originalEvent: payload.originalEvent })
}
function add(columnKey: ColumnKey) {
  if (!disabled.value) emit('add', { columnKey })
}
</script>
<template>
  <section
    v-bind="{ ...ui?.root?.attrs, ...rootAttrs }"
    ref="root"
    :id="id"
    :class="['aven-board', attrs.class, { 'is-unstyled': unstyled }, ui?.root?.class]"
    :style="[attrs.style, ui?.root?.style]"
    role="region"
    :aria-label="label"
  >
    <div class="board-scroll">
      <AvenBoardColumn
        v-for="column in columns"
        :key="column.key"
        :column="column"
        :entries="entriesFor(column)"
        :disabled="disabled"
        :draggable="draggable"
        :unstyled="unstyled"
        :ui="{ root: ui?.column, card: ui?.card }"
        @drag-start="onDragStart"
        @drag-end="onDragEnd"
        @drop="onDrop"
        @add="add($event.columnKey)"
      >
        <template #header="scope">
          <slot name="column-header" v-bind="scope">
            <h2 :id="scope.titleId">{{ scope.column.label }}</h2>
            <span class="column-count">{{ scope.count }}</span>
          </slot>
        </template>
        <template #default="{ entry, column: currentColumn }">
          <slot
            name="card"
            v-bind="boardEntryFor(entry, currentColumn)"
            :select="() => select(boardEntryFor(entry, currentColumn))"
            :moving="Object.is(movingKey, entry.key)"
          >
            <div
              class="board-card-content"
              :class="ui?.card?.class"
              :style="ui?.card?.style"
              v-bind="ui?.card?.attrs"
            >
              <button
                type="button"
                class="card-select"
                :disabled="disabled || entry.loading"
                @click.stop="select(boardEntryFor(entry, currentColumn))"
              >
                {{ itemLabel(entry.item, entry.key) }}
              </button>
            </div>
          </slot>
          <span class="drag-preview" :data-board-preview="String(entry.key)" aria-hidden="true">
            <slot name="drag-preview" :item="entry.item" :key="entry.key">{{
              itemLabel(entry.item, entry.key)
            }}</slot>
          </span>
          <div
            class="board-actions"
            :class="ui?.actions?.class"
            :style="ui?.actions?.style"
            v-bind="ui?.actions?.attrs"
          >
            <button
              type="button"
              :data-move-key="String(entry.key)"
              :class="ui?.move?.class"
              :style="ui?.move?.style"
              v-bind="ui?.move?.attrs"
              :disabled="
                disabled || entry.loading || !hasMoveTargets(boardEntryFor(entry, currentColumn))
              "
              :aria-expanded="Object.is(movingKey, entry.key)"
              @click.stop="startMoving(boardEntryFor(entry, currentColumn))"
            >
              {{ moveLabel }}
            </button>
            <div v-if="Object.is(movingKey, entry.key)" class="board-move-panel">
              <label>
                <span class="visually-hidden"
                  >Move {{ itemLabel(entry.item, entry.key) }} to column</span
                >
                <select
                  :value="columns.findIndex((candidate) => Object.is(candidate.key, moveTarget))"
                  :disabled="disabled"
                  @change="selectMoveTarget"
                >
                  <template v-for="(candidate, index) in columns" :key="candidate.key">
                    <option
                      v-if="!Object.is(candidate.key, currentColumn.key)"
                      :value="index"
                      :disabled="
                        !canMoveTo({
                          itemKey: entry.key,
                          fromColumn: currentColumn.key,
                          toColumn: candidate.key,
                          fromIndex: entry.index,
                          toIndex: candidate.itemKeys.length,
                        })
                      "
                    >
                      {{ candidate.label }}
                    </option>
                  </template>
                </select>
              </label>
              <button
                type="button"
                class="board-move-commit"
                :disabled="disabled || moveTarget === undefined"
                @click.stop="commitKeyboardMove(boardEntryFor(entry, currentColumn), $event)"
              >
                Move here
              </button>
            </div>
          </div>
        </template>
        <template #empty="scope"
          ><slot name="empty-column" v-bind="scope">Drop an item here</slot></template
        >
        <template #footer="scope">
          <slot name="column-footer" v-bind="scope">
            <slot name="add-card" :column="scope.column" :add="scope.add" :disabled="disabled">
              <button class="board-add-item" type="button" :disabled="disabled" @click="scope.add">
                {{ addLabel }}
              </button>
            </slot>
          </slot>
        </template>
      </AvenBoardColumn>
    </div>
  </section>
</template>
<style scoped>
.aven-board {
  min-inline-size: 0;
  color: var(--aven-color-text-primary);
}
.board-scroll {
  display: flex;
  align-items: flex-start;
  gap: var(--aven-board-gap, var(--aven-space-3));
  min-inline-size: 0;
  overflow: auto;
  padding: var(--aven-space-1);
  overscroll-behavior-inline: contain;
}
.board-card-content {
  min-inline-size: 0;
}
.card-select {
  inline-size: 100%;
  min-block-size: 2.75rem;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: start;
  overflow-wrap: anywhere;
  cursor: pointer;
}
.card-select:focus-visible,
.board-actions button:focus-visible,
.board-move-panel select:focus-visible {
  outline: 0.125rem solid var(--aven-board-focus, var(--aven-color-focus-ring));
  outline-offset: 0.125rem;
}
.board-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--aven-space-2);
  margin-block-start: var(--aven-space-2);
}
.board-actions button,
.board-move-panel select {
  min-block-size: 2.75rem;
  max-inline-size: 100%;
  padding-inline: var(--aven-space-2);
  border: 0.0625rem solid var(--aven-color-border-subtle);
  border-radius: var(--aven-radius-sm);
  background: var(--aven-color-surface-card);
  color: inherit;
  font: inherit;
}
.board-move-panel {
  display: flex;
  flex-wrap: wrap;
  gap: var(--aven-space-2);
  inline-size: 100%;
}
.drag-preview {
  position: fixed;
  inset-inline-start: -100vw;
  inset-block-start: -100vh;
  max-inline-size: 18rem;
  padding: var(--aven-space-3);
  border: 0.0625rem solid var(--aven-color-border-subtle);
  border-radius: var(--aven-radius-sm);
  background: var(--aven-color-surface-card);
  color: var(--aven-color-text-primary);
  pointer-events: none;
}
.visually-hidden {
  position: absolute;
  inline-size: 0.0625rem;
  block-size: 0.0625rem;
  padding: 0;
  margin: -0.0625rem;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.is-unstyled .board-card-content {
  padding: 0;
}
.is-unstyled .board-actions button,
.is-unstyled .board-move-panel select {
  border: 0;
  border-radius: 0;
  background: transparent;
}
@media (prefers-reduced-motion: reduce) {
  .board-scroll {
    scroll-behavior: auto;
  }
}
@media (forced-colors: active) {
  .board-actions button,
  .board-move-panel select,
  .drag-preview {
    border-color: CanvasText;
  }
}
@media print {
  .board-scroll {
    overflow: visible;
    flex-wrap: wrap;
  }
  .board-actions,
  .drag-preview {
    display: none;
  }
}
</style>
