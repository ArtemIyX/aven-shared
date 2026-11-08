<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import AvenEmptyState from './AvenEmptyState.vue'
import type { AvenResultStateEvents, AvenResultStateProps, AvenResultStateSlots } from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenResultStateProps>(), {
  kind: 'empty',
  layout: 'contained',
  size: 'large',
  loading: false,
  unstyled: false,
})
const emit = defineEmits<AvenResultStateEvents>()
defineSlots<AvenResultStateSlots>()
const attrs = useAttrs()
const stateProps = computed(() => {
  const { layout: _layout, size: _size, ...state } = props
  return state
})
</script>

<template>
  <AvenEmptyState
    v-bind="{ ...stateProps, ...attrs }"
    :class="['aven-result-state', `layout-${props.layout}`, `size-${props.size}`, attrs.class]"
    @retry="emit('retry', $event)"
  >
    <template v-if="$slots.illustration" #illustration><slot name="illustration" /></template>
    <template v-if="$slots.icon" #icon><slot name="icon" /></template>
    <template v-if="$slots.title" #title><slot name="title" /></template>
    <template v-if="$slots.description" #description><slot name="description" /></template>
    <template v-if="$slots.default" #default><slot /></template>
    <template v-if="$slots.actions" #actions><slot name="actions" /></template>
    <template v-if="$slots.footer" #footer><slot name="footer" /></template>
  </AvenEmptyState>
</template>

<style scoped>
:deep(.aven-empty-state.layout-inline) {
  max-inline-size: none;
  align-items: flex-start;
  padding: var(--aven-space-4);
  text-align: start;
}
:deep(.aven-empty-state.layout-full-page) {
  min-block-size: min(70vh, 44rem);
  max-inline-size: 52rem;
}
:deep(.aven-empty-state.size-compact) {
  gap: var(--aven-space-2);
  padding: var(--aven-space-4);
}
:deep(.aven-empty-state.size-compact .state-title) {
  font-size: var(--aven-font-size-lg);
}
:deep(.aven-empty-state.is-loading) {
  cursor: progress;
}
@media (max-width: 36rem) {
  :deep(.aven-empty-state.layout-full-page) {
    min-block-size: 50vh;
    padding: var(--aven-space-5);
  }
}
</style>
