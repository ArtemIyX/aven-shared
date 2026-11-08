<script setup lang="ts">
import type { AvenFormActionsProps, AvenFormActionsSlots } from './types.js'
withDefaults(defineProps<AvenFormActionsProps>(), { align: 'end', sticky: false, unstyled: false })
defineSlots<AvenFormActionsSlots>()
</script>
<template>
  <div
    v-bind="ui?.root?.attrs"
    :class="[
      'aven-form-actions',
      `align-${align}`,
      { 'is-sticky': sticky, 'is-unstyled': unstyled },
      ui?.root?.class,
    ]"
    :style="ui?.root?.style"
  >
    <div
      v-if="$slots.secondary"
      v-bind="ui?.secondary?.attrs"
      :class="ui?.secondary?.class"
      :style="ui?.secondary?.style"
    >
      <slot name="secondary" />
    </div>
    <div
      v-bind="ui?.primary?.attrs"
      :class="['primary-actions', ui?.primary?.class]"
      :style="ui?.primary?.style"
    >
      <slot />
    </div>
  </div>
</template>
<style scoped>
.aven-form-actions {
  display: flex;
  align-items: center;
  gap: var(--aven-space-3);
  padding-block-start: var(--aven-space-3);
}
.align-start {
  justify-content: flex-start;
}
.align-center {
  justify-content: center;
}
.align-end {
  justify-content: flex-end;
}
.align-between {
  justify-content: space-between;
}
.primary-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: var(--aven-space-3);
}
.is-sticky {
  position: sticky;
  inset-block-end: 0;
  z-index: 2;
  padding: var(--aven-space-3);
  border-block-start: 1px solid var(--aven-color-border-subtle);
  background: var(--aven-color-surface-base);
}
.is-unstyled {
  padding: 0;
  border: 0;
  background: transparent;
}
</style>
