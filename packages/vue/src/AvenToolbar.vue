<script setup lang="ts">
import { onBeforeUnmount, onMounted, onUpdated, ref, useAttrs } from 'vue'
import type { AvenToolbarProps, AvenToolbarSlots } from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenToolbarProps>(), {
  orientation: 'horizontal',
  density: 'comfortable',
  wrap: true,
  keyboardNavigation: false,
  unstyled: false,
})
defineSlots<AvenToolbarSlots>()
const attrs = useAttrs()
const root = ref<HTMLElement | null>(null)
const originalTabIndex = new Map<HTMLElement, string | null>()

function controls() {
  return Array.from(
    root.value?.querySelectorAll<HTMLElement>(
      'button, a[href], input:not([type="hidden"]), select, textarea, [tabindex]',
    ) ?? [],
  ).filter(
    (element) =>
      !element.hasAttribute('disabled') &&
      element.getAttribute('aria-disabled') !== 'true' &&
      !element.hidden &&
      !element.closest('[hidden], [aria-hidden="true"]'),
  )
}

function syncTabStops() {
  const items = controls()
  for (const element of items) {
    if (!originalTabIndex.has(element))
      originalTabIndex.set(element, element.getAttribute('tabindex'))
  }
  if (!props.keyboardNavigation) {
    for (const [element, initial] of originalTabIndex) {
      if (initial === null) element.removeAttribute('tabindex')
      else element.setAttribute('tabindex', initial)
    }
    return
  }
  const focused =
    typeof document === 'undefined'
      ? undefined
      : items.find((element) => element === document.activeElement)
  const first = focused ?? items[0]
  for (const element of items) element.setAttribute('tabindex', element === first ? '0' : '-1')
}

function onKeydown(event: KeyboardEvent) {
  if (!props.keyboardNavigation) return
  const items = controls()
  if (!items.length) return
  const horizontal = props.orientation === 'horizontal'
  const rtl = horizontal && getComputedStyle(root.value!).direction === 'rtl'
  let delta = 0
  if ((horizontal && event.key === 'ArrowRight') || (!horizontal && event.key === 'ArrowDown'))
    delta = rtl ? -1 : 1
  else if ((horizontal && event.key === 'ArrowLeft') || (!horizontal && event.key === 'ArrowUp'))
    delta = rtl ? 1 : -1
  const current = items.indexOf(document.activeElement as HTMLElement)
  let next = current
  if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = items.length - 1
  else if (delta) next = (Math.max(current, 0) + delta + items.length) % items.length
  else return
  event.preventDefault()
  items[next]?.focus()
  syncTabStops()
}

onMounted(syncTabStops)
onUpdated(syncTabStops)
onBeforeUnmount(() => {
  for (const [element, initial] of originalTabIndex) {
    if (initial === null) element.removeAttribute('tabindex')
    else element.setAttribute('tabindex', initial)
  }
  originalTabIndex.clear()
})
</script>

<template>
  <div
    ref="root"
    v-bind="{ ...attrs, ...props.ui?.root?.attrs }"
    :role="props.keyboardNavigation ? 'toolbar' : 'group'"
    :aria-label="props.label"
    :aria-orientation="props.keyboardNavigation ? props.orientation : undefined"
    :class="[
      'aven-toolbar',
      `is-${props.orientation}`,
      `density-${props.density}`,
      { 'is-wrapping': props.wrap, 'is-unstyled': props.unstyled },
      attrs.class,
      props.ui?.root?.class,
    ]"
    :style="[attrs.style, props.ui?.root?.style]"
    @keydown="onKeydown"
  >
    <div
      v-bind="props.ui?.start?.attrs"
      v-if="$slots.start"
      :class="['toolbar-start', props.ui?.start?.class]"
      :style="props.ui?.start?.style"
    >
      <slot name="start" />
    </div>
    <div
      v-bind="props.ui?.center?.attrs"
      v-if="$slots.center"
      :class="['toolbar-center', props.ui?.center?.class]"
      :style="props.ui?.center?.style"
    >
      <slot name="center" />
    </div>
    <div
      v-bind="props.ui?.group?.attrs"
      v-for="group in props.groups"
      :key="group.key"
      :role="group.label ? 'group' : undefined"
      :aria-label="group.label"
      :class="['toolbar-group', props.ui?.group?.class]"
      :style="props.ui?.group?.style"
    >
      <slot name="group" :group="group" :key="group.key" />
    </div>
    <slot />
    <div
      v-bind="props.ui?.end?.attrs"
      v-if="$slots.end"
      :class="['toolbar-end', props.ui?.end?.class]"
      :style="props.ui?.end?.style"
    >
      <slot name="end" />
    </div>
    <div
      v-bind="props.ui?.overflow?.attrs"
      v-if="$slots.overflow && props.overflowItems?.length"
      :class="['toolbar-overflow', props.ui?.overflow?.class]"
      :style="props.ui?.overflow?.style"
    >
      <slot name="overflow" :items="props.overflowItems" />
    </div>
  </div>
</template>

<style scoped>
.aven-toolbar {
  --aven-toolbar-gap: var(--aven-space-2);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--aven-toolbar-gap);
  min-inline-size: 0;
  padding: var(--aven-space-2);
  border: 1px solid var(--aven-color-border-subtle);
  border-radius: var(--aven-radius-lg);
  background: var(--aven-color-surface-raised);
  color: var(--aven-color-text-primary);
}
.is-horizontal.is-wrapping {
  flex-wrap: wrap;
}
.is-vertical {
  align-items: stretch;
  flex-direction: column;
}
.toolbar-start,
.toolbar-center,
.toolbar-end,
.toolbar-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--aven-toolbar-gap);
  min-inline-size: 0;
}
.toolbar-center {
  flex: 1 1 auto;
  justify-content: center;
}
.toolbar-end {
  margin-inline-start: auto;
}
.toolbar-overflow {
  display: flex;
  align-items: center;
  flex: none;
  gap: var(--aven-toolbar-gap);
  max-inline-size: 100%;
}
.density-compact {
  --aven-toolbar-gap: var(--aven-space-1);
  padding: var(--aven-space-1);
}
.aven-toolbar :deep(:focus-visible) {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 2px;
}
.is-unstyled {
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
}
@media (forced-colors: active) {
  .aven-toolbar {
    border-color: CanvasText;
  }
}
@media print {
  .aven-toolbar {
    border-color: currentColor;
    background: transparent;
    color: currentColor;
  }
}
</style>
