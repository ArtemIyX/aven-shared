<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue'
import AvenField from './AvenField.vue'
import AvenInput from './AvenInput.vue'
import type { AvenSearchFieldEvents, AvenSearchFieldProps, AvenSearchPayload } from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenSearchFieldProps>(), {
  defaultValue: '',
  debounce: 0,
  required: false,
  disabled: false,
  readonly: false,
  invalid: false,
  clearable: false,
  clearLabel: 'Clear search',
  unstyled: false,
})
const emit = defineEmits<AvenSearchFieldEvents>()
const attrs = useAttrs()
const rootClass = computed(() => attrs.class)
const rootStyle = computed(() => attrs.style)
const controlAttrs = computed(() =>
  Object.fromEntries(Object.entries(attrs).filter(([key]) => key !== 'class' && key !== 'style')),
)
const localValue = ref(props.defaultValue)
const initialValue = props.defaultValue
const query = computed(() => (props.modelValue === undefined ? localValue.value : props.modelValue))
const composing = ref(false)
const input = ref<{ focus: () => void; blur: () => void; select: () => void } | null>(null)
const field = ref<{ $el: HTMLElement } | null>(null)
let nativeForm: HTMLFormElement | null = null
let timer: ReturnType<typeof setTimeout> | undefined
let resetTimer: ReturnType<typeof setTimeout> | undefined
watch(
  () => props.modelValue,
  (value) => {
    if (value !== undefined) localValue.value = value
  },
)
function clearSearchTimer() {
  if (timer !== undefined) clearTimeout(timer)
  timer = undefined
}
function onFormReset(event: Event) {
  if (resetTimer !== undefined) clearTimeout(resetTimer)
  resetTimer = setTimeout(() => {
    resetTimer = undefined
    if (event.defaultPrevented) return
    clearSearchTimer()
    localValue.value = initialValue
    if (props.modelValue !== undefined) emit('update:modelValue', initialValue)
  }, 0)
}
onMounted(() => {
  nativeForm = field.value?.$el.querySelector('input')?.form ?? null
  nativeForm?.addEventListener('reset', onFormReset)
})
onBeforeUnmount(() => {
  clearSearchTimer()
  if (resetTimer !== undefined) clearTimeout(resetTimer)
  nativeForm?.removeEventListener('reset', onFormReset)
})
watch(
  () => [props.disabled, props.readonly],
  ([disabled, readonly]) => {
    if (disabled || readonly) clearSearchTimer()
  },
)
function scheduleSearch(value: string) {
  if (timer !== undefined) clearTimeout(timer)
  timer = undefined
  if (props.debounce <= 0) {
    emit('search', { query: value })
    return
  }
  timer = setTimeout(() => {
    timer = undefined
    emit('search', { query: value })
  }, props.debounce)
}
function onUpdate(value: string) {
  if (props.disabled || props.readonly) return
  localValue.value = value
  emit('update:modelValue', value)
  if (!composing.value) scheduleSearch(value)
}
function onCompositionEnd(event: CompositionEvent) {
  composing.value = false
  if (props.disabled || props.readonly) return
  scheduleSearch((event.target as HTMLInputElement).value)
}
function onKeydown(event: KeyboardEvent) {
  if (
    event.key !== 'Enter' ||
    event.isComposing ||
    composing.value ||
    event.keyCode === 229 ||
    props.disabled
  )
    return
  if (timer !== undefined) {
    clearTimeout(timer)
    timer = undefined
    emit('search', { query: query.value })
  }
  emit('submit', { query: query.value, originalEvent: event })
}
defineExpose({
  focus: () => input.value?.focus(),
  blur: () => input.value?.blur(),
  select: () => input.value?.select(),
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
    <template #default="{ controlId, descriptionId, errorId, controlAttrs: fieldAttrs }">
      <AvenInput
        ref="input"
        v-bind="{ ...controlAttrs, ...fieldAttrs }"
        :id="controlId"
        :name="name"
        type="search"
        :model-value="query"
        :reset-on-form="false"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :invalid="invalid || !!error"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :clearable="clearable"
        :clear-label="clearLabel"
        :unstyled="unstyled"
        :ui="ui"
        @update:model-value="onUpdate"
        @change="emit('change', $event)"
        @clear="emit('clear', $event)"
        @focus="emit('focus', $event)"
        @blur="emit('blur', $event)"
        @compositionstart="composing = true"
        @compositionend="onCompositionEnd"
        @keydown="onKeydown"
      >
        <template #leading v-if="$slots.leading || $slots.prefix"
          ><slot name="leading" /><slot name="prefix"
        /></template>
        <template #trailing v-if="$slots.trailing || $slots.suffix"
          ><slot name="trailing" /><slot name="suffix"
        /></template>
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
