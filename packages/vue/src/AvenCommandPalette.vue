<script setup lang="ts" generic="Key extends string | number">
import { computed, nextTick, ref, useAttrs, watch } from 'vue'
import AvenCombobox from './AvenCombobox.vue'
import AvenDialog from './AvenDialog.vue'
import type {
  AvenCommandPaletteEvents,
  AvenCommandPaletteProps,
  AvenCommandPaletteSlots,
  AvenDialogProps,
  AvenOption,
  AvenPaletteCommand,
} from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenCommandPaletteProps<Key>>(), {
  defaultOpen: false,
  defaultQuery: '',
  loading: false,
  remote: false,
  closeOnSelect: true,
  placeholder: 'Search commands…',
  label: 'Commands',
  emptyText: 'No matching commands',
  unstyled: false,
})
const emit = defineEmits<AvenCommandPaletteEvents<Key>>()
defineSlots<AvenCommandPaletteSlots<Key>>()
const attrs = useAttrs()
const combobox = ref<{ focus: () => void } | null>(null)
const localOpen = ref(props.defaultOpen)
const localQuery = ref(props.defaultQuery)
const localResultsOpen = ref(true)
const isOpen = computed(() => props.open ?? localOpen.value)
const query = computed(() => props.query ?? localQuery.value)
const resultsOpen = computed(() => isOpen.value && localResultsOpen.value)
const commandByKey = computed(() => new Map(props.items.map((item) => [item.key, item])))
const options = computed<AvenOption<Key>[]>(() =>
  props.items
    .filter(
      (item) =>
        props.remote ||
        !query.value.trim() ||
        (props.filter ? props.filter(item, query.value) : defaultFilter(item, query.value)),
    )
    .map((item) => ({
      value: item.key,
      label: item.label,
      description: item.description,
      disabled: item.disabled,
      group: item.group,
      keywords: item.keywords,
    })),
)
const dialogUi = computed<AvenDialogProps['ui']>(() => ({
  root: props.ui?.root,
  content: props.ui?.content,
  header: props.ui?.header,
  title: props.ui?.title,
  description: props.ui?.description,
  body: props.ui?.body,
  footer: props.ui?.footer,
}))
watch(isOpen, (open) => {
  if (open) localResultsOpen.value = true
})
function defaultFilter(item: AvenPaletteCommand<Key>, value: string) {
  const haystack = `${item.label} ${item.description ?? ''} ${(item.keywords ?? []).join(' ')}`
  return haystack.toLocaleLowerCase().includes(value.toLocaleLowerCase())
}
function setOpen(open: boolean) {
  if (isOpen.value === open) return
  if (props.open === undefined) localOpen.value = open
  emit('update:open', open)
}
function setQuery(value: string) {
  if (query.value === value) return
  if (props.query === undefined) localQuery.value = value
  emit('update:query', value)
}
function onResultsOpen(open: boolean) {
  localResultsOpen.value = open
}
function onSelect(payload: { key: Key; item: AvenOption<Key>; originalEvent: Event }) {
  const item = commandByKey.value.get(payload.key)
  if (!item) return
  emit('select', { key: payload.key, item, originalEvent: payload.originalEvent })
  if (props.closeOnSelect) setOpen(false)
  else void nextTick(() => (localResultsOpen.value = true))
}
function onHighlight(payload: { key: Key }) {
  const item = commandByKey.value.get(payload.key)
  if (item) emit('highlight', { key: payload.key, item })
}
defineExpose({
  open: () => setOpen(true),
  close: () => setOpen(false),
  focus: () => combobox.value?.focus(),
  clearQuery: () => setQuery(''),
})
</script>

<template>
  <AvenDialog
    v-bind="attrs"
    :open="isOpen"
    :title="label"
    :initial-focus="'input'"
    :show-close="false"
    :unstyled="unstyled"
    :ui="dialogUi"
    :class="['aven-command-palette', { 'is-unstyled': unstyled }, ui?.root?.class]"
    :style="ui?.root?.style"
    @update:open="setOpen"
    @open-change="emit('openChange', $event)"
    @before-close="emit('beforeClose', $event)"
    @after-open="emit('afterOpen')"
    @after-close="emit('afterClose')"
  >
    <AvenCombobox
      ref="combobox"
      :options="options"
      :query="query"
      :active-key="activeKey"
      :default-active-key="defaultActiveKey"
      :open="resultsOpen"
      :loading="loading"
      :error="error"
      :remote="remote"
      :filter="undefined"
      :placeholder="placeholder"
      :label="label"
      :unstyled="unstyled"
      :ui="{ control: ui?.input, option: ui?.option }"
      @update:query="setQuery"
      @update:active-key="emit('update:activeKey', $event)"
      @update:open="onResultsOpen"
      @select="onSelect"
      @highlight="onHighlight"
      @load-more="emit('loadMore', { query: $event.query })"
    >
      <template #leading><slot name="input-leading" /></template>
      <template #trailing><slot name="input-trailing" /></template>
      <template #option="scope">
        <slot
          name="item"
          :item="commandByKey.get(scope.item.value)!"
          :key="scope.item.value"
          :active="scope.active"
          :disabled="scope.disabled"
        >
          <span>{{ scope.item.label }}</span>
          <slot name="shortcut" :item="commandByKey.get(scope.item.value)!">
            <kbd v-if="commandByKey.get(scope.item.value)?.shortcut">{{
              commandByKey.get(scope.item.value)?.shortcut
            }}</kbd>
          </slot>
        </slot>
      </template>
      <template #group="scope"><slot name="group" :group="String(scope.group)" /></template>
      <template #empty="scope"
        ><slot name="empty" v-bind="scope">{{ emptyText }}</slot></template
      >
      <template #loading
        ><slot name="loading"><span role="status">Loading commands…</span></slot></template
      >
      <template #popup-footer>
        <div :class="ui?.footer?.class" :style="ui?.footer?.style"><slot name="footer" /></div>
      </template>
    </AvenCombobox>
  </AvenDialog>
</template>

<style scoped>
.aven-command-palette {
  --aven-command-palette-width: min(42rem, calc(100vw - 2rem));
}
.aven-command-palette :deep(.aven-dialog.aven-command-palette) {
  inline-size: var(--aven-command-palette-width);
}
.aven-command-palette :deep(.aven-dialog-body) {
  padding: 0;
}
.aven-command-palette :deep(.aven-combobox) {
  padding: var(--aven-space-3);
}
.aven-command-palette :deep(.combobox-option) {
  align-items: center;
  justify-content: space-between;
  gap: var(--aven-space-4);
}
.aven-command-palette kbd {
  flex: none;
  color: var(--aven-color-text-secondary);
  font: inherit;
  font-size: var(--aven-font-size-sm);
}
.is-unstyled {
  --aven-command-palette-width: auto;
}
@media (max-width: 36rem) {
  .aven-command-palette {
    --aven-command-palette-width: calc(100vw - 1rem);
  }
}
</style>
