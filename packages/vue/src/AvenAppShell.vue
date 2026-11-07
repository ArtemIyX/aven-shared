<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue'
import type { AvenAppShellEvents, AvenAppShellProps, AvenAppShellSlots } from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenAppShellProps>(), {
  defaultSidebarCollapsed: false,
  defaultInspectorOpen: false,
  headerSticky: true,
  sidebarLabel: 'Primary navigation',
  inspectorLabel: 'Inspector',
  unstyled: false,
})
const emit = defineEmits<AvenAppShellEvents>()
defineSlots<AvenAppShellSlots>()
const attrs = useAttrs()
const localSidebarCollapsed = ref(props.defaultSidebarCollapsed)
const localInspectorOpen = ref(props.defaultInspectorOpen)
const sidebarCollapsed = computed(() => props.sidebarCollapsed ?? localSidebarCollapsed.value)
const inspectorOpen = computed(() => props.inspectorOpen ?? localInspectorOpen.value)

function toggleSidebar() {
  const next = !sidebarCollapsed.value
  if (props.sidebarCollapsed === undefined) localSidebarCollapsed.value = next
  emit('update:sidebarCollapsed', next)
  return next
}
function toggleInspector() {
  const next = !inspectorOpen.value
  if (props.inspectorOpen === undefined) localInspectorOpen.value = next
  emit('update:inspectorOpen', next)
  return next
}

defineExpose({ toggleSidebar, toggleInspector })
</script>

<template>
  <div
    v-bind="{ ...attrs, ...props.ui?.root?.attrs }"
    :role="props.label ? 'region' : undefined"
    :aria-label="props.label"
    :class="[
      'aven-app-shell',
      {
        'has-sidebar': Boolean($slots.sidebar),
        'is-sidebar-collapsed': sidebarCollapsed,
        'has-inspector': Boolean($slots.inspector),
        'is-inspector-open': inspectorOpen,
        'has-footer': Boolean($slots.footer),
        'has-statusbar': Boolean($slots.statusbar),
        'is-unstyled': props.unstyled,
      },
      attrs.class,
      props.ui?.root?.class,
    ]"
    :style="[attrs.style, props.ui?.root?.style]"
  >
    <header
      :class="['shell-header', { 'is-sticky': props.headerSticky }, props.ui?.header?.class]"
      :style="props.ui?.header?.style"
    >
      <slot name="sidebar-toggle" :collapsed="sidebarCollapsed" :toggle="toggleSidebar" />
      <slot name="header" />
      <slot name="inspector-toggle" :open="inspectorOpen" :toggle="toggleInspector" />
    </header>
    <aside
      v-if="$slots.sidebar && !sidebarCollapsed"
      :aria-label="props.sidebarLabel"
      :class="['shell-sidebar', props.ui?.sidebar?.class]"
      :style="props.ui?.sidebar?.style"
    >
      <slot name="sidebar" />
    </aside>
    <main :class="['shell-main', props.ui?.main?.class]" :style="props.ui?.main?.style">
      <slot />
    </main>
    <aside
      v-if="$slots.inspector && inspectorOpen"
      :aria-label="props.inspectorLabel"
      :class="['shell-inspector', props.ui?.inspector?.class]"
      :style="props.ui?.inspector?.style"
    >
      <slot name="inspector" />
    </aside>
    <footer
      v-if="$slots.footer"
      :class="['shell-footer', props.ui?.footer?.class]"
      :style="props.ui?.footer?.style"
    >
      <slot name="footer" />
    </footer>
    <div
      v-if="$slots.statusbar"
      :class="['shell-statusbar', props.ui?.statusbar?.class]"
      :style="props.ui?.statusbar?.style"
    >
      <slot name="statusbar" />
    </div>
  </div>
</template>

