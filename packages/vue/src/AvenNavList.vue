<script setup lang="ts" generic="Key extends string | number">
import { computed, shallowRef, watch } from 'vue'
import AvenNavItem from './AvenNavItem.vue'
import type { AvenNavItemModel, AvenUi } from './types.js'
defineOptions({ name: 'AvenNavList' })
const props = withDefaults(
  defineProps<{
    items: AvenNavItemModel<Key>[]
    activeKey?: Key
    expandedKeys?: Key[]
    defaultExpandedKeys?: Key[]
    density?: 'compact' | 'comfortable' | 'spacious'
    label?: string
    depth?: number
    unstyled?: boolean
    ui?: AvenUi<'root' | 'list' | 'item' | 'link' | 'disclosure' | 'badge'>
  }>(),
  {
    defaultExpandedKeys: () => [],
    density: 'comfortable',
    label: 'Navigation',
    depth: 0,
    unstyled: false,
  },
)
const emit = defineEmits<{
  navigate: [payload: { key: Key; item: AvenNavItemModel<Key>; originalEvent: MouseEvent }]
  'update:expandedKeys': [keys: Key[]]
}>()
const local = shallowRef<Key[]>([...props.defaultExpandedKeys])
const expanded = computed(() => props.expandedKeys ?? local.value)
watch(
  () => props.expandedKeys,
  (v) => {
    if (v) local.value = [...v]
  },
)
function toggle(key: Key) {
  const next = expanded.value.some((k) => Object.is(k, key))
    ? expanded.value.filter((k) => !Object.is(k, key))
    : [...expanded.value, key]
  local.value = next
  emit('update:expandedKeys', next)
}
function isOpen(key: Key) {
  return expanded.value.some((k) => Object.is(k, key))
}
function setExpanded(keys: Key[]) {
  local.value = keys
  emit('update:expandedKeys', keys)
}
</script>
<template>
  <nav
    :aria-label="label"
    v-bind="ui?.root?.attrs"
    :class="['aven-nav-list', `density-${density}`, { 'is-unstyled': unstyled }, ui?.root?.class]"
    :style="ui?.root?.style"
  >
    <ul v-bind="ui?.list?.attrs" :class="['nav-items', ui?.list?.class]" :style="ui?.list?.style">
      <AvenNavItem
        v-for="item in items"
        :key="item.key"
        :item="item"
        :active="Object.is(activeKey, item.key)"
        :expanded="isOpen(item.key)"
        :depth="depth"
        :density="density"
        :unstyled="unstyled"
        :ui="{ root: ui?.item, link: ui?.link, disclosure: ui?.disclosure, badge: ui?.badge }"
        class="nav-item"
        @navigate="emit('navigate', $event)"
        @update:expanded="toggle($event.key)"
      >
        <template #default="scope"
          ><slot name="item" v-bind="scope">{{ item.label }}</slot></template
        >
        <template #leading="scope"><slot name="item-leading" v-bind="scope" /></template>
        <template #trailing="scope"><slot name="item-trailing" v-bind="scope" /></template>
        <template #badge="scope"
          ><slot name="badge" v-bind="scope">{{ item.badge }}</slot></template
        >
        <template #group-label="scope"><slot name="group-label" v-bind="scope" /></template>
        <template #children="scope">
          <AvenNavList
            v-if="item.children?.length"
            :items="item.children"
            :active-key="activeKey"
            :expanded-keys="expanded"
            :density="density"
            :label="`${item.label} submenu`"
            :depth="scope.depth"
            @navigate="emit('navigate', $event)"
            @update:expanded-keys="setExpanded"
          />
        </template>
      </AvenNavItem>
    </ul>
  </nav>
</template>
<style scoped>
.aven-nav-list {
  min-inline-size: 0;
  color: var(--aven-color-text-primary);
}
.nav-items {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.nav-row {
  display: flex;
  align-items: center;
  min-inline-size: 0;
  gap: var(--aven-space-1);
}
.nav-link {
  display: flex;
  align-items: center;
  gap: var(--aven-space-2);
  flex: 1;
  min-inline-size: 0;
  min-block-size: 2.5rem;
  padding-inline: var(--aven-space-3);
  border-radius: var(--aven-radius-md);
  color: inherit;
  text-decoration: none;
  overflow-wrap: anywhere;
}
.density-compact .nav-link {
  min-block-size: 2rem;
  padding-inline: var(--aven-space-2);
}
.density-spacious .nav-link {
  min-block-size: 3rem;
}
.nav-item.is-active > .nav-row > .nav-link {
  background: var(--aven-color-surface-selected);
  color: var(--aven-color-text-primary);
  font-weight: 600;
}
.nav-link:hover {
  background: var(--aven-color-surface-hover);
}
.nav-link:focus-visible,
.nav-disclosure:focus-visible {
  outline: 0.125rem solid var(--aven-color-focus-ring);
}
.nav-disclosure {
  min-inline-size: 2.25rem;
  min-block-size: 2.25rem;
  border: 0;
  border-radius: var(--aven-radius-sm);
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.nav-badge {
  margin-inline-start: auto;
  font-size: var(--aven-font-size-xs);
  color: var(--aven-color-text-secondary);
}
.nav-disabled {
  flex: 1;
  min-block-size: 2.5rem;
  padding-inline: var(--aven-space-3);
  color: var(--aven-color-text-disabled);
}
.is-unstyled .nav-link {
  border-radius: 0;
  padding-inline: 0;
}
.is-unstyled .nav-item.is-active > .nav-row > .nav-link {
  background: transparent;
  text-decoration: underline;
}
</style>
