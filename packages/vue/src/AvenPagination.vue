<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { AvenUi } from './types.js'
const props = withDefaults(
  defineProps<{
    modelValue?: number
    defaultValue?: number
    total: number
    pageSize?: number
    defaultPageSize?: number
    pageSizeOptions?: number[]
    siblingCount?: number
    boundaryCount?: number
    showSizeChanger?: boolean
    disabled?: boolean
    loading?: boolean
    label?: string
    unstyled?: boolean
    ui?: AvenUi<'root' | 'list' | 'item' | 'summary' | 'size'>
  }>(),
  {
    defaultValue: 1,
    pageSize: 20,
    defaultPageSize: 20,
    pageSizeOptions: () => [10, 20, 50, 100],
    siblingCount: 1,
    boundaryCount: 1,
    showSizeChanger: false,
    disabled: false,
    loading: false,
    label: 'Pagination',
    unstyled: false,
  },
)
const emit = defineEmits<{
  'update:modelValue': [page: number]
  change: [payload: { page: number; pageSize: number }]
  'update:pageSize': [pageSize: number]
}>()
const localPage = ref(props.defaultValue),
  localSize = ref(props.defaultPageSize),
  page = computed(() => props.modelValue ?? localPage.value),
  size = computed(() => props.pageSize ?? localSize.value),
  pageCount = computed(() =>
    Math.max(1, Math.ceil(Math.max(0, props.total) / Math.max(1, size.value))),
  ),
  current = computed(() => Math.min(Math.max(1, page.value), pageCount.value))
watch(
  () => props.modelValue,
  (v) => {
    if (v !== undefined) localPage.value = v
  },
)
watch(
  () => props.pageSize,
  (v) => {
    if (v !== undefined) localSize.value = v
  },
)
type PageItem = number | 'ellipsis'
const pages = computed<PageItem[]>(() => {
  const total = pageCount.value,
    cur = current.value,
    b = props.boundaryCount,
    s = props.siblingCount
  const values = new Set<number>()
  for (let i = 1; i <= Math.min(b, total); i++) values.add(i)
  for (let i = Math.max(1, cur - s); i <= Math.min(total, cur + s); i++) values.add(i)
  for (let i = Math.max(1, total - b + 1); i <= total; i++) values.add(i)
  const sorted = [...values].sort((a, b) => a - b)
  const out: PageItem[] = []
  for (let i = 0; i < sorted.length; i++) {
    if (i && sorted[i]! - sorted[i - 1]! > 1) out.push('ellipsis')
    out.push(sorted[i]!)
  }
  return out
})
const start = computed(() => (props.total === 0 ? 0 : (current.value - 1) * size.value + 1)),
  end = computed(() => Math.min(props.total, current.value * size.value))
function go(next: number) {
  if (
    props.disabled ||
    props.loading ||
    next === current.value ||
    next < 1 ||
    next > pageCount.value
  )
    return
  localPage.value = next
  emit('update:modelValue', next)
  emit('change', { page: next, pageSize: size.value })
}
function resize(e: Event) {
  const next = Number((e.target as HTMLSelectElement).value)
  if (!Number.isFinite(next) || next <= 0 || next === size.value) return
  localSize.value = next
  emit('update:pageSize', next)
  localPage.value = 1
  emit('update:modelValue', 1)
  emit('change', { page: 1, pageSize: next })
}
</script>
<template>
  <nav
    :aria-label="label"
    :aria-busy="loading || undefined"
    :class="[
      'aven-pagination',
      { 'is-disabled': disabled || loading, 'is-unstyled': unstyled },
      ui?.root?.class,
    ]"
    :style="ui?.root?.style"
  >
    <slot name="summary" :start="start" :end="end" :total="total"
      ><span class="pagination-summary">{{ start }}–{{ end }} of {{ total }}</span></slot
    >
    <ol :class="['pagination-list', ui?.list?.class]" :style="ui?.list?.style">
      <li>
        <button
          type="button"
          :disabled="disabled || loading || current <= 1"
          :class="['page-control', ui?.item?.class]"
          aria-label="Previous page"
          @click="go(current - 1)"
        >
          <slot name="previous">Previous</slot>
        </button>
      </li>
      <template v-for="(item, index) in pages" :key="`${item}-${index}`"
        ><li v-if="item === 'ellipsis'" aria-hidden="true" class="page-ellipsis">
          <slot name="ellipsis">…</slot>
        </li>
        <li v-else>
          <button
            type="button"
            :disabled="disabled || loading"
            :aria-current="item === current ? 'page' : undefined"
            :aria-label="`Page ${item}`"
            :class="['page-number', { 'is-current': item === current }, ui?.item?.class]"
            @click="go(item)"
          >
            <slot
              name="page"
              :page="item"
              :current="item === current"
              :disabled="disabled || loading"
              >{{ item }}</slot
            >
          </button>
        </li></template
      >
      <li>
        <button
          type="button"
          :disabled="disabled || loading || current >= pageCount"
          :class="['page-control', ui?.item?.class]"
          aria-label="Next page"
          @click="go(current + 1)"
        >
          <slot name="next">Next</slot>
        </button>
      </li>
    </ol>
    <label v-if="showSizeChanger" :class="['page-size', ui?.size?.class]"
      >Rows per page<select :value="size" :disabled="disabled || loading" @change="resize">
        <option v-for="option in pageSizeOptions" :key="option" :value="option">
          {{ option }}
        </option>
      </select></label
    >
  </nav>
</template>
<style scoped>
.aven-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--aven-space-4);
  flex-wrap: wrap;
  color: var(--aven-color-text-primary);
}
.pagination-summary {
  color: var(--aven-color-text-secondary);
  font-size: var(--aven-font-size-sm);
}
.pagination-list {
  display: flex;
  align-items: center;
  gap: var(--aven-space-1);
  margin: 0;
  padding: 0;
  list-style: none;
}
.page-number,
.page-control {
  min-inline-size: 2.25rem;
  min-block-size: 2.25rem;
  padding-inline: var(--aven-space-2);
  border: 1px solid transparent;
  border-radius: var(--aven-radius-md);
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.page-number:hover:not(:disabled),
.page-control:hover:not(:disabled) {
  background: var(--aven-color-surface-hover);
}
.page-number.is-current {
  border-color: var(--aven-color-border-selected);
  background: var(--aven-color-surface-selected);
  font-weight: 600;
}
.page-number:focus-visible,
.page-control:focus-visible,
.page-size select:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 1px;
}
.page-number:disabled,
.page-control:disabled {
  color: var(--aven-color-text-disabled);
  cursor: not-allowed;
}
.page-ellipsis {
  padding-inline: 0.25rem;
  color: var(--aven-color-text-secondary);
}
.page-size {
  display: flex;
  align-items: center;
  gap: var(--aven-space-2);
  font-size: var(--aven-font-size-sm);
}
.page-size select {
  min-block-size: 2rem;
  border: 1px solid var(--aven-color-border-default);
  border-radius: var(--aven-radius-sm);
  background: var(--aven-color-surface-base);
  color: var(--aven-color-text-primary);
  font: inherit;
}
.is-unstyled .page-number,
.is-unstyled .page-control {
  border: 0;
  border-radius: 0;
  background: transparent;
}
</style>
