<script setup lang="ts">
import { computed, ref, useAttrs, watch } from 'vue'
import type {
  AvenToggleButtonEvents,
  AvenToggleButtonProps,
  AvenToggleButtonSlots,
} from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenToggleButtonProps>(), {
  modelValue: undefined as boolean | undefined,
  defaultValue: false,
  variant: 'outline',
  tone: 'accent',
  type: 'button',
  disabled: false,
  unstyled: false,
})
const emit = defineEmits<AvenToggleButtonEvents>()
defineSlots<AvenToggleButtonSlots>()
const attrs = useAttrs()
const localValue = ref(props.defaultValue)
const pressed = computed(() => props.modelValue ?? localValue.value)
watch(
  () => props.modelValue,
  (next) => {
    if (next !== undefined) localValue.value = next
  },
)

function toggle() {
  if (props.disabled) return
  const next = !pressed.value
  localValue.value = next
  emit('update:modelValue', next)
  emit('change', next)
}
</script>

<template>
  <button
    v-bind="{ ...attrs, ...ui?.root?.attrs }"
    :type="type"
    :disabled="disabled"
    :aria-pressed="pressed"
    :aria-label="label || undefined"
    :class="[
      'aven-toggle-button',
      `variant-${variant}`,
      { 'is-pressed': pressed, 'is-disabled': disabled, 'is-unstyled': unstyled },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[
      {
        '--toggle-tone-text': `var(--aven-color-${tone}-text)`,
        '--toggle-tone-bg': `var(--aven-color-${tone}-subtle)`,
        '--toggle-tone-border': `var(--aven-color-${tone}-border)`,
      },
      attrs.style,
      ui?.root?.style,
    ]"
    @click="toggle"
  >
    <span
      v-if="$slots.leading"
      v-bind="ui?.leading?.attrs"
      :class="ui?.leading?.class"
      :style="ui?.leading?.style"
    >
      <slot name="leading" />
    </span>
    <span
      v-bind="ui?.label?.attrs"
      :class="['toggle-label', ui?.label?.class]"
      :style="ui?.label?.style"
      ><slot
    /></span>
    <span
      v-if="$slots.trailing"
      v-bind="ui?.trailing?.attrs"
      :class="ui?.trailing?.class"
      :style="ui?.trailing?.style"
    >
      <slot name="trailing" />
    </span>
    <span
      v-if="$slots.indicator"
      v-bind="ui?.indicator?.attrs"
      aria-hidden="true"
      :class="ui?.indicator?.class"
      :style="ui?.indicator?.style"
    >
      <slot name="indicator" :pressed="pressed" />
    </span>
  </button>
</template>

<style scoped>
.aven-toggle-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--aven-space-2);
  min-inline-size: 2.75rem;
  min-block-size: 2.75rem;
  padding: var(--aven-space-2) var(--aven-space-3);
  border: 1px solid var(--aven-color-border-interactive);
  border-radius: var(--aven-radius-md);
  background: var(--aven-color-surface-base);
  color: var(--aven-color-text-primary);
  font: inherit;
  cursor: pointer;
}
.aven-toggle-button:hover:not(:disabled) {
  background: var(--aven-color-surface-hover);
}
.variant-soft {
  background: var(--toggle-tone-bg);
  color: var(--toggle-tone-text);
}
.variant-ghost {
  background: transparent;
  border-color: transparent;
}
.aven-toggle-button.is-pressed {
  border-color: var(--toggle-tone-border);
  background: var(--toggle-tone-bg);
  color: var(--toggle-tone-text);
}
.aven-toggle-button:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 2px;
}
.aven-toggle-button:disabled {
  background: var(--aven-color-surface-disabled);
  color: var(--aven-color-text-disabled);
  cursor: not-allowed;
}
.is-unstyled {
  appearance: none;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: inherit;
  padding: 0;
}
@media (forced-colors: active) {
  .aven-toggle-button {
    border-color: ButtonText;
  }
  .aven-toggle-button.is-pressed {
    border-color: Highlight;
    background: Highlight;
    color: HighlightText;
  }
  .aven-toggle-button:disabled {
    color: GrayText;
  }
}
</style>
