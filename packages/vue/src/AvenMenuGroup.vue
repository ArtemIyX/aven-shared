<script setup lang="ts">
import { useAvenId } from './composables.js'
import type { AvenMenuGroupProps, AvenMenuGroupSlots } from './types.js'
const props = withDefaults(defineProps<AvenMenuGroupProps>(), { unstyled: false })
const groupId = useAvenId(props.id, 'menu-group')
defineSlots<AvenMenuGroupSlots>()
</script>
<template>
  <div
    v-bind="ui?.root?.attrs"
    :role="decorative ? 'presentation' : 'group'"
    :aria-labelledby="label && !decorative ? `${groupId}-label` : undefined"
    :class="['aven-menu-group', { 'is-unstyled': unstyled }, ui?.root?.class]"
    :style="ui?.root?.style"
  >
    <div
      v-if="(label || $slots.label) && !decorative"
      v-bind="ui?.label?.attrs"
      :id="`${groupId}-label`"
      :class="['group-label', ui?.label?.class]"
      :style="ui?.label?.style"
    >
      <slot name="label">{{ label }}</slot>
    </div>
    <slot />
  </div>
</template>
<style scoped>
.aven-menu-group {
  display: flex;
  flex-direction: column;
  min-inline-size: 0;
}
.group-label {
  padding: var(--aven-space-2) var(--aven-space-3);
  color: var(--aven-color-text-secondary);
  font-size: var(--aven-font-size-xs);
  font-weight: 600;
}
.is-unstyled {
  border: 0;
}
</style>
