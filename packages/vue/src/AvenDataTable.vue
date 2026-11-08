<script
  setup
  lang="ts"
  generic="
    T,
    Key extends string | number = string | number,
    ColumnKey extends string | number = string | number
  "
>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  ref,
  shallowRef,
  useAttrs,
  useSlots,
} from 'vue'
import type { CSSProperties } from 'vue'
import AvenTable from './AvenTable.vue'
import type {
  AvenDataTableEvents,
  AvenDataTableProps,
  AvenDataTableSlots,
  AvenTableColumn,
  AvenTableSort,
} from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenDataTableProps<T, Key, ColumnKey>>(), {
  loading: false,
  error: false,
  label: 'Data table',
  stickyHeader: false,
  manualSort: false,
  selectable: false,
  expandable: false,
  rowClickable: false,
  resizable: false,
  reorderable: false,
  multiSort: false,
  density: 'comfortable',
  bordered: false,
  striped: false,
  unstyled: false,
})
const emit = defineEmits<AvenDataTableEvents<T, Key, ColumnKey>>()
defineSlots<AvenDataTableSlots<T, Key, ColumnKey>>()
const attrs = useAttrs()
const slots = useSlots()
const selectAllRef = ref<HTMLInputElement | null>(null)
const localSort = shallowRef<AvenTableSort<ColumnKey>[]>([...(props.defaultSort ?? [])])
const localSelected = shallowRef<Key[]>([...(props.defaultSelectedKeys ?? [])])
const localExpanded = shallowRef<Key[]>([...(props.defaultExpandedKeys ?? [])])
const localColumnOrder = shallowRef<ColumnKey[]>(props.columns.map((column) => column.key))
const localWidths = shallowRef(new Map<ColumnKey, number>())
const activeSort = computed(() => props.sort ?? localSort.value)
const selectedKeys = computed(() => props.selectedKeys ?? localSelected.value)
const expandedKeys = computed(() => props.expandedKeys ?? localExpanded.value)
const orderedColumns = computed(() => {
  const rank = new Map(localColumnOrder.value.map((key, index) => [key, index]))
  return [...props.columns].sort(
    (left, right) =>
      (rank.get(left.key) ?? Number.MAX_SAFE_INTEGER) -
      (rank.get(right.key) ?? Number.MAX_SAFE_INTEGER),
  )
})
const sortedRows = computed(() => {
  const rows = props.rows.map((row, index) => ({ row, index }))
  if (props.manualSort || activeSort.value.length === 0) return rows
  const sorters = activeSort.value
    .map((sort) => ({ sort, column: props.columns.find((column) => column.key === sort.key) }))
    .filter(
      (entry): entry is { sort: AvenTableSort<ColumnKey>; column: AvenTableColumn<T, ColumnKey> } =>
        Boolean(entry.column),
    )
  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })
  return rows.sort((left, right) => {
    for (const { sort, column } of sorters) {
      const first = column.accessor(left.row, left.index)
      const second = column.accessor(right.row, right.index)
      const order =
        typeof first === 'number' && typeof second === 'number'
          ? first - second
          : collator.compare(String(first ?? ''), String(second ?? ''))
      if (order !== 0) return sort.direction === 'asc' ? order : -order
    }
    return left.index - right.index
  })
})
const allRowKeys = computed(() =>
  sortedRows.value.map(({ row, index }) => props.rowKey(row, index)),
)
const selectedCount = computed(
  () => allRowKeys.value.filter((key) => selectedKeys.value.includes(key)).length,
)
const selectAllState = computed(() =>
  selectedCount.value === 0
    ? 'none'
    : selectedCount.value === allRowKeys.value.length
      ? 'all'
      : 'mixed',
)
const totalColumns = computed(
  () =>
    orderedColumns.value.length +
    (props.selectable ? 1 : 0) +
    (props.expandable ? 1 : 0) +
    (slots.rowLeading ? 1 : 0) +
    (slots.rowTrailing ? 1 : 0),
)
const sortedColumnKeys = computed(() => orderedColumns.value.map((column) => column.key))
const dragColumn = shallowRef<ColumnKey | undefined>()
const resizeDrag = shallowRef<{
  key: ColumnKey
  pointerId: number
  startX: number
  startWidth: number
  width: number
} | null>(null)

