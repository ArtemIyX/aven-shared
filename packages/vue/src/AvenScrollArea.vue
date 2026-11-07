<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue'
import type { AvenScrollAreaEvents, AvenScrollAreaProps, AvenScrollAreaSlots } from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenScrollAreaProps>(), {
  type: 'auto',
  orientation: 'both',
  notifyEnd: false,
  endThreshold: 8,
  unstyled: false,
})
const emit = defineEmits<AvenScrollAreaEvents>()
defineSlots<AvenScrollAreaSlots>()
const attrs = useAttrs()
const root = ref<HTMLDivElement | null>(null)
const reached = new Set<'horizontal' | 'vertical'>()
const rootRole = computed(() =>
  typeof attrs.role === 'string' ? attrs.role : props.label ? 'region' : undefined,
)
const rootLabel = computed(() =>
  typeof attrs['aria-label'] === 'string' ? attrs['aria-label'] : props.label,
)
const rootTabIndex = computed(() =>
  typeof attrs.tabindex === 'number' || typeof attrs.tabindex === 'string' ? attrs.tabindex : 0,
)

function onScroll(event: Event) {
  emit('scroll', event)
  const element = root.value
  if (!element || !props.notifyEnd) return
  const threshold = Math.max(0, props.endThreshold)
  const direction = getComputedStyle(element).direction
  const distances: Record<'horizontal' | 'vertical', number> = {
    vertical: element.scrollHeight - element.clientHeight - element.scrollTop,
    horizontal:
      direction === 'rtl'
        ? Math.abs(element.scrollLeft)
        : element.scrollWidth - element.clientWidth - element.scrollLeft,
  }
  for (const axis of ['horizontal', 'vertical'] as const) {
    if (props.orientation !== 'both' && props.orientation !== axis) continue
    if (distances[axis] <= threshold) {
      if (!reached.has(axis)) {
        reached.add(axis)
        emit('endReached', { axis })
      }
    } else reached.delete(axis)
  }
}
</script>

<template>
  <div
    ref="root"
    v-bind="{ ...attrs, ...props.ui?.root?.attrs }"
    :role="rootRole"
    :aria-label="rootLabel"
    :tabindex="rootTabIndex"
    :class="[
      'aven-scroll-area',
      `type-${props.type}`,
      `orientation-${props.orientation}`,
      { 'is-unstyled': props.unstyled },
      attrs.class,
      props.ui?.root?.class,
    ]"
    :style="[attrs.style, props.ui?.root?.style]"
    @scroll="onScroll"
  >
    <div class="scroll-content"><slot /></div>
    <div
      v-if="$slots.corner"
      :class="['scroll-corner', props.ui?.corner?.class]"
      :style="props.ui?.corner?.style"
    >
      <slot name="corner" />
    </div>
  </div>
</template>

<style scoped>
.aven-scroll-area {
  --aven-scrollbar-size: 0.625rem;
  --aven-scrollbar-thumb: var(--aven-color-border-default);
  --aven-scrollbar-track: transparent;
  position: relative;
  min-inline-size: 0;
  min-block-size: 0;
  overflow: auto;
  overscroll-behavior: contain;
  scrollbar-color: var(--aven-scrollbar-thumb) var(--aven-scrollbar-track);
  scrollbar-width: thin;
}
.orientation-vertical {
  overflow-x: hidden;
  overflow-y: auto;
}
.orientation-horizontal {
  overflow-x: auto;
  overflow-y: hidden;
}
.orientation-both {
  overflow: auto;
}
.type-always {
  scrollbar-gutter: stable;
}
.type-hover {
  scrollbar-color: transparent transparent;
}
.type-hover:hover,
.type-hover:focus-within {
  scrollbar-color: var(--aven-scrollbar-thumb) var(--aven-scrollbar-track);
}
.aven-scroll-area::-webkit-scrollbar {
  inline-size: var(--aven-scrollbar-size);
  block-size: var(--aven-scrollbar-size);
}
.aven-scroll-area::-webkit-scrollbar-thumb {
  border: 2px solid transparent;
  border-radius: 999px;
  background: var(--aven-scrollbar-thumb);
  background-clip: padding-box;
}
.aven-scroll-area::-webkit-scrollbar-track {
  background: var(--aven-scrollbar-track);
}
.type-hover::-webkit-scrollbar-thumb {
  background: transparent;
}
.type-hover:hover::-webkit-scrollbar-thumb,
.type-hover:focus-within::-webkit-scrollbar-thumb {
  background: var(--aven-scrollbar-thumb);
  background-clip: padding-box;
}
.scroll-content {
  min-inline-size: 0;
  min-block-size: 0;
}
.scroll-corner {
  position: sticky;
  z-index: 1;
  inset-inline-end: 0;
  inset-block-end: 0;
  float: inline-end;
}
.aven-scroll-area:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: -2px;
}
.is-unstyled {
  scrollbar-width: auto;
}
@media (forced-colors: active) {
  .aven-scroll-area {
    scrollbar-color: auto;
  }
  .type-hover {
    scrollbar-color: auto;
  }
  .type-hover::-webkit-scrollbar-thumb {
    background: CanvasText;
  }
}
@media print {
  .aven-scroll-area {
    max-block-size: none;
    overflow: visible;
    scrollbar-color: auto;
  }
}
</style>
