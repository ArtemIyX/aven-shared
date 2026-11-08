<script setup lang="ts" generic="Key extends string | number">
import { computed } from 'vue'
import type { AvenTreeItemEvents, AvenTreeItemProps, AvenTreeItemSlots } from './types.js'
defineOptions({ name: 'AvenTreeItem', inheritAttrs: false })
const props = defineProps<AvenTreeItemProps<Key>>()
const emit = defineEmits<AvenTreeItemEvents<Key>>()
const slots = defineSlots<AvenTreeItemSlots<Key>>()
const children = computed(() => props.node.children ?? [])
const hasChildren = computed(() => children.value.length > 0 || (!!props.lazy && !props.node.leaf))
const expanded = computed(() => props.expandedKeys.some((key) => Object.is(key, props.node.key)))
const selected = computed(() => props.selectedKeys.some((key) => Object.is(key, props.node.key)))
const checked = computed(() => props.checkedKeys.some((key) => Object.is(key, props.node.key)))
const loading = computed(() => props.loadingKeys.some((key) => Object.is(key, props.node.key)))
const partial = computed(() => {
  if (!props.cascadeChecks || !children.value.length) return false
  const visit = (node: (typeof children.value)[number]): { checked: boolean; partial: boolean } => {
    const descendants = (node.children ?? []).filter((child) => !child.disabled).map(visit)
    const self = props.checkedKeys.some((key) => Object.is(key, node.key))
    const some = self || descendants.some((item) => item.checked || item.partial)
    const all = self || (descendants.length > 0 && descendants.every((item) => item.checked))
    return { checked: all, partial: some && !all }
  }
  const states = children.value.filter((node) => !node.disabled).map(visit)
  const any = checked.value || states.some((item) => item.checked || item.partial)
  const all = checked.value || states.every((item) => item.checked)
  return any && !all
})
const encodedKey = computed(
  () =>
    `${typeof props.node.key === 'number' ? 'n' : 's'}-${encodeURIComponent(String(props.node.key))}`,
)
const itemId = computed(() => `${props.treeId}-item-${encodedKey.value}`)
const groupId = computed(() => `${props.treeId}-group-${encodedKey.value}`)
function toggle(event: MouseEvent) {
  event.stopPropagation()
  if (!props.node.disabled && hasChildren.value)
    emit('toggle', { key: props.node.key, expanded: !expanded.value })
}
function select(originalEvent: Event) {
  originalEvent.stopPropagation()
  if (!props.node.disabled) emit('select', { key: props.node.key, originalEvent })
}
function relayToggle(payload: AvenTreeItemEvents<Key>['toggle'][0]) {
  emit('toggle', payload)
}
function relaySelect(payload: AvenTreeItemEvents<Key>['select'][0]) {
  emit('select', payload)
}
function relayActivate(payload: AvenTreeItemEvents<Key>['activate'][0]) {
  emit('activate', payload)
}
function relayCheck(payload: AvenTreeItemEvents<Key>['check'][0]) {
  emit('check', payload)
}
function relayFocus(index: number) {
  emit('focusIndex', index)
}
</script>
<template>
  <div
    :id="itemId"
    role="treeitem"
    :data-tree-index="index"
    :aria-level="level"
    :aria-posinset="position"
    :aria-setsize="setSize"
    :aria-selected="selected"
    :aria-checked="checkable ? (partial ? 'mixed' : checked) : undefined"
    :aria-expanded="hasChildren ? expanded : undefined"
    :aria-controls="hasChildren && expanded ? groupId : undefined"
    :aria-busy="loadingKeys.some((key) => Object.is(key, node.key)) || undefined"
    :aria-disabled="node.disabled || undefined"
    :tabindex="activeIndex === index && !node.disabled ? 0 : -1"
    :class="[
      'aven-tree-item',
      {
        'is-selected': selected,
        'is-expanded': expanded,
        'is-checked': checked,
        'is-disabled': node.disabled,
        'is-active': activeIndex === index,
        'is-unstyled': unstyled,
      },
      ui?.item?.class,
    ]"
    :style="[{ '--aven-tree-indent': `${Math.max(level - 1, 0) * 16}px` }, ui?.item?.style]"
    v-bind="ui?.item?.attrs"
    @click="select($event)"
    @focus="emit('focusIndex', index)"
  >
    <div class="tree-row">
      <button
        v-if="hasChildren"
        type="button"
        tabindex="-1"
        :class="['tree-toggle', ui?.toggle?.class]"
        :style="ui?.toggle?.style"
        v-bind="ui?.toggle?.attrs"
        :aria-label="`${expanded ? 'Collapse' : 'Expand'} ${node.label}`"
        :aria-expanded="expanded"
        :aria-controls="expanded ? groupId : undefined"
        :disabled="node.disabled"
        @click="toggle($event)"
      >
        <slot name="toggle" :expanded="expanded">{{ expanded ? '▾' : '▸' }}</slot>
      </button>
      <span v-else class="tree-toggle-spacer" aria-hidden="true" />
      <span
        v-if="$slots.icon"
        :class="['tree-icon', ui?.icon?.class]"
        :style="ui?.icon?.style"
        v-bind="ui?.icon?.attrs"
      >
        <slot name="icon" :node="node" />
      </span>
      <span
        :class="['tree-label', ui?.label?.class]"
        :style="ui?.label?.style"
        v-bind="ui?.label?.attrs"
      >
        <slot
          :node="node"
          :key="node.key"
          :level="level"
          :expanded="expanded"
          :selected="selected"
          :checked="checked"
          :indeterminate="partial"
          :loading="loading"
          >{{ node.label }}</slot
        >
      </span>
      <span
        v-if="checkable"
        aria-hidden="true"
        :class="['tree-checkbox', ui?.checkbox?.class]"
        :style="ui?.checkbox?.style"
        v-bind="ui?.checkbox?.attrs"
        >{{ checked ? '✓' : partial ? '−' : '' }}</span
      >
      <span :class="ui?.actions?.class" :style="ui?.actions?.style" v-bind="ui?.actions?.attrs">
        <slot name="actions" :node="node" />
      </span>
    </div>
    <div v-if="expanded && children.length" :id="groupId" role="group" class="tree-group">
      <AvenTreeItem
        v-for="child in children"
        :key="child.key"
        :tree-id="treeId"
        :node="child"
        :level="level + 1"
        :position="children.indexOf(child) + 1"
        :set-size="children.length"
        :index="indexByKey.get(child.key) ?? -1"
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
        @toggle="relayToggle"
        @select="relaySelect"
        @activate="relayActivate"
        @check="relayCheck"
        @focus-index="relayFocus"
      >
        <template v-if="slots.default" #default="scope"><slot v-bind="scope" /></template>
        <template v-if="slots.toggle" #toggle="scope"
          ><slot name="toggle" v-bind="scope"
        /></template>
        <template v-if="slots.icon" #icon="scope"><slot name="icon" v-bind="scope" /></template>
        <template v-if="slots.actions" #actions="scope"
          ><slot name="actions" v-bind="scope"
        /></template>
      </AvenTreeItem>
    </div>
  </div>
