<script setup lang="ts" generic="Key extends string | number">
import { computed, ref, watch } from 'vue'
import AvenNavList from './AvenNavList.vue'
import type { AvenNavItemModel, AvenUi } from './types.js'
const props = withDefaults(
  defineProps<{
    items: AvenNavItemModel<Key>[]
    activeKey?: Key
    collapsed?: boolean
    defaultCollapsed?: boolean
    width?: string
    label?: string
    collapsible?: boolean
    unstyled?: boolean
    ui?: AvenUi<'root' | 'header' | 'nav' | 'footer' | 'toggle'>
  }>(),
  {
    collapsed: undefined,
    defaultCollapsed: false,
    width: '16rem',
    label: 'Sidebar',
    collapsible: true,
    unstyled: false,
  },
)
const emit = defineEmits<{
  'update:collapsed': [value: boolean]
  navigate: [payload: { key: Key; item: AvenNavItemModel<Key>; originalEvent: MouseEvent }]
}>()
const localCollapsed = ref(props.defaultCollapsed)
const isCollapsed = computed(() => props.collapsed ?? localCollapsed.value)
watch(
  () => props.collapsed,
  (value) => {
    if (value !== undefined) localCollapsed.value = value
  },
)
function toggleCollapsed() {
  const next = !isCollapsed.value
  if (props.collapsed === undefined) localCollapsed.value = next
  emit('update:collapsed', next)
}
</script>
<template>
  <aside
    :aria-label="props.label"
    v-bind="props.ui?.root?.attrs"
    :class="[
      'aven-sidebar',
      { 'is-collapsed': isCollapsed, 'is-unstyled': props.unstyled },
      props.ui?.root?.class,
    ]"
    :style="[{ inlineSize: isCollapsed ? '4rem' : props.width }, props.ui?.root?.style]"
  >
    <header v-bind="props.ui?.header?.attrs" :class="['sidebar-header', props.ui?.header?.class]">
      <slot name="header"><slot name="brand" /></slot
      ><button
        v-bind="props.ui?.toggle?.attrs"
        v-if="props.collapsible"
        type="button"
        :class="['sidebar-toggle', props.ui?.toggle?.class]"
        :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        :aria-expanded="!isCollapsed"
        @click="toggleCollapsed"
      >
        <slot name="collapse-trigger" :collapsed="isCollapsed">{{ isCollapsed ? '›' : '‹' }}</slot>
      </button>
    </header>
    <div v-bind="props.ui?.nav?.attrs" class="sidebar-nav" :class="props.ui?.nav?.class">
      <slot
        ><AvenNavList
          :items="props.items"
          :active-key="props.activeKey"
          :label="props.label"
          @navigate="emit('navigate', $event)"
      /></slot>
    </div>
    <footer
      v-bind="props.ui?.footer?.attrs"
      v-if="$slots.footer"
      :class="['sidebar-footer', props.ui?.footer?.class]"
    >
      <slot name="footer" />
    </footer>
  </aside>
</template>
<style scoped>
.aven-sidebar {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-inline-size: 0;
  block-size: 100%;
  max-block-size: 100dvh;
  overflow: hidden;
  border-inline-end: 1px solid var(--aven-color-border-subtle);
  background: var(--aven-color-surface-sidebar);
  color: var(--aven-color-text-primary);
  transition: inline-size 0.18s ease;
}
.sidebar-header,
.sidebar-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--aven-space-3);
  padding: var(--aven-space-3);
  border-block-end: 1px solid var(--aven-color-border-subtle);
}
.sidebar-footer {
  border-block-start: 1px solid var(--aven-color-border-subtle);
  border-block-end: 0;
  margin-block-start: auto;
}
.sidebar-nav {
  overflow: auto;
  min-block-size: 0;
  flex: 1;
  padding: var(--aven-space-2);
}
.sidebar-toggle {
  flex: none;
  min-inline-size: 2.25rem;
  min-block-size: 2.25rem;
  border: 1px solid var(--aven-color-border-default);
  border-radius: var(--aven-radius-sm);
  background: var(--aven-color-surface-base);
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.sidebar-toggle:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
}
.is-collapsed .sidebar-header {
  flex-direction: column;
}
.is-unstyled {
  border: 0;
  background: transparent;
}
.is-unstyled .sidebar-header,
.is-unstyled .sidebar-footer {
  border: 0;
}
@media (prefers-reduced-motion: reduce) {
  .aven-sidebar {
    transition: none;
  }
}
</style>
