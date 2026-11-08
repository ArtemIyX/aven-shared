<script setup lang="ts" generic="Key extends string | number">
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { useAvenId } from './composables.js'
import AvenTreeItem from './AvenTreeItem.vue'
import type { AvenTreeEvents, AvenTreeNode, AvenTreeProps, AvenTreeSlots } from './types.js'
const props = withDefaults(defineProps<AvenTreeProps<Key>>(), {
  defaultSelectedKeys: () => [],
  defaultExpandedKeys: () => [],
  defaultCheckedKeys: () => [],
  loadingKeys: () => [],
  multiple: false,
  checkable: false,
  lazy: false,
  cascadeChecks: false,
  loop: false,
  typeahead: true,
  label: 'Items',
  emptyLabel: 'No items',
  unstyled: false,
})
const emit = defineEmits<AvenTreeEvents<Key>>()
const slots = defineSlots<AvenTreeSlots<Key>>()
const root = ref<HTMLElement>()
const internalSelected = shallowRef<Key[]>([...props.defaultSelectedKeys])
const internalExpanded = shallowRef<Key[]>([...props.defaultExpandedKeys])
const internalChecked = shallowRef<Key[]>([...props.defaultCheckedKeys])
const selectedKeys = computed(() => props.selectedKeys ?? internalSelected.value)
const expandedKeys = computed(() => props.expandedKeys ?? internalExpanded.value)
const checkedKeys = computed(() => props.checkedKeys ?? internalChecked.value)
const activeIndex = ref(-1)
const query = ref('')
let queryTimer: ReturnType<typeof setTimeout> | undefined
const treeId = useAvenId(props.id, 'tree')
type VisibleNode = { node: AvenTreeNode<Key>; parentKey?: Key; level: number }
const visibleNodes = computed(() => {
  const rows: VisibleNode[] = []
  const visit = (nodes: AvenTreeNode<Key>[], level: number, parentKey?: Key) => {
    for (const node of nodes) {
      rows.push({ node, parentKey, level })
      if (expandedKeys.value.some((key) => Object.is(key, node.key)) && node.children?.length)
        visit(node.children, level + 1, node.key)
    }
  }
  visit(props.nodes, 1)
  return rows
})
const indexByKey = computed(
  () => new Map(visibleNodes.value.map((row, index) => [row.node.key, index])),
)
const parents = computed(() => {
  const result = new Map<Key, Key>()
  const visit = (nodes: AvenTreeNode<Key>[], parent?: Key) => {
    nodes.forEach((node) => {
      if (parent !== undefined) result.set(node.key, parent)
      if (node.children) visit(node.children, node.key)
    })
  }
  visit(props.nodes)
  return result
})
function sameKeys(a: Key[], b: Key[]) {
  return a.length === b.length && a.every((key, index) => Object.is(key, b[index]))
}
function requestSelected(next: Key[]) {
  if (sameKeys(selectedKeys.value, next)) return
  if (props.selectedKeys === undefined) internalSelected.value = next
  emit('update:selectedKeys', next)
}
function requestExpanded(next: Key[]) {
  if (sameKeys(expandedKeys.value, next)) return
  if (props.expandedKeys === undefined) internalExpanded.value = next
  emit('update:expandedKeys', next)
}
function requestChecked(next: Key[]) {
  if (sameKeys(checkedKeys.value, next)) return
  if (props.checkedKeys === undefined) internalChecked.value = next
  emit('update:checkedKeys', next)
}
function hasDescendant(activeKey: Key, parentKey: Key) {
  let parent = parents.value.get(activeKey)
  while (parent !== undefined) {
    if (Object.is(parent, parentKey)) return true
    parent = parents.value.get(parent)
  }
  return false
}
function findNode(key: Key, nodes = props.nodes): AvenTreeNode<Key> | undefined {
  for (const node of nodes) {
    if (Object.is(node.key, key)) return node
    const found = node.children && findNode(key, node.children)
    if (found) return found
  }
}
function descendants(node: AvenTreeNode<Key>, result: Key[] = []) {
  result.push(node.key)
  node.children?.filter((child) => !child.disabled).forEach((child) => descendants(child, result))
  return result
}
function setExpanded(key: Key, next: boolean) {
  const node = findNode(key)
  if (!node || node.disabled) return
  const current = expandedKeys.value
  if (current.some((entry) => Object.is(entry, key)) === next) return
  const active = visibleNodes.value[activeIndex.value]?.node.key
  if (!next && active !== undefined && hasDescendant(active, key)) {
    activeIndex.value = visibleNodes.value.findIndex((row) => Object.is(row.node.key, key))
    void nextTick(() => focusIndex(activeIndex.value))
  }
  requestExpanded(next ? [...current, key] : current.filter((entry) => !Object.is(entry, key)))
  if (
    next &&
    props.lazy &&
    !node.children?.length &&
    !node.leaf &&
    !props.loadingKeys.some((entry) => Object.is(entry, key))
  )
    emit('loadChildren', { key, node })
  if (next && node.children?.length) {
    void nextTick(() => {
      const childIndex = indexByKey.value.get(node.children![0]!.key)
      if (childIndex !== undefined) focusIndex(childIndex)
    })
  }
}
function select(key: Key) {
  const node = findNode(key)
  if (!node || node.disabled) return
  const current = selectedKeys.value
  const next = props.multiple
    ? current.some((entry) => Object.is(entry, key))
      ? current.filter((entry) => !Object.is(entry, key))
      : [...current, key]
    : [key]
  requestSelected(next)
}
function check(key: Key, nextValue: boolean) {
  if (!props.checkable) return
  const node = findNode(key)
  if (!node || node.disabled) return
  let next = [...checkedKeys.value]
  const affected = props.cascadeChecks ? descendants(node) : [key]
  if (nextValue) {
    for (const candidate of affected)
      if (!next.some((entry) => Object.is(entry, candidate))) next.push(candidate)
  } else {
    next = next.filter((entry) => !affected.some((candidate) => Object.is(candidate, entry)))
  }
  if (props.cascadeChecks) {
    let parent = parents.value.get(key)
    while (parent !== undefined) {
      const parentNode = findNode(parent)
      const children = parentNode?.children ?? []
      const enabledChildren = children.filter((child) => !child.disabled)
      const allChecked =
        enabledChildren.length > 0 &&
        enabledChildren.every((child) =>
          child.children?.length
            ? descendants(child).every((candidate) =>
                next.some((entry) => Object.is(entry, candidate)),
              )
            : next.some((entry) => Object.is(entry, child.key)),
        )
      if (allChecked && !next.some((entry) => Object.is(entry, parent))) next.push(parent)
      else if (!allChecked) next = next.filter((entry) => !Object.is(entry, parent))
      parent = parents.value.get(parent)
    }
  }
  requestChecked(next)
}
function focusIndex(index: number) {
  const row = visibleNodes.value[index]
  if (!row || row.node.disabled) return
  activeIndex.value = index
  root.value?.querySelector<HTMLElement>(`[data-tree-index="${index}"]`)?.focus()
}
function moveFocus(index: number, direction = index >= activeIndex.value ? 1 : -1) {
  const rows = visibleNodes.value
  if (!rows.length) return
  let next = index
  for (let tries = 0; tries < rows.length; tries++) {
    if (next < 0 || next >= rows.length) {
      if (!props.loop) return
      next = (next + rows.length) % rows.length
    }
    if (!rows[next]?.node.disabled) {
      focusIndex(next)
      return
    }
    next += direction
  }
}
function keydown(event: KeyboardEvent) {
  const targetIndex = Number((event.target as HTMLElement | null)?.dataset?.treeIndex)
  const index = Number.isInteger(targetIndex) ? targetIndex : activeIndex.value
  const row = visibleNodes.value[index]
  if (!row) return
  const node = row.node
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    moveFocus(index + 1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    moveFocus(index - 1, -1)
  } else if (event.key === 'Home') {
    event.preventDefault()
    moveFocus(0, 1)
  } else if (event.key === 'End') {
    event.preventDefault()
    moveFocus(visibleNodes.value.length - 1, -1)
  } else if (event.key === 'ArrowRight') {
    if (
      (node.children?.length || (props.lazy && !node.leaf)) &&
      !expandedKeys.value.some((key) => Object.is(key, node.key))
    ) {
      event.preventDefault()
      setExpanded(node.key, true)
    } else if (node.children?.length) {
      event.preventDefault()
      moveFocus(index + 1)
    }
  } else if (event.key === 'ArrowLeft') {
    if (expandedKeys.value.some((key) => Object.is(key, node.key))) {
      event.preventDefault()
      setExpanded(node.key, false)
    } else {
      const parent = parents.value.get(node.key)
      if (parent !== undefined) {
        event.preventDefault()
        const parentIndex = indexByKey.value.get(parent)
        if (parentIndex !== undefined) focusIndex(parentIndex)
      }
    }
  } else if (event.key === 'Enter') {
    event.preventDefault()
    emit('activate', { key: node.key, node, originalEvent: event })
  } else if (event.key === ' ' || event.key === 'Spacebar') {
    event.preventDefault()
    if (props.checkable) check(node.key, !checkedKeys.value.some((key) => Object.is(key, node.key)))
    else select(node.key)
  } else if (
    props.typeahead &&
    event.key.length === 1 &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey
  ) {
    query.value += event.key.toLocaleLowerCase()
    if (queryTimer) clearTimeout(queryTimer)
    queryTimer = setTimeout(() => (query.value = ''), 700)
    const match = visibleNodes.value.findIndex(
      (entry, at) =>
        at > index &&
        !entry.node.disabled &&
        entry.node.label.toLocaleLowerCase().startsWith(query.value),
    )
    if (match >= 0) moveFocus(match)
  }
}
watch(
  visibleNodes,
  (rows) => {
    if (rows.length === 0) activeIndex.value = -1
    else if (activeIndex.value < 0 || activeIndex.value >= rows.length) {
      const firstEnabled = rows.findIndex((row) => !row.node.disabled)
      activeIndex.value = firstEnabled
    }
  },
  { immediate: true },
)
defineExpose({
  focusFirst: () => moveFocus(0),
  focusLast: () => moveFocus(visibleNodes.value.length - 1, -1),
  focusKey: (key: Key) => {
    const index = indexByKey.value.get(key)
    if (index !== undefined) focusIndex(index)
  },
})
onBeforeUnmount(() => {
  if (queryTimer) clearTimeout(queryTimer)
})
</script>
<template>
  <div
    ref="root"
    :id="treeId"
    role="tree"
    :aria-label="label"
    :class="['aven-tree', { 'is-unstyled': unstyled }, ui?.root?.class]"
    :style="ui?.root?.style"
    v-bind="ui?.root?.attrs"
    @keydown="keydown"
  >
    <AvenTreeItem
      v-for="(node, index) in nodes"
      :key="node.key"
      :tree-id="treeId"
      :node="node"
      :level="1"
      :position="index + 1"
      :set-size="nodes.length"
      :index="indexByKey.get(node.key) ?? index"
      :index-by-key="indexByKey"
      :selected-keys="selectedKeys"
      :expanded-keys="expandedKeys"
      :checked-keys="checkedKeys"
      :loading-keys="loadingKeys"
      :active-index="activeIndex"
      :multiple="multiple"
      :checkable="checkable"
      :lazy="lazy"
      :cascade-checks="cascadeChecks"
      :unstyled="unstyled"
      :ui="ui"
      @focus-index="activeIndex = $event"
      @select="select($event.key)"
      @toggle="setExpanded($event.key, $event.expanded)"
      @check="check($event.key, $event.checked)"
      @activate="emit('activate', $event)"
    >
      <template v-if="slots.item" #default="scope">
        <slot
          name="item"
          :node="scope.node"
          :key="scope.node.key"
          :level="scope.level"
          :expanded="scope.expanded"
          :selected="scope.selected"
          :checked="scope.checked"
          :indeterminate="scope.indeterminate"
          :loading="scope.loading"
        />
      </template>
      <template v-if="slots.toggle" #toggle="scope"><slot name="toggle" v-bind="scope" /></template>
      <template v-if="slots.icon" #icon="scope"><slot name="icon" v-bind="scope" /></template>
      <template v-if="slots.actions" #actions="scope"
        ><slot name="actions" v-bind="scope"
      /></template>
    </AvenTreeItem>
    <div
      v-if="nodes.length === 0"
      role="status"
      :class="ui?.empty?.class"
      :style="ui?.empty?.style"
      v-bind="ui?.empty?.attrs"
    >
      <slot name="empty">{{ emptyLabel }}</slot>
    </div>
  </div>
</template>
<style scoped>
.aven-tree {
  min-inline-size: 0;
  color: var(--aven-color-text-primary);
}
.is-unstyled {
  border: 0;
  background: transparent;
}
</style>
