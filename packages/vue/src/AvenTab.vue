<script setup lang="ts" generic="Key extends string | number = string">
import { computed, ref, useAttrs } from 'vue'
import type { AvenTabEvents, AvenTabProps, AvenTabSlots } from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenTabProps<Key>>(), {
  disabled: false,
  unstyled: false,
})
const emit = defineEmits<AvenTabEvents>()
defineSlots<AvenTabSlots<Key>>()
const attrs = useAttrs()
const button = ref<HTMLButtonElement>()
const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return { ...rest, ...props.ui?.root?.attrs }
})
function activate(originalEvent: MouseEvent) {
  if (!props.disabled) emit('activate', { originalEvent })
}
function focus() {
  button.value?.focus()
}
function blur() {
  button.value?.blur()
}
defineExpose({ focus, blur })
</script>
<template>
  <button
    v-bind="{ ...ui?.root?.attrs, ...rootAttrs }"
    ref="button"
    :id="id"
    type="button"
    role="tab"
    :aria-selected="selected"
    :aria-controls="controls"
    :tabindex="disabled ? -1 : tabindex"
    :disabled="disabled"
    :class="[
      'aven-tab',
      { 'is-selected': selected, 'is-active': active, 'is-unstyled': unstyled },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[attrs.style, ui?.root?.style]"
    @click="activate($event)"
    @focus="emit('focus', $event)"
    @keydown="emit('keydown', $event)"
  >
    <slot :item="item" :key="item.key" :selected="selected" :active="active" :disabled="disabled">
      <slot name="leading" :item="item" />
      <span>{{ item.label }}</span>
      <slot name="badge" :item="item" />
      <slot name="trailing" :item="item" />
    </slot>
  </button>
</template>
<style scoped>
.aven-tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--aven-space-2);
  min-block-size: 2.75rem;
  max-inline-size: 100%;
  padding: var(--aven-space-2) var(--aven-space-4);
  border: 0;
  border-block-end: 0.125rem solid transparent;
  background: transparent;
  color: var(--aven-color-text-secondary);
  font: inherit;
  text-align: start;
  white-space: normal;
  overflow-wrap: anywhere;
  cursor: pointer;
}
.aven-tab.is-selected {
  border-color: var(--aven-tab-indicator, var(--aven-color-accent-border));
  color: var(--aven-color-text-primary);
}
.aven-tab:focus-visible {
  z-index: 1;
  outline: 0.125rem solid var(--aven-color-focus-ring);
  outline-offset: -0.125rem;
}
.is-unstyled {
  border: 0;
  border-radius: 0;
  background: transparent;
}
@media (forced-colors: active) {
  .aven-tab.is-selected {
    border-color: Highlight;
  }
}
</style>
