<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue'
import AvenField from './AvenField.vue'
import AvenInput from './AvenInput.vue'
import type { AvenPasswordFieldEvents, AvenPasswordFieldProps } from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenPasswordFieldProps>(), {
  revealed: undefined as boolean | undefined,
  defaultValue: '',
  defaultRevealed: false,
  revealable: true,
  revealLabel: 'Show password',
  hideLabel: 'Hide password',
  required: false,
  disabled: false,
  readonly: false,
  invalid: false,
  clearable: false,
  unstyled: false,
})
const emit = defineEmits<AvenPasswordFieldEvents>()
const attrs = useAttrs()
const rootClass = computed(() => attrs.class)
const rootStyle = computed(() => attrs.style)
const controlAttrs = computed(() =>
  Object.fromEntries(Object.entries(attrs).filter(([key]) => key !== 'class' && key !== 'style')),
)
const localValue = ref(props.defaultValue)
const localRevealed = ref(props.defaultRevealed)
const initialValue = props.defaultValue
const initialRevealed = props.defaultRevealed
const value = computed(() => (props.modelValue === undefined ? localValue.value : props.modelValue))
const revealed = computed(() =>
  props.revealed === undefined ? localRevealed.value : props.revealed,
)
const control = ref<{ focus: () => void; blur: () => void; select: () => void } | null>(null)
const field = ref<{ $el: HTMLElement } | null>(null)
let nativeForm: HTMLFormElement | null = null
let resetTimer: ReturnType<typeof setTimeout> | undefined
watch(
  () => props.modelValue,
  (next) => {
    if (next !== undefined) localValue.value = next
  },
)
function onFormReset(event: Event) {
  if (resetTimer !== undefined) clearTimeout(resetTimer)
  resetTimer = setTimeout(() => {
    resetTimer = undefined
    if (event.defaultPrevented) return
    localValue.value = initialValue
    if (props.modelValue !== undefined) emit('update:modelValue', initialValue)
    localRevealed.value = initialRevealed
    if (props.revealed !== undefined) emit('update:revealed', initialRevealed)
  }, 0)
}
onMounted(() => {
  nativeForm = field.value?.$el.querySelector('input')?.form ?? null
  nativeForm?.addEventListener('reset', onFormReset)
})
onBeforeUnmount(() => {
  if (resetTimer !== undefined) clearTimeout(resetTimer)
  nativeForm?.removeEventListener('reset', onFormReset)
})
watch(
  () => props.revealed,
  (next) => {
    if (next !== undefined) localRevealed.value = next
  },
)
function setRevealed(next: boolean) {
  if (!props.revealable || props.disabled) return
  localRevealed.value = next
  emit('update:revealed', next)
}
function onValue(next: string) {
  if (props.disabled || props.readonly) return
  localValue.value = next
  emit('update:modelValue', next)
}
defineExpose({
  focus: () => control.value?.focus(),
  blur: () => control.value?.blur(),
  select: () => control.value?.select(),
})
</script>

<template>
  <AvenField
    ref="field"
    :id="id"
    :label="label"
    :description="description"
    :error="error"
    :required="required"
    :invalid="invalid"
    :unstyled="unstyled"
    :class="rootClass"
    :style="rootStyle"
  >
    <template #default="{ controlId, controlAttrs: fieldAttrs }">
      <AvenInput
        ref="control"
        v-bind="{ ...controlAttrs, ...fieldAttrs }"
        :id="controlId"
        :name="name"
        :model-value="value"
        :reset-on-form="false"
        :type="revealed ? 'text' : 'password'"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :invalid="invalid || !!error"
        :autocomplete="autocomplete"
        :clearable="clearable"
        :unstyled="unstyled"
        :ui="ui"
        @update:model-value="onValue"
        @change="emit('change', $event)"
        @clear="emit('clear', $event)"
        @focus="emit('focus', $event)"
        @blur="emit('blur', $event)"
      >
        <template #leading v-if="$slots.leading || $slots.prefix"
          ><slot name="leading" /><slot name="prefix"
        /></template>
        <template #trailing
          ><slot name="trailing" /><slot name="suffix" /><button
            v-if="revealable"
            v-bind="ui?.revealButton?.attrs"
            type="button"
            :disabled="disabled"
            :aria-label="revealed ? hideLabel : revealLabel"
            :aria-pressed="revealed"
            :class="['password-reveal', ui?.revealButton?.class]"
            :style="ui?.revealButton?.style"
            @click="setRevealed(!revealed)"
          >
            <slot name="reveal-icon" :revealed="revealed">{{ revealed ? 'Hide' : 'Show' }}</slot>
          </button></template
        >
        <template #clear-icon v-if="$slots['clear-icon']"><slot name="clear-icon" /></template>
      </AvenInput>
    </template>
    <template #label="scope" v-if="label || $slots.label"
      ><slot name="label" v-bind="scope">{{ label }}</slot></template
    >
    <template #description v-if="description || $slots.description"
      ><slot name="description">{{ description }}</slot></template
    >
    <template #error="scope" v-if="error || $slots.error"
      ><slot name="error" v-bind="scope"
    /></template>
  </AvenField>
</template>

<style scoped>
.password-reveal {
  flex: none;
  padding: 0.25rem;
  border: 0;
  border-radius: var(--aven-radius-sm);
  background: transparent;
  color: var(--aven-color-text-link);
  font: inherit;
  cursor: pointer;
}
.password-reveal:focus-visible {
  outline: 0.125rem solid var(--aven-color-focus-ring);
  outline-offset: 0.125rem;
}
.password-reveal:disabled {
  color: var(--aven-color-text-disabled);
  cursor: not-allowed;
}
</style>
