<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, useAttrs } from 'vue'
import type { AvenInputEvents, AvenInputProps, AvenInputSlots } from './types.js'
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
  resetOnForm: true,
  unstyled: false,
})
const emit = defineEmits<AvenInputEvents>()
defineSlots<AvenInputSlots>()
const attrs = useAttrs()
const controlAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return { ...rest, ...props.ui?.control?.attrs }
})
const initialValue = props.defaultValue
const local = ref(props.defaultValue)
const value = computed(() => (props.modelValue !== undefined ? props.modelValue : local.value))
const inputEl = ref<HTMLInputElement>()
let form: HTMLFormElement | null = null
function onReset(event: Event) {
  queueMicrotask(async () => {
    if (event.defaultPrevented) return
    if (!props.resetOnForm) {
      if (inputEl.value && props.modelValue !== undefined) inputEl.value.value = props.modelValue
      return
    }
    local.value = initialValue
    if (props.modelValue !== undefined) {
      emit('update:modelValue', initialValue)
      await nextTick()
      if (inputEl.value) inputEl.value.value = props.modelValue
    }
  })
}
onMounted(() => {
  form = inputEl.value?.form ?? null
  form?.addEventListener('reset', onReset)
})
onBeforeUnmount(() => form?.removeEventListener('reset', onReset))
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
    v-bind="ui?.root?.attrs"
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
    <span
      v-if="$slots.leading || $slots.prefix"
      v-bind="ui?.leading?.attrs"
      :class="ui?.leading?.class"
      :style="ui?.leading?.style"
    >
      <slot name="leading" />
      <slot name="prefix" />
    </span>
    <input
      v-bind="{ ...ui?.control?.attrs, ...controlAttrs }"
      ref="inputEl"
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
      v-bind="ui?.clear?.attrs"
      type="button"
      :class="['clear-button', ui?.clear?.class]"
      :style="ui?.clear?.style"
      :aria-label="clearLabel"
      @click="clear"
    >
      <slot name="clear-icon">×</slot>
    </button>
    <span
      v-if="$slots.trailing || $slots.suffix"
      v-bind="ui?.trailing?.attrs"
      :class="ui?.trailing?.class"
      :style="ui?.trailing?.style"
    >
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
