<script setup lang="ts">
import { useAttrs } from 'vue'
import AvenToolbar from './AvenToolbar.vue'
import type { AvenActionBarEvents, AvenActionBarProps, AvenActionBarSlots } from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenActionBarProps>(), {
  orientation: 'horizontal',
  density: 'comfortable',
  wrap: true,
  keyboardNavigation: false,
  selectionCount: 0,
  clearable: false,
  clearLabel: 'Clear selection',
  unstyled: false,
})
const emit = defineEmits<AvenActionBarEvents>()
defineSlots<AvenActionBarSlots>()
const attrs = useAttrs()
</script>

<template>
  <AvenToolbar
    v-if="props.selectionCount > 0"
    v-bind="attrs"
    :label="props.label ?? `Selection actions, ${props.selectionCount} selected`"
    :orientation="props.orientation"
    :density="props.density"
    :wrap="props.wrap"
    :keyboard-navigation="props.keyboardNavigation"
    :overflow-items="props.overflowItems"
    :groups="props.groups"
    :unstyled="props.unstyled"
    :ui="props.ui"
    class="aven-action-bar"
  >
    <template v-if="$slots.selection" #start>
      <slot name="selection" :count="props.selectionCount" />
    </template>
    <template v-else #start>
      <strong>{{ props.selectionCount }} selected</strong>
    </template>
    <template v-if="$slots.actions" #end>
      <slot name="end" />
      <slot name="actions" />
      <button
        v-if="props.clearable"
        type="button"
        @click="emit('clearSelection', { originalEvent: $event })"
      >
        {{ props.clearLabel }}
      </button>
    </template>
    <template v-else #end>
      <slot name="end" />
      <button
        v-if="props.clearable"
        type="button"
        @click="emit('clearSelection', { originalEvent: $event })"
      >
        {{ props.clearLabel }}
      </button>
    </template>
    <slot />
    <template v-if="$slots.center" #center><slot name="center" /></template>
    <template v-if="$slots.overflow" #overflow="scope">
      <slot name="overflow" v-bind="scope" />
    </template>
  </AvenToolbar>
</template>

<style scoped>
.aven-action-bar {
  --aven-toolbar-gap: var(--aven-space-3);
  border-color: var(--aven-color-border-default);
  box-shadow: var(--aven-shadow-md);
}
.aven-action-bar button {
  min-block-size: 2.5rem;
  padding-inline: var(--aven-space-3);
  border: 1px solid var(--aven-color-border-default);
  border-radius: var(--aven-radius-md);
  background: var(--aven-color-surface-base);
  color: var(--aven-color-text-primary);
  font: inherit;
  cursor: pointer;
}
.aven-action-bar button:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 2px;
}
@media (max-width: 36rem) {
  .aven-action-bar {
    align-items: stretch;
  }
}
</style>
