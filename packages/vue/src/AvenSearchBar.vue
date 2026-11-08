<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, useAttrs } from 'vue'
import AvenFilterBar from './AvenFilterBar.vue'
import type {
  AvenFilterValue,
  AvenSearchBarEvents,
  AvenSearchBarProps,
  AvenSearchBarSlots,
} from './types.js'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenSearchBarProps>(), {
  defaultQuery: '',
  defaultFilters: () => [],
  definitions: () => [],
  mode: 'live',
  debounce: 0,
  loading: false,
  showClearAll: true,
  disabled: false,
  label: 'Search and filters',
  placeholder: 'Search',
  unstyled: false,
})
const emit = defineEmits<AvenSearchBarEvents>()
const slots = defineSlots<AvenSearchBarSlots>()
const attrs = useAttrs()
const inputAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return { ...rest, ...props.ui?.search?.attrs }
})
const input = ref<HTMLInputElement>()
const internalQuery = ref(props.defaultQuery)
const internalFilters = shallowRef<AvenFilterValue[]>([...props.defaultFilters])
const query = computed(() => props.query ?? internalQuery.value)
const filters = computed(() => props.filters ?? internalFilters.value)
let searchTimer: ReturnType<typeof setTimeout> | undefined
let resetTimer: ReturnType<typeof setTimeout> | undefined
let resetForm: HTMLFormElement | null = null
let lastLiveSignature = ''
function payload(value = query.value, filterValues = filters.value) {
  return { query: value, filters: [...filterValues] }
}
function signature(value = query.value, filterValues = filters.value) {
  return JSON.stringify([value, filterValues])
}
function emitSearch(value = query.value, filterValues = filters.value) {
  const current = signature(value, filterValues)
  if (current === lastLiveSignature) return
  lastLiveSignature = current
  emit('search', payload(value, filterValues))
}
function scheduleSearch(value = query.value, filterValues = filters.value) {
  if (props.mode !== 'live') return
  if (searchTimer) clearTimeout(searchTimer)
  if (props.debounce > 0)
    searchTimer = setTimeout(() => {
      searchTimer = undefined
      emitSearch(value, filterValues)
    }, props.debounce)
  else emitSearch(value, filterValues)
}
function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  if (props.query === undefined) internalQuery.value = value
  emit('update:query', value)
  scheduleSearch(value)
}
function setFilters(next: AvenFilterValue[]) {
  if (props.filters === undefined) internalFilters.value = next
  emit('update:filters', next)
  scheduleSearch(query.value, next)
}
function onRemove(payload: { id: string | number; originalEvent: MouseEvent }) {
  emit('remove', payload)
}
function onClear(payload: { previousFilters: AvenFilterValue[] }) {
  emit('clear', payload)
}
function apply() {
  const current = payload()
  emit('apply', current)
}
function handleReset(event: Event) {
  if (resetTimer) clearTimeout(resetTimer)
  resetTimer = setTimeout(() => {
    resetTimer = undefined
    if (event.defaultPrevented) return
    const nextQuery = props.defaultQuery ?? ''
    const nextFilters = [...(props.defaultFilters ?? [])]
    if (props.query === undefined) internalQuery.value = nextQuery
    else emit('update:query', nextQuery)
    if (props.filters === undefined) internalFilters.value = nextFilters
    else emit('update:filters', nextFilters)
    lastLiveSignature = signature(nextQuery, nextFilters)
  }, 0)
}
onMounted(() => {
  resetForm = input.value?.form ?? null
  resetForm?.addEventListener('reset', handleReset)
})
onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
  if (resetTimer) clearTimeout(resetTimer)
  resetForm?.removeEventListener('reset', handleReset)
})
</script>
<template>
  <div
    role="search"
    :aria-label="label"
    :aria-busy="loading || undefined"
    :class="['aven-search-bar', attrs.class, { 'is-unstyled': unstyled }, ui?.root?.class]"
    :style="[attrs.style, ui?.root?.style]"
    v-bind="ui?.root?.attrs"
  >
    <div class="search-control">
      <span
        v-if="$slots.leading"
        :class="ui?.leading?.class"
        :style="ui?.leading?.style"
        v-bind="ui?.leading?.attrs"
      >
        <slot name="leading" />
      </span>
      <input
        v-bind="{ ...ui?.search?.attrs, ...inputAttrs }"
        ref="input"
        type="search"
        :value="query"
        :disabled="disabled"
        :placeholder="placeholder"
        :aria-label="typeof attrs['aria-label'] === 'string' ? attrs['aria-label'] : 'Search'"
        :class="['search-input', ui?.search?.class]"
        :style="ui?.search?.style"
        @input="onInput"
      />
      <span
        v-if="$slots.trailing"
        :class="ui?.trailing?.class"
        :style="ui?.trailing?.style"
        v-bind="ui?.trailing?.attrs"
      >
        <slot name="trailing" />
      </span>
    </div>
    <AvenFilterBar
      :filters="filters"
      :definitions="definitions"
      :disabled="disabled"
      :loading="loading"
      :show-clear-all="showClearAll"
      :unstyled="unstyled"
      :ui="{
        root: ui?.filters,
        chip: ui?.chip,
        clear: ui?.remove,
        add: ui?.add,
        summary: ui?.summary,
      }"
      @update:filters="setFilters"
      @remove="onRemove"
      @clear="onClear"
    >
      <template v-if="slots.filter" #filter="scope"><slot name="filter" v-bind="scope" /></template>
      <template v-if="slots.editor" #editor="scope"><slot name="editor" v-bind="scope" /></template>
      <template v-if="slots['add-trigger']" #add-trigger="scope"
        ><slot name="add-trigger" v-bind="scope"
      /></template>
      <template v-if="slots.summary" #summary="scope"
        ><slot name="summary" v-bind="scope"
      /></template>
      <template v-if="slots.empty" #empty><slot name="empty" /></template>
    </AvenFilterBar>
    <button
      v-if="mode === 'apply'"
      type="button"
      class="search-apply-filters"
      :disabled="disabled || loading"
      @click="apply"
    >
      Apply search and filters
    </button>
    <div
      v-if="loading || resultCount !== undefined"
      role="status"
      aria-live="polite"
      class="search-status"
    >
      {{ loading ? 'Searching…' : `${resultCount} results` }}
    </div>
  </div>
