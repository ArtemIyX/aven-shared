<script setup lang="ts" generic="Key extends string | number">
import { computed, shallowRef, watch } from 'vue'
import type { AvenUi } from './types.js'
export type AvenNavItemModel<K> = {
  key: K
  label: string
  href?: string
  children?: AvenNavItemModel<K>[]
  disabled?: boolean
  badge?: string | number
}
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
function navigate(item: AvenNavItemModel<Key>, e: MouseEvent) {
  if (!item.disabled && item.href) emit('navigate', { key: item.key, item, originalEvent: e })
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
    :class="['aven-nav-list', `density-${density}`, { 'is-unstyled': unstyled }, ui?.root?.class]"
    :style="ui?.root?.style"
  >
    <ul :class="['nav-items', ui?.list?.class]" :style="ui?.list?.style">
      <li
        v-for="item in items"
        :key="item.key"
        :class="[
          'nav-item',
          { 'is-active': Object.is(activeKey, item.key), 'is-disabled': item.disabled },
          ui?.item?.class,
        ]"
        :style="ui?.item?.style"
      >
        <div class="nav-row">
          <a
            v-if="item.href && !item.disabled"
            :href="item.href"
            :aria-current="Object.is(activeKey, item.key) ? 'page' : undefined"
            :class="['nav-link', ui?.link?.class]"
            :style="ui?.link?.style"
            @click="navigate(item, $event)"
            ><slot
              name="item"
              :item="item"
              :key="item.key"
              :active="Object.is(activeKey, item.key)"
              :expanded="isOpen(item.key)"
              :depth="depth"
              >{{ item.label }}</slot
            ><span v-if="item.badge !== undefined" :class="['nav-badge', ui?.badge?.class]">{{
              item.badge
            }}</span></a
          ><span
            v-else-if="!item.href"
            :class="['nav-link', ui?.link?.class]"
            :style="ui?.link?.style"
            ><slot
              name="item"
              :item="item"
              :key="item.key"
              :active="Object.is(activeKey, item.key)"
              :expanded="isOpen(item.key)"
              :depth="depth"
              >{{ item.label }}</slot
            ></span
          ><span v-else class="nav-disabled">{{ item.label }}</span
          ><button
            v-if="item.children?.length"
            type="button"
            :class="['nav-disclosure', ui?.disclosure?.class]"
            :aria-expanded="isOpen(item.key)"
            :aria-label="`${isOpen(item.key) ? 'Collapse' : 'Expand'} ${item.label}`"
            @click="toggle(item.key)"
          >
            {{ isOpen(item.key) ? '−' : '+' }}
          </button>
        </div>
        <AvenNavList
          v-if="item.children?.length && isOpen(item.key)"
          :items="item.children"
          :active-key="activeKey"
          :expanded-keys="expanded"
          :density="density"
          :label="`${item.label} submenu`"
          :depth="depth + 1"
          @navigate="emit('navigate', $event)"
          @update:expanded-keys="setExpanded"
        />
      </li>
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
  outline: 2px solid var(--aven-color-focus-ring);
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
