<script setup lang="ts">
import { useAttrs } from 'vue'
import type { AvenEmptyStateEvents, AvenEmptyStateProps, AvenEmptyStateSlots } from './types.js'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenEmptyStateProps>(), {
  kind: 'empty',
  loading: false,
  unstyled: false,
})
const emit = defineEmits<AvenEmptyStateEvents>()
defineSlots<AvenEmptyStateSlots>()
const attrs = useAttrs()
</script>
<template>
  <section
    v-bind="{ ...attrs, ...ui?.root?.attrs }"
    :class="[
      'aven-empty-state',
      `kind-${kind}`,
      { 'is-loading': loading, 'is-unstyled': unstyled },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[attrs.style, ui?.root?.style]"
    :aria-busy="loading || undefined"
  >
    <span
      v-bind="ui?.icon?.attrs"
      v-if="$slots.illustration || $slots.icon"
      :class="['state-icon', ui?.icon?.class]"
      ><slot name="illustration"><slot name="icon" /></slot
    ></span>
    <h2 v-bind="ui?.title?.attrs" :class="['state-title', ui?.title?.class]">
      <slot name="title">{{ title }}</slot>
    </h2>
    <p
      v-bind="ui?.description?.attrs"
      v-if="description || $slots.description || $slots.default"
      :class="['state-description', ui?.description?.class]"
    >
      <slot name="description">{{ description }}</slot
      ><slot />
    </p>
    <div
      v-bind="ui?.actions?.attrs"
      v-if="$slots.actions || kind === 'error'"
      :class="['state-actions', ui?.actions?.class]"
    >
      <slot name="actions"
        ><button
          v-if="kind === 'error'"
          type="button"
          @click="emit('retry', { originalEvent: $event })"
        >
          Try again
        </button></slot
      >
    </div>
    <div
      v-bind="ui?.footer?.attrs"
      v-if="$slots.footer"
      :class="['state-footer', ui?.footer?.class]"
    >
      <slot name="footer" />
    </div>
  </section>
</template>
<style scoped>
.aven-empty-state {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--aven-space-3);
  max-inline-size: 36rem;
  margin-inline: auto;
  padding: var(--aven-space-8);
  text-align: center;
  color: var(--aven-color-text-primary);
}
.state-icon {
  font-size: 2rem;
  color: var(--aven-color-icon-secondary);
}
.state-title {
  margin: 0;
  font-size: var(--aven-font-size-xl);
}
.state-description {
  margin: 0;
  color: var(--aven-color-text-secondary);
  max-inline-size: 60ch;
}
.state-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--aven-space-3);
}
.state-actions button {
  font: inherit;
  padding: var(--aven-space-2) var(--aven-space-4);
  border: 0.0625rem solid var(--aven-color-border-default);
  border-radius: var(--aven-radius-md);
  background: var(--aven-color-surface-base);
  color: var(--aven-color-text-primary);
  cursor: pointer;
}
.state-actions button:focus-visible {
  outline: 0.125rem solid var(--aven-color-focus-ring);
}
.state-footer {
  font-size: var(--aven-font-size-sm);
  color: var(--aven-color-text-secondary);
}
.is-unstyled {
  padding: 0;
  text-align: start;
}
</style>