<style scoped>
.aven-app-shell {
  --aven-shell-sidebar-size: 16rem;
  --aven-shell-inspector-size: 20rem;
  --aven-shell-divider: var(--aven-color-border-subtle);
  box-sizing: border-box;
  display: grid;
  grid-template-areas:
    'header header header'
    'sidebar main inspector'
    'footer footer footer'
    'status status status';
  grid-template-columns: 0 minmax(0, 1fr) 0;
  grid-template-rows: auto minmax(0, 1fr) auto auto;
  min-inline-size: 0;
  min-block-size: 0;
  overflow: hidden;
  background: var(--aven-color-surface-base);
  color: var(--aven-color-text-primary);
}
.has-sidebar:not(.is-sidebar-collapsed) {
  grid-template-columns: minmax(12rem, var(--aven-shell-sidebar-size)) minmax(0, 1fr) 0;
}
.has-inspector.is-inspector-open {
  grid-template-columns: minmax(0, 1fr) minmax(14rem, var(--aven-shell-inspector-size));
}
.has-inspector.is-inspector-open:not(.has-sidebar) {
  grid-template-columns: 0 minmax(0, 1fr) minmax(14rem, var(--aven-shell-inspector-size));
}
.has-sidebar:not(.is-sidebar-collapsed).has-inspector.is-inspector-open {
  grid-template-columns:
    minmax(12rem, var(--aven-shell-sidebar-size)) minmax(0, 1fr)
    minmax(14rem, var(--aven-shell-inspector-size));
}
.shell-header {
  z-index: 2;
  grid-area: header;
  display: flex;
  align-items: center;
  gap: var(--aven-space-3);
  min-inline-size: 0;
  padding: var(--aven-space-3) var(--aven-space-4);
  border-block-end: 1px solid var(--aven-shell-divider);
  background: var(--aven-color-surface-raised);
}
.shell-header.is-sticky {
  position: sticky;
  inset-block-start: 0;
}
.shell-sidebar,
.shell-inspector {
  min-inline-size: 0;
  min-block-size: 0;
  overflow: auto;
  padding: var(--aven-space-3);
  background: var(--aven-color-surface-raised);
}
.shell-sidebar {
  grid-area: sidebar;
  border-inline-end: 1px solid var(--aven-shell-divider);
}
.shell-inspector {
  grid-area: inspector;
  border-inline-start: 1px solid var(--aven-shell-divider);
}
.shell-main {
  grid-area: main;
  min-inline-size: 0;
  min-block-size: 0;
  overflow: auto;
  padding: var(--aven-space-4);
}
.shell-footer {
  grid-area: footer;
  min-inline-size: 0;
  padding: var(--aven-space-3) var(--aven-space-4);
  border-block-start: 1px solid var(--aven-shell-divider);
  background: var(--aven-color-surface-raised);
}
.shell-statusbar {
  grid-area: status;
  display: flex;
  flex-wrap: wrap;
  gap: var(--aven-space-3);
  min-inline-size: 0;
  padding: var(--aven-space-2) var(--aven-space-4);
  border-block-start: 1px solid var(--aven-shell-divider);
  background: var(--aven-color-surface-recessed);
  color: var(--aven-color-text-secondary);
  font-size: var(--aven-font-size-sm);
}
.is-unstyled {
  background: transparent;
}
.is-unstyled .shell-header,
.is-unstyled .shell-sidebar,
.is-unstyled .shell-inspector,
.is-unstyled .shell-footer,
.is-unstyled .shell-statusbar {
  border-color: transparent;
  background: transparent;
}
@media (max-width: 48rem) {
  .aven-app-shell,
  .has-sidebar:not(.is-sidebar-collapsed),
  .has-inspector.is-inspector-open,
  .has-sidebar:not(.is-sidebar-collapsed).has-inspector.is-inspector-open {
    grid-template-areas:
      'header'
      'sidebar'
      'main'
      'inspector'
      'footer'
      'status';
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto auto minmax(0, 1fr) auto auto auto;
  }
  .shell-sidebar,
  .shell-inspector {
    max-block-size: min(30vh, 16rem);
    border-inline: 0;
    border-block-end: 1px solid var(--aven-shell-divider);
  }
  .shell-main {
    padding: var(--aven-space-3);
  }
}
@media (forced-colors: active) {
  .shell-header,
  .shell-sidebar,
  .shell-inspector,
  .shell-footer,
  .shell-statusbar {
    border-color: CanvasText;
  }
}
@media print {
  .aven-app-shell {
    display: block;
    overflow: visible;
    background: transparent;
    color: currentColor;
  }
  .shell-header,
  .shell-sidebar,
  .shell-inspector,
  .shell-main,
  .shell-footer,
  .shell-statusbar {
    position: static;
    max-block-size: none;
    overflow: visible;
    break-inside: avoid;
  }
}
</style>
