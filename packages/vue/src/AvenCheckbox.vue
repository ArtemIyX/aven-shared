<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch, useAttrs, useSlots } from 'vue'
import type { AvenUi } from './types.js'
import { useAvenId } from './composables.js'
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
    description?: string
    invalid?: boolean
    unstyled?: boolean
    ui?: AvenUi<'root' | 'control' | 'indicator' | 'label' | 'description'>
  }>(),
  {
    modelValue: undefined,
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
  slots = useSlots(),
  local = ref(props.defaultValue),
  el = ref<HTMLInputElement>()
const descriptionId = useAvenId(undefined, 'checkbox-description')
const labelId = useAvenId(undefined, 'checkbox-label')
const initialValue = props.defaultValue
const controlAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return { ...rest, ...props.ui?.control?.attrs }
})
let form: HTMLFormElement | null = null
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
function reset(event: Event) {
  queueMicrotask(() => {
    if (event.defaultPrevented) return
    local.value = initialValue
    if (props.modelValue !== undefined) emit('update:modelValue', initialValue)
  })
}
onMounted(() => {
  if (el.value) el.value.indeterminate = props.indeterminate
  form = el.value?.form ?? null
  form?.addEventListener('reset', reset)
})
onBeforeUnmount(() => form?.removeEventListener('reset', reset))
defineExpose({ focus: () => el.value?.focus() })
</script>
<template>
  <label
    v-bind="ui?.root?.attrs"
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
      v-bind="{ ...ui?.control?.attrs, ...controlAttrs }"
      ref="el"
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
      :aria-labelledby="
        label || slots.default || slots.label
          ? labelId
          : (attrs['aria-labelledby'] as string | undefined)
      "
      :aria-describedby="
        [attrs['aria-describedby'], description || slots.description ? descriptionId : null]
          .filter(Boolean)
          .join(' ') || undefined
      "
      @click.prevent="toggle"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    /><span
      v-bind="ui?.indicator?.attrs"
      aria-hidden="true"
      :class="['checkbox-indicator', ui?.indicator?.class]"
      :style="ui?.indicator?.style"
      ><slot
        name="indicator"
        :checked="checked"
        :indeterminate="indeterminate"
        :disabled="disabled"
        >{{ indeterminate ? '−' : checked ? '✓' : '' }}</slot
      ></span
    ><span
      v-if="label || $slots.default || $slots.label || description || $slots.description"
      v-bind="ui?.label?.attrs"
      :class="['checkbox-label', ui?.label?.class]"
      :style="ui?.label?.style"
      ><span :id="labelId"
        ><slot name="label"
          ><slot>{{ label }}</slot></slot
        ></span
      ><small
        v-if="description || $slots.description"
        v-bind="ui?.description?.attrs"
        :id="descriptionId"
        :class="ui?.description?.class"
        :style="ui?.description?.style"
        ><slot name="description">{{ description }}</slot></small
      ></span
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
  inline-size: 0.0625rem;
  block-size: 0.0625rem;
  opacity: 0;
}
.checkbox-indicator {
  display: grid;
  place-items: center;
  flex: none;
  inline-size: 1.125rem;
  block-size: 1.125rem;
  border: 0.0625rem solid var(--aven-color-border-interactive);
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
  outline: 0.125rem solid var(--aven-color-focus-ring);
  outline-offset: 0.125rem;
}
.checkbox-label small {
  display: block;
  color: var(--aven-color-text-secondary);
  font-size: var(--aven-font-size-sm);
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
