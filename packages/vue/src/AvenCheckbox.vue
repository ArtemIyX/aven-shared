<script setup lang="ts">
import { computed, ref, watch, useAttrs } from 'vue'
import type { AvenUi } from './types.js'
defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    defaultValue?: boolean
    indeterminate?: boolean
    value?: string
    name?: string
    required?: boolean
    disabled?: boolean
    readonly?: boolean
    label?: string
    invalid?: boolean
    unstyled?: boolean
    ui?: AvenUi<'root' | 'control' | 'indicator' | 'label'>
  }>(),
  {
    defaultValue: false,
    indeterminate: false,
    required: false,
    disabled: false,
    readonly: false,
    invalid: false,
    unstyled: false,
  },
)
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  change: [value: boolean]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()
const attrs = useAttrs(),
  local = ref(props.defaultValue),
  el = ref<HTMLInputElement>()
const checked = computed(() => (props.modelValue !== undefined ? props.modelValue : local.value))
watch(
  () => props.modelValue,
  (v) => {
    if (v !== undefined) local.value = v
  },
)
watch(
  () => props.indeterminate,
  (v) => {
    if (el.value) el.value.indeterminate = v
  },
  { immediate: true },
)
function toggle() {
  if (props.disabled || props.readonly) return
  const next = !checked.value
  local.value = next
  emit('update:modelValue', next)
  emit('change', next)
}
defineExpose({ focus: () => el.value?.focus() })
</script>
<template>
  <label
    :class="[
      'aven-checkbox',
      {
        'is-checked': checked,
        'is-invalid': invalid,
        'is-disabled': disabled,
        'is-unstyled': unstyled,
      },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[attrs.style, ui?.root?.style]"
    ><input
      ref="el"
      v-bind="{ ...attrs, ...ui?.control?.attrs }"
      :class="['checkbox-native', ui?.control?.class]"
      :style="ui?.control?.style"
      type="checkbox"
      :name="name"
      :value="value"
      :checked="checked"
      :required="required"
      :disabled="disabled"
      :readonly="readonly"
      :aria-invalid="invalid || undefined"
      @click.prevent="toggle"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    /><span
      aria-hidden="true"
      :class="['checkbox-indicator', ui?.indicator?.class]"
      :style="ui?.indicator?.style"
      >{{ indeterminate ? '−' : checked ? '✓' : '' }}</span
    ><span
      v-if="label || $slots.default"
      :class="['checkbox-label', ui?.label?.class]"
      :style="ui?.label?.style"
      ><slot>{{ label }}</slot></span
    ></label
  >
</template>
<style scoped>
.aven-checkbox {
  display: inline-flex;
  align-items: flex-start;
  gap: var(--aven-space-2);
  position: relative;
  color: var(--aven-color-text-primary);
  cursor: pointer;
}
.checkbox-native {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  opacity: 0;
}
.checkbox-indicator {
  display: grid;
  place-items: center;
  flex: none;
  inline-size: 1.125rem;
  block-size: 1.125rem;
  border: 1px solid var(--aven-color-border-interactive);
  border-radius: 0.25rem;
  background: var(--aven-color-surface-base);
  color: var(--aven-color-accent-on-solid);
  font-size: 0.8rem;
}
.checkbox-native:checked + .checkbox-indicator,
.checkbox-native:indeterminate + .checkbox-indicator {
  background: var(--aven-color-accent-solid);
  border-color: var(--aven-color-accent-border);
}
.checkbox-native:focus-visible + .checkbox-indicator {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 2px;
}
.is-invalid .checkbox-indicator {
  border-color: var(--aven-color-border-invalid);
}
.is-disabled {
  color: var(--aven-color-text-disabled);
  cursor: not-allowed;
}
.is-unstyled .checkbox-indicator {
  background: transparent;
  border: 0;
}
</style>
