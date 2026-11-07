<script setup lang="ts">
import { toRefs, useAttrs } from 'vue'
import type { AvenSeparatorProps, AvenSeparatorSlots } from './types.js'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenSeparatorProps>(), {
  orientation: 'horizontal',
  decorative: true,
  unstyled: false,
})
const { orientation, decorative, inset, unstyled, ui } = toRefs(props)
const attrs = useAttrs()
defineSlots<AvenSeparatorSlots>()
</script>
<template>
  <div
    v-bind="{ ...attrs, ...ui?.root?.attrs }"
    :class="[
      'aven-separator',
      `is-${orientation}`,
      { 'is-unstyled': unstyled },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[{ marginInlineStart: inset }, attrs.style, ui?.root?.style]"
    :role="decorative ? undefined : 'separator'"
    :aria-orientation="decorative ? undefined : orientation"
    :aria-hidden="decorative || undefined"
  >
    <span v-if="$slots.label" :class="ui?.label?.class"><slot name="label" /></span><slot />
  </div>
</template>
<style scoped>
.aven-separator {
  display: flex;
  align-items: center;
  gap: var(--aven-space-3);
  color: var(--aven-color-text-secondary);
}
.aven-separator::before,
.aven-separator::after {
  content: '';
  flex: 1;
  background: var(--aven-color-border-subtle);
}
.is-horizontal {
  inline-size: 100%;
  min-block-size: 1px;
}
.is-horizontal::before,
.is-horizontal::after {
  block-size: 1px;
}
.is-vertical {
  align-self: stretch;
  flex-direction: column;
  min-inline-size: 1px;
}
.is-vertical::before,
.is-vertical::after {
  inline-size: 1px;
}
.is-unstyled::before,
.is-unstyled::after {
  display: none;
}
</style>