function rowKeyOf(row: T, index: number) {
  return props.rowKey(row, index)
}
function isSelected(key: Key) {
  return selectedKeys.value.includes(key)
}
function isExpanded(key: Key) {
  return expandedKeys.value.includes(key)
}
function sortFor(column: AvenTableColumn<T, ColumnKey>) {
  return activeSort.value.find((sort) => sort.key === column.key)
}
function valueFor(row: T, index: number, column: AvenTableColumn<T, ColumnKey>) {
  return column.accessor(row, index)
}
function displayValue(
  value: unknown,
  row: T,
  index: number,
  column: AvenTableColumn<T, ColumnKey>,
) {
  return column.format ? column.format(value, row, index) : value == null ? '' : String(value)
}
function setSort(column: AvenTableColumn<T, ColumnKey>, event: MouseEvent) {
  if (!column.sortable) return
  const current = sortFor(column)
  const nextDirection: AvenTableSort<ColumnKey>['direction'] =
    current?.direction === 'asc' ? 'desc' : 'asc'
  const next: AvenTableSort<ColumnKey>[] =
    props.multiSort && event.shiftKey
      ? [
          ...activeSort.value.filter((sort) => sort.key !== column.key),
          { key: column.key, direction: nextDirection } as AvenTableSort<ColumnKey>,
        ]
      : [{ key: column.key, direction: nextDirection }]
  if (props.sort === undefined) localSort.value = next
  emit('update:sort', next)
}
function updateSelected(next: Key[]) {
  if (props.selectedKeys === undefined) localSelected.value = next
  emit('update:selectedKeys', next)
}
function toggleRow(row: T, key: Key, index: number) {
  const next = isSelected(key)
    ? selectedKeys.value.filter((entry) => entry !== key)
    : [...selectedKeys.value, key]
  updateSelected(next)
}
function toggleAll() {
  updateSelected(
    selectAllState.value === 'all'
      ? selectedKeys.value.filter((key) => !allRowKeys.value.includes(key))
      : [...new Set([...selectedKeys.value, ...allRowKeys.value])],
  )
}
function toggleExpanded(key: Key) {
  const next = isExpanded(key)
    ? expandedKeys.value.filter((entry) => entry !== key)
    : [...expandedKeys.value, key]
  if (props.expandedKeys === undefined) localExpanded.value = next
  emit('update:expandedKeys', next)
}
function onRowClick(row: T, key: Key, event: MouseEvent) {
  if (
    !props.rowClickable ||
    (typeof Element !== 'undefined' &&
      event.target instanceof Element &&
      event.target.closest('button, a, input, select, textarea, [data-aven-row-action]'))
  )
    return
  emit('rowClick', { row, key, originalEvent: event })
}
function requestRowAction(row: T, key: Key, action: string, originalEvent: MouseEvent) {
  emit('rowAction', { row, key, action, originalEvent })
}
function widthFor(column: AvenTableColumn<T, ColumnKey>) {
  return localWidths.value.get(column.key) ?? column.width
}
function pinOffset(column: AvenTableColumn<T, ColumnKey>, side: 'start' | 'end') {
  const index = orderedColumns.value.findIndex((entry) => Object.is(entry.key, column.key))
  const pinned =
    side === 'start'
      ? orderedColumns.value.slice(0, index).filter((entry) => entry.pinned === 'start')
      : orderedColumns.value.slice(index + 1).filter((entry) => entry.pinned === 'end')
  const utilityWidths =
    side === 'start'
      ? [props.selectable, props.expandable, Boolean(slots.rowLeading)]
          .filter(Boolean)
          .map(() => '3rem')
      : slots.rowTrailing
        ? ['3rem']
        : []
  const widths = [
    ...utilityWidths,
    ...pinned.map((entry) => {
      const width = widthFor(entry) ?? entry.minWidth ?? 0
      return typeof width === 'number' ? `${width}px` : width
    }),
  ]
  return widths.length ? `calc(${widths.join(' + ')})` : '0px'
}
function hasPinnedSide(side: 'start' | 'end') {
  return orderedColumns.value.some((column) => column.pinned === side)
}
function utilityPinStyle(
  side: 'start' | 'end',
  precedingStartColumns = 0,
): CSSProperties | undefined {
  if (!hasPinnedSide(side)) return undefined
  return {
    position: 'sticky',
    ...(side === 'start'
      ? {
          insetInlineStart:
            precedingStartColumns === 0
              ? '0px'
              : `calc(${Array(precedingStartColumns).fill('3rem').join(' + ')})`,
        }
      : { insetInlineEnd: '0px' }),
  }
}
function columnPinClass(column: AvenTableColumn<T, ColumnKey>) {
  const pinned = orderedColumns.value.filter((entry) => entry.pinned === column.pinned)
  return {
    'is-pinned-start': column.pinned === 'start',
    'is-pinned-end': column.pinned === 'end',
    'is-pinned-start-edge': column.pinned === 'start' && Object.is(pinned.at(-1)?.key, column.key),
    'is-pinned-end-edge': column.pinned === 'end' && Object.is(pinned[0]?.key, column.key),
  }
}
function styleForColumn(column: AvenTableColumn<T, ColumnKey>): CSSProperties {
  const width = widthFor(column)
  return {
    width: typeof width === 'number' ? `${width}px` : width,
    minWidth: column.minWidth ? `${column.minWidth}px` : undefined,
    maxWidth: column.maxWidth ? `${column.maxWidth}px` : undefined,
    textAlign: column.align === 'center' ? 'center' : column.align === 'end' ? 'end' : 'start',
    ...(column.pinned
      ? {
          position: 'sticky',
          ...(column.pinned === 'start'
            ? { insetInlineStart: pinOffset(column, 'start') }
            : { insetInlineEnd: pinOffset(column, 'end') }),
        }
      : {}),
  }
}
function applyWidth(key: ColumnKey, width: number) {
  const column = props.columns.find((entry) => entry.key === key)
  if (!column) return
  const min = column.minWidth ?? 48
  const max = column.maxWidth ?? 1200
  const nextWidth = Math.round(Math.max(min, Math.min(max, width)))
  const next = new Map(localWidths.value)
  next.set(key, nextWidth)
  localWidths.value = next
  return nextWidth
}
function startResize(column: AvenTableColumn<T, ColumnKey>, event: PointerEvent) {
  if (!props.resizable || event.button !== 0 || typeof window === 'undefined') return
  const width =
    (event.currentTarget as HTMLElement).parentElement?.getBoundingClientRect().width ?? 100
  event.preventDefault()
  resizeDrag.value = {
    key: column.key,
    pointerId: event.pointerId,
    startX: event.clientX,
    startWidth: width,
    width,
  }
  window.addEventListener('pointermove', onResizeMove)
  window.addEventListener('pointerup', stopResize)
  window.addEventListener('pointercancel', stopResize)
}
function onResizeMove(event: PointerEvent) {
  if (!resizeDrag.value || resizeDrag.value.pointerId !== event.pointerId) return
  const width = applyWidth(
    resizeDrag.value.key,
    resizeDrag.value.startWidth + event.clientX - resizeDrag.value.startX,
  )
  if (width !== undefined) resizeDrag.value.width = width
}
function clearResizeListeners() {
  if (typeof window === 'undefined') return
  window.removeEventListener('pointermove', onResizeMove)
  window.removeEventListener('pointerup', stopResize)
  window.removeEventListener('pointercancel', stopResize)
}
function stopResize(event: PointerEvent) {
  if (
    !resizeDrag.value ||
    (event.pointerId !== undefined && resizeDrag.value.pointerId !== event.pointerId)
  )
    return
  const { key, width, startWidth } = resizeDrag.value
  resizeDrag.value = null
  clearResizeListeners()
  if (width !== startWidth) emit('columnResize', { key, width })
}
function onResizeKeydown(column: AvenTableColumn<T, ColumnKey>, event: KeyboardEvent) {
  const current = Number(
    widthFor(column) ??
      (event.currentTarget as HTMLElement).parentElement?.getBoundingClientRect().width ??
      100,
  )
  const delta = event.key === 'ArrowRight' ? 8 : event.key === 'ArrowLeft' ? -8 : 0
  const next =
    event.key === 'Home'
      ? (column.minWidth ?? 48)
      : event.key === 'End'
        ? (column.maxWidth ?? 1200)
        : current + delta
  if (delta === 0 && event.key !== 'Home' && event.key !== 'End') return
  event.preventDefault()
  const width = applyWidth(column.key, next)
  if (width !== undefined) emit('columnResize', { key: column.key, width })
}
function onColumnDragStart(column: AvenTableColumn<T, ColumnKey>, event: DragEvent) {
  if (!props.reorderable) return
  dragColumn.value = column.key
  event.dataTransfer?.setData('text/plain', String(column.key))
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}
function onColumnDrop(target: AvenTableColumn<T, ColumnKey>, event: DragEvent) {
  event.preventDefault()
  const sourceKey = dragColumn.value
  dragColumn.value = undefined
  if (!props.reorderable || sourceKey === undefined || sourceKey === target.key) return
  const keys = [...sortedColumnKeys.value]
  const from = keys.indexOf(sourceKey)
  const to = keys.indexOf(target.key)
  if (from < 0 || to < 0) return
  keys.splice(to, 0, ...keys.splice(from, 1))
  localColumnOrder.value = keys
  emit('columnReorder', { keys })
}
function onUpdatedSelectAll() {
  if (selectAllRef.value) selectAllRef.value.indeterminate = selectAllState.value === 'mixed'
}
defineExpose({ focus: () => selectAllRef.value?.focus() })
onMounted(onUpdatedSelectAll)
onUpdated(onUpdatedSelectAll)
onBeforeUnmount(() => {
  resizeDrag.value = null
  clearResizeListeners()
})
</script>