</template>
<style scoped>
.aven-search-bar {
  display: grid;
  gap: var(--aven-space-3);
  min-inline-size: 0;
  color: var(--aven-search-fg, var(--aven-color-text-primary));
}
.search-control {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--aven-space-2);
  min-block-size: 2.75rem;
  min-inline-size: 0;
  padding-inline: var(--aven-space-3);
  border: 1px solid var(--aven-search-border, var(--aven-color-border-subtle));
  border-radius: var(--aven-radius-md);
  background: var(--aven-search-bg, var(--aven-color-surface-card));
}
.search-control:focus-within {
  outline: 2px solid var(--aven-search-focus, var(--aven-color-focus-ring));
  outline-offset: 2px;
}
.search-input {
  flex: 1;
  min-inline-size: min(12rem, 100%);
  min-block-size: 2.75rem;
  padding: var(--aven-space-2) 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: inherit;
  font: inherit;
}
.search-input::placeholder {
  color: var(--aven-search-placeholder, var(--aven-color-text-secondary));
}
.search-apply-filters {
  min-block-size: 2.75rem;
  padding-inline: var(--aven-space-3);
  border: 1px solid var(--aven-search-action-border, var(--aven-color-border-subtle));
  border-radius: var(--aven-radius-sm);
  background: var(--aven-search-action-bg, var(--aven-color-surface-subtle));
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.search-apply-filters {
  justify-self: start;
}
.search-apply-filters:focus-visible {
  outline: 2px solid var(--aven-search-focus, var(--aven-color-focus-ring));
  outline-offset: 2px;
}
.search-status {
  color: var(--aven-search-status-fg, var(--aven-color-text-secondary));
  font-size: var(--aven-font-size-sm);
}
.is-unstyled .search-control,
.is-unstyled .search-apply-filters {
  border: 0;
  border-radius: 0;
  background: transparent;
}
@media (forced-colors: active) {
  .search-control,
  .search-apply-filters {
    border-color: CanvasText;
  }
}
</style>
