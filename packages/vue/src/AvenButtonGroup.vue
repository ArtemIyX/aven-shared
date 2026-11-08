<script setup lang="ts">
import { useAttrs } from 'vue'
import type { AvenButtonGroupProps, AvenButtonGroupSlots } from './types.js'
defineOptions({ inheritAttrs: false })
withDefaults(defineProps<AvenButtonGroupProps>(), {
  orientation: 'horizontal',
  attached: false,
  size: 'md',
  unstyled: false,
})
defineSlots<AvenButtonGroupSlots>()
const attrs = useAttrs()
</script>
<template>
  <div
    v-bind="{ ...attrs, ...ui?.root?.attrs }"
    :role="label ? 'group' : undefined"
    :aria-label="label"
    :class="[
      'aven-button-group',
      `is-${orientation}`,
      `size-${size}`,
      { 'is-attached': attached, 'is-unstyled': unstyled },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[attrs.style, ui?.root?.style]"
  >
    <slot />
  </div>
</template>
<style scoped>
.aven-button-group {
  display: inline-flex;
  align-items: center;
  gap: var(--aven-space-2);
  max-inline-size: 100%;
  flex-wrap: wrap;
}
.is-vertical {
  flex-direction: column;
  align-items: stretch;
}
.is-attached {
  gap: 0;
}
.is-attached.is-horizontal > :deep(*) {
  border-radius: 0;
}
.is-attached.is-horizontal > :deep(:first-child) {
  border-start-start-radius: var(--aven-radius-md);
  border-end-start-radius: var(--aven-radius-md);
}
.is-attached.is-horizontal > :deep(:last-child) {
  border-start-end-radius: var(--aven-radius-md);
  border-end-end-radius: var(--aven-radius-md);
}
.is-attached.is-vertical > :deep(*) {
  border-radius: 0;
}
.is-attached.is-vertical > :deep(:first-child) {
  border-start-start-radius: var(--aven-radius-md);
  border-start-end-radius: var(--aven-radius-md);
}
.is-attached.is-vertical > :deep(:last-child) {
  border-end-start-radius: var(--aven-radius-md);
  border-end-end-radius: var(--aven-radius-md);
}
.is-unstyled {
  gap: 0;
}
.size-xs :deep(.aven-button) {
  min-block-size: 1.5rem;
  padding-inline: var(--aven-space-2);
  font-size: var(--aven-font-size-xs);
}
.size-sm :deep(.aven-button) {
  min-block-size: 1.875rem;
  padding-inline: var(--aven-space-3);
  font-size: var(--aven-font-size-sm);
}
.size-lg :deep(.aven-button) {
  min-block-size: 2.75rem;
}
</style>