<template>
  <div
    v-bind="{ ...attrs, ...props.ui?.root?.attrs }"
    :class="[
      'aven-data-table',
      { 'is-unstyled': props.unstyled },
      attrs.class,
      props.ui?.root?.class,
    ]"
    :style="[attrs.style, props.ui?.root?.style]"
  >
    <slot name="toolbar" :selected-keys="selectedKeys" />
    <AvenTable
      :label="props.label"
      :density="props.density"
      :bordered="props.bordered"
      :striped="props.striped"
      :sticky-header="props.stickyHeader"
      :unstyled="props.unstyled"
      :ui="{ table: props.ui?.table }"
    >
      <template #caption
        ><slot name="caption">{{ props.label }}</slot></template
      >
      <thead
        v-bind="props.ui?.header?.attrs"
        :class="props.ui?.header?.class"
        :style="props.ui?.header?.style"
      >
        <tr>
          <th
            v-if="props.selectable"
            scope="col"
            v-bind="props.ui?.selection?.attrs"
            :class="[
              'selection-cell',
              props.ui?.selection?.class,
              { 'utility-pinned': hasPinnedSide('start') },
            ]"
            :style="[utilityPinStyle('start'), props.ui?.selection?.style]"
          >
            <input
              ref="selectAllRef"
              type="checkbox"
              aria-label="Select all rows"
              :aria-checked="selectAllState === 'mixed' ? 'mixed' : selectAllState === 'all'"
              :checked="selectAllState === 'all'"
              :disabled="props.loading || allRowKeys.length === 0"
              @change="toggleAll"
            />
          </th>
          <th
            v-if="props.expandable"
            scope="col"
            v-bind="props.ui?.expansion?.attrs"
            :class="[
              'expansion-cell',
              props.ui?.expansion?.class,
              { 'utility-pinned': hasPinnedSide('start') },
            ]"
            :style="[
              utilityPinStyle('start', Number(props.selectable)),
              props.ui?.expansion?.style,
            ]"
          >
            <span class="visually-hidden">Expand row</span>
          </th>
          <th
            v-if="$slots.rowLeading"
            scope="col"
            v-bind="props.ui?.cell?.attrs"
            :class="{ 'utility-pinned': hasPinnedSide('start') }"
            :style="utilityPinStyle('start', Number(props.selectable) + Number(props.expandable))"
          >
            <span class="visually-hidden">Leading content</span>
          </th>
          <th
            v-for="column in orderedColumns"
            :key="column.key"
            scope="col"
            v-bind="props.ui?.cell?.attrs"
            :aria-sort="
              sortFor(column)
                ? sortFor(column)?.direction === 'asc'
                  ? 'ascending'
                  : 'descending'
                : 'none'
            "
            :draggable="props.reorderable"
            :class="columnPinClass(column)"
            :style="styleForColumn(column)"
            @dragstart="onColumnDragStart(column, $event)"
            @dragover="props.reorderable && $event.preventDefault()"
            @drop="onColumnDrop(column, $event)"
          >
            <span class="header-content">
              <button
                v-if="column.sortable"
                type="button"
                class="sort-button"
                @click="setSort(column, $event)"
              >
                <slot name="header" :column="column" :sort="sortFor(column)">{{
                  column.header
                }}</slot>
                <span class="sort-indicator" aria-hidden="true">{{
                  sortFor(column)?.direction === 'asc'
                    ? '↑'
                    : sortFor(column)?.direction === 'desc'
                      ? '↓'
                      : '↕'
                }}</span>
              </button>
              <slot v-else name="header" :column="column" :sort="sortFor(column)">{{
                column.header
              }}</slot>
              <span
                v-if="props.resizable"
                class="column-resize-handle"
                role="separator"
                tabindex="0"
                :aria-label="`Resize ${column.header} column`"
                aria-orientation="vertical"
                :aria-valuemin="column.minWidth ?? 48"
                :aria-valuemax="column.maxWidth ?? 1200"
                :aria-valuenow="Number(widthFor(column) ?? 0) || undefined"
                @pointerdown="startResize(column, $event)"
                @keydown="onResizeKeydown(column, $event)"
              />
            </span>
          </th>
          <th
            v-if="$slots.rowTrailing"
            scope="col"
            v-bind="props.ui?.cell?.attrs"
            :class="{ 'utility-pinned': hasPinnedSide('end') }"
            :style="utilityPinStyle('end')"
          >
            <span class="visually-hidden">Row actions</span>
          </th>
        </tr>
      </thead>
      <tbody v-bind="props.ui?.row?.attrs" :class="props.ui?.row?.class">
        <tr v-if="props.loading" v-bind="props.ui?.row?.attrs" :style="props.ui?.row?.style">
          <td :colspan="totalColumns">
            <slot name="loading"><span role="status">Loading rows…</span></slot>
          </td>
        </tr>
        <tr v-else-if="props.error" v-bind="props.ui?.row?.attrs" :style="props.ui?.row?.style">
          <td :colspan="totalColumns">
            <slot name="error"><span role="alert">Unable to load rows.</span></slot>
          </td>
        </tr>
        <tr
          v-else-if="sortedRows.length === 0"
          v-bind="props.ui?.row?.attrs"
          :style="props.ui?.row?.style"
        >
          <td :colspan="totalColumns"><slot name="empty">No rows.</slot></td>
        </tr>
        <template
          v-else
          v-for="({ row, index }, position) in sortedRows"
          :key="rowKeyOf(row, index)"
        >
          <tr
            v-bind="props.ui?.row?.attrs"
            :class="[
              {
                'is-selected': isSelected(rowKeyOf(row, index)),
                'is-clickable': props.rowClickable,
              },
              props.ui?.row?.class,
            ]"
            :style="props.ui?.row?.style"
            :aria-selected="props.selectable ? isSelected(rowKeyOf(row, index)) : undefined"
            @click="onRowClick(row, rowKeyOf(row, index), $event)"
          >
            <td
              v-if="props.selectable"
              v-bind="props.ui?.selection?.attrs"
              :class="[
                'selection-cell',
                props.ui?.selection?.class,
                { 'utility-pinned': hasPinnedSide('start') },
              ]"
              :style="[utilityPinStyle('start'), props.ui?.selection?.style]"
            >
              <input
                type="checkbox"
                :aria-label="`Select ${String(rowKeyOf(row, index))}`"
                :checked="isSelected(rowKeyOf(row, index))"
                :disabled="props.loading"
                @click.stop
                @change="toggleRow(row, rowKeyOf(row, index), index)"
              />
            </td>
            <td
              v-if="props.expandable"
              v-bind="props.ui?.expansion?.attrs"
              :class="[
                'expansion-cell',
                props.ui?.expansion?.class,
                { 'utility-pinned': hasPinnedSide('start') },
              ]"
              :style="[
                utilityPinStyle('start', Number(props.selectable)),
                props.ui?.expansion?.style,
              ]"
            >
              <button
                type="button"
                class="expand-button"
                :aria-expanded="isExpanded(rowKeyOf(row, index))"
                :aria-label="`${isExpanded(rowKeyOf(row, index)) ? 'Collapse' : 'Expand'} row ${String(rowKeyOf(row, index))}`"
                @click="toggleExpanded(rowKeyOf(row, index))"
              >
                {{ isExpanded(rowKeyOf(row, index)) ? '−' : '+' }}
              </button>
            </td>
            <td
              v-if="$slots.rowLeading"
              v-bind="props.ui?.cell?.attrs"
              :class="[
                'row-leading',
                props.ui?.cell?.class,
                { 'utility-pinned': hasPinnedSide('start') },
              ]"
              :style="[
                utilityPinStyle('start', Number(props.selectable) + Number(props.expandable)),
                props.ui?.cell?.style,
              ]"
            >
              <slot
                name="rowLeading"
                :row="row"
                :row-key="rowKeyOf(row, index)"
                :selected="isSelected(rowKeyOf(row, index))"
              />
            </td>
            <td
              v-for="column in orderedColumns"
              :key="column.key"
              v-bind="props.ui?.cell?.attrs"
              :class="[columnPinClass(column), props.ui?.cell?.class]"
              :style="[styleForColumn(column), props.ui?.cell?.style]"
            >
              <slot
                name="cell"
                :row="row"
                :row-key="rowKeyOf(row, index)"
                :column="column"
                :value="valueFor(row, index, column)"
                :index="index"
                >{{ displayValue(valueFor(row, index, column), row, index, column) }}</slot
              >
            </td>
            <td
              v-if="$slots.rowTrailing"
              v-bind="props.ui?.cell?.attrs"
              :class="[
                'row-trailing',
                props.ui?.cell?.class,
                { 'utility-pinned': hasPinnedSide('end') },
              ]"
              :style="[utilityPinStyle('end'), props.ui?.cell?.style]"
            >
              <slot
                name="rowTrailing"
                :row="row"
                :row-key="rowKeyOf(row, index)"
                :emit-action="
                  (action, event) => requestRowAction(row, rowKeyOf(row, index), action, event)
                "
              />
            </td>
          </tr>
          <tr
            v-if="props.expandable && isExpanded(rowKeyOf(row, index))"
            v-bind="props.ui?.row?.attrs"
            :class="['expanded-row', props.ui?.row?.class]"
            :style="props.ui?.row?.style"
          >
            <td :colspan="totalColumns">
              <slot name="expanded" :row="row" :key="rowKeyOf(row, index)" />
            </td>
          </tr>
        </template>
      </tbody>
      <tfoot v-if="$slots.footer">
        <tr>
          <td :colspan="totalColumns"><slot name="footer" /></td>
        </tr>
      </tfoot>
    </AvenTable>
    <slot name="pagination" :row-count="props.rowCount ?? props.rows.length" />
  </div>
