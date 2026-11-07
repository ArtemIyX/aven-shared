<script setup lang="ts">
import type { AvenUi } from './types.js'
withDefaults(
  defineProps<{
    label: string
    value?: string | number
    orientation?: 'horizontal' | 'vertical'
    description?: string
    unstyled?: boolean
    ui?: AvenUi<'root' | 'label' | 'value' | 'description'>
  }>(),
  { orientation: 'horizontal', unstyled: false },
)
</script>
<template>
  <div
    :class="[
      'aven-property-row',
      `is-${orientation}`,
      { 'is-unstyled': unstyled },
      ui?.root?.class,
    ]"
    :style="ui?.root?.style"
  >
    <dt :class="['property-label', ui?.label?.class]" :style="ui?.label?.style">
      <slot name="label">{{ label }}</slot>
    </dt>
    <dd :class="['property-value', ui?.value?.class]" :style="ui?.value?.style">
      <slot>{{ value }}</slot
      ><small
        v-if="description || $slots.description"
        :class="['property-description', ui?.description?.class]"
        ><slot name="description">{{ description }}</slot></small
      >
    </dd>
  </div>
</template>
<style scoped>
.aven-property-row {
  display: grid;
  grid-template-columns: minmax(8rem, 1fr) minmax(0, 2fr);
  gap: var(--aven-space-4);
  padding-block: var(--aven-space-3);
  border-block-end: 1px solid var(--aven-color-border-subtle);
  color: var(--aven-color-text-primary);
}
.is-vertical {
  grid-template-columns: 1fr;
  gap: var(--aven-space-1);
}
.property-label {
  color: var(--aven-color-text-secondary);
}
.property-value {
  margin: 0;
  min-inline-size: 0;
  overflow-wrap: anywhere;
  font-weight: 500;
}
.property-description {
  display: block;
  margin-block-start: 0.25rem;
  color: var(--aven-color-text-secondary);
  font-weight: 400;
}
.is-unstyled {
  border: 0;
  padding: 0;
}
@media (max-width: 32rem) {
  .is-horizontal {
    grid-template-columns: 1fr;
    gap: var(--aven-space-1);
  }
}
</style>
