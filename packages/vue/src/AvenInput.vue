<script setup lang="ts">
import { computed, ref, watch, useAttrs } from 'vue'
import type { AvenInputEvents, AvenInputProps } from './types.js'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenInputProps>(), {
  defaultValue: '',
  type: 'text',
  disabled: false,
  readonly: false,
  invalid: false,
  required: false,
  clearable: false,
  clearLabel: 'Clear',
  unstyled: false,
})
const emit = defineEmits<AvenInputEvents>()
const attrs = useAttrs()
const local = ref(props.defaultValue)
const value = computed(() => (props.modelValue !== undefined ? props.modelValue : local.value))
const inputEl = ref<HTMLInputElement>()
watch(
  () => props.modelValue,
  (v) => {
    if (v !== undefined) local.value = v
  },
)
function onInput(e: Event) {
  const el = e.target as HTMLInputElement
  if (!props.disabled && !props.readonly) {
    local.value = el.value
    emit('update:modelValue', el.value)
  }
  emit('input', e)
}
function clear(e: MouseEvent) {
  if (props.disabled || props.readonly) return
  const previousValue = value.value
  local.value = ''
  emit('update:modelValue', '')
  emit('clear', { previousValue, originalEvent: e })
  inputEl.value?.focus()
}
function onCompositionStart(event: CompositionEvent) {
  emit('compositionstart', event)
}
function onCompositionEnd(event: CompositionEvent) {
  emit('compositionend', event)
}
defineExpose({
  focus: () => inputEl.value?.focus(),
  blur: () => inputEl.value?.blur(),
  select: () => inputEl.value?.select(),
})
</script>
<template>
  <span
    :class="[
      'aven-input',
      {
        'is-invalid': invalid,
        'is-disabled': disabled,
        'is-unstyled': unstyled,
      },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[attrs.style, ui?.root?.style]"
  >
    <span v-if="$slots.leading || $slots.prefix" :class="ui?.leading?.class">
      <slot name="leading" />
      <slot name="prefix" />
    </span>
    <input
      ref="inputEl"
      v-bind="{ ...attrs, ...ui?.control?.attrs }"
      :class="['input-control', ui?.control?.class]"
      :style="ui?.control?.style"
      :id="id"
      :name="name"
      :type="type"
      :value="value"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :autocomplete="autocomplete"
      :inputmode="inputmode"
      :aria-invalid="invalid || undefined"
      @input="onInput"
      @change="emit('change', ($event.target as HTMLInputElement).value)"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
      @compositionstart="onCompositionStart"
      @compositionend="onCompositionEnd"
    />
    <button
      v-if="clearable && value && !disabled && !readonly"
      type="button"
      class="clear-button"
      :aria-label="clearLabel"
      @click="clear"
    >
      <slot name="clear-icon">×</slot>
    </button>
    <span v-if="$slots.trailing || $slots.suffix" :class="ui?.trailing?.class">
      <slot name="trailing" />
      <slot name="suffix" />
    </span>
  </span>
</template>
<style scoped>
.aven-input {
  display: flex;
  align-items: center;
  gap: var(--aven-space-2);
  min-block-size: 2.25rem;
  padding-inline: var(--aven-space-3);
  border: 1px solid var(--aven-color-border-interactive);
  border-radius: var(--aven-radius-md);
  background: var(--aven-color-surface-base);
  color: var(--aven-color-text-primary);
}
.aven-input:focus-within {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 1px;
}
.aven-input.is-invalid {
  border-color: var(--aven-color-border-invalid);
}
.aven-input.is-disabled {
  background: var(--aven-color-surface-disabled);
}
.input-control {
  min-inline-size: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: inherit;
  font: inherit;
}
.input-control::placeholder {
  color: var(--aven-color-text-placeholder);
}
.input-control:disabled {
  color: var(--aven-color-text-disabled);
}
.clear-button {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  padding: 0.25rem;
}
.is-unstyled {
  border: 0;
  border-radius: 0;
  padding: 0;
}
.is-unstyled:focus-within {
  outline: 2px solid var(--aven-color-focus-ring);
}
</style>