</template>

<style scoped>
.aven-data-table {
  min-inline-size: 0;
  color: var(--aven-color-text-primary);
}
.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--aven-space-2);
  min-inline-size: 0;
}
.sort-button {
  display: inline-flex;
  align-items: center;
  gap: var(--aven-space-2);
  min-block-size: 2.5rem;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-weight: inherit;
  text-align: start;
  cursor: pointer;
}
.sort-button:focus-visible,
.expand-button:focus-visible,
.column-resize-handle:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 1px;
}
.sort-indicator {
  color: var(--aven-color-icon-secondary);
}
.selection-cell,
.expansion-cell {
  inline-size: 1%;
  white-space: nowrap;
  text-align: center !important;
}
.selection-cell.utility-pinned,
.expansion-cell.utility-pinned {
  inline-size: 3rem;
  width: 3rem;
  min-inline-size: 3rem;
  max-inline-size: 3rem;
  box-sizing: border-box;
}
.selection-cell input {
  inline-size: 1.25rem;
  block-size: 1.25rem;
  accent-color: var(--aven-color-accent-solid);
}
.is-pinned-start,
.is-pinned-end {
  z-index: 1;
  background: var(--aven-color-surface-table-body);
}
thead .is-pinned-start,
thead .is-pinned-end {
  z-index: 3;
  background: var(--aven-color-surface-raised);
}
.is-pinned-start-edge {
  box-shadow: 5px 0 8px -7px var(--aven-color-shadow-ambient);
}
.is-pinned-end-edge {
  box-shadow: -5px 0 8px -7px var(--aven-color-shadow-ambient);
}
:dir(rtl) .is-pinned-start-edge {
  box-shadow: -5px 0 8px -7px var(--aven-color-shadow-ambient);
}
:dir(rtl) .is-pinned-end-edge {
  box-shadow: 5px 0 8px -7px var(--aven-color-shadow-ambient);
}
.utility-pinned {
  z-index: 2;
  background: var(--aven-color-surface-table-body);
}
thead .utility-pinned {
  z-index: 4;
  background: var(--aven-color-surface-raised);
}
tbody tr:nth-child(even) td.is-pinned-start,
tbody tr:nth-child(even) td.is-pinned-end,
tbody tr:nth-child(even) td.utility-pinned {
  background: var(--aven-color-surface-row-alternate);
}
tbody tr.is-selected td.is-pinned-start,
tbody tr.is-selected td.is-pinned-end,
tbody tr.is-selected td.utility-pinned {
  background: var(--aven-color-surface-selected);
}
tbody tr.is-clickable:hover td.is-pinned-start,
tbody tr.is-clickable:hover td.is-pinned-end,
tbody tr.is-clickable:hover td.utility-pinned {
  background: var(--aven-color-surface-hover);
}
.row-leading,
.row-trailing {
  white-space: nowrap;
}
.row-leading.utility-pinned,
.row-trailing.utility-pinned {
  inline-size: 3rem;
  width: 3rem;
  min-inline-size: 3rem;
  max-inline-size: 3rem;
  box-sizing: border-box;
  overflow: hidden;
}
tbody tr.is-selected {
  background: var(--aven-color-surface-selected);
}
tbody tr.is-clickable {
  cursor: pointer;
}
tbody tr.is-clickable:hover {
  background: var(--aven-color-surface-hover);
}
.expand-button {
  min-inline-size: 2.5rem;
  min-block-size: 2.5rem;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}
.column-resize-handle {
  position: relative;
  flex: 0 0 0.75rem;
  align-self: stretch;
  min-block-size: 2.5rem;
  cursor: col-resize;
  touch-action: none;
}
.column-resize-handle::after {
  position: absolute;
  inset-block: 25%;
  inset-inline-start: 50%;
  inline-size: 1px;
  content: '';
  background: var(--aven-color-divider-resize);
}
.expanded-row td {
  background: var(--aven-color-surface-recessed);
}
.visually-hidden {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.is-unstyled :deep(.aven-table) {
  background: transparent;
}
@media (forced-colors: active) {
  .column-resize-handle::after {
    background: CanvasText;
  }
  .selection-cell input {
    accent-color: Highlight;
  }
}
@media print {
  .aven-data-table {
    color: #000;
  }
  .sort-button,
  .expand-button,
  .column-resize-handle {
    color: #000;
  }
}
</style>