</template>
<style scoped>
.aven-tree-item {
  display: block;
  min-inline-size: 0;
  color: var(--aven-color-text-primary);
}
.tree-row {
  display: flex;
  align-items: center;
  gap: var(--aven-space-2);
  min-block-size: 2.75rem;
  padding-inline-start: calc(var(--aven-space-2) + var(--aven-tree-indent, 0px));
  border-radius: var(--aven-radius-sm);
  cursor: default;
}
.tree-toggle > :deep(*) {
  transform: none;
}
:dir(rtl) .tree-toggle {
  transform: scaleX(-1);
}
.aven-tree-item.is-selected > .tree-row,
.aven-tree-item.is-active > .tree-row {
  background: var(--aven-color-surface-hover);
}
.aven-tree-item:focus-visible > .tree-row {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: -2px;
}
.aven-tree-item.is-disabled {
  color: var(--aven-color-text-disabled);
}
.tree-toggle,
.tree-checkbox {
  display: inline-grid;
  flex: 0 0 2.75rem;
  place-items: center;
  min-block-size: 2.75rem;
  border: 0;
  border-radius: var(--aven-radius-sm);
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.tree-toggle-spacer {
  flex: 0 0 2.75rem;
}
.tree-icon {
  flex: none;
}
.tree-label {
  flex: 1;
  min-inline-size: 0;
  overflow-wrap: anywhere;
}
.tree-group {
  min-inline-size: 0;
}
.is-unstyled .tree-row,
.is-unstyled .tree-toggle,
.is-unstyled .tree-checkbox {
  border: 0;
  border-radius: 0;
  background: transparent;
}
@media (forced-colors: active) {
  .aven-tree-item.is-selected > .tree-row {
    outline: 1px solid Highlight;
  }
}
</style>
