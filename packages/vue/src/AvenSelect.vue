<script setup lang="ts" generic="T extends string | number">
import { computed, onBeforeUnmount, onMounted, ref, watch, useAttrs } from 'vue'
import type { AvenOption, AvenUi } from './types.js'
defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    modelValue?: T | null
    defaultValue?: T | null
    options: AvenOption<T>[]
    placeholder?: string
    name?: string
    id?: string
    required?: boolean
    disabled?: boolean
    readonly?: boolean
    invalid?: boolean
    unstyled?: boolean
    ui?: AvenUi<'root' | 'control' | 'leading' | 'trailing'>
  }>(),
  {
    defaultValue: null,
    required: false,
    disabled: false,
    readonly: false,
    invalid: false,
    unstyled: false,
  },
)
const emit = defineEmits<{
  'update:modelValue': [value: T | null]
  change: [value: T | null]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()
const attrs = useAttrs(),
  local = ref<T | null>(props.defaultValue),
  control = ref<HTMLSelectElement>()
const value = computed(() => (props.modelValue !== undefined ? props.modelValue : local.value))
const optionsMap = computed(() => new Map(props.options.map((o, i) => [String(i), o.value])))
const selectedKey = computed(() => {
  if (value.value === null) return ''
  const i = props.options.findIndex((o) => Object.is(o.value, value.value))
  return i < 0 ? '' : String(i)
})
watch(
  () => props.modelValue,
  (v) => {
    if (v !== undefined) local.value = v
  },
)
function changed(e: Event) {
  if (props.readonly) {
    if (control.value) control.value.value = selectedKey.value
    return
  }
  const key = (e.target as HTMLSelectElement).value,
    next = key === '' ? null : ((optionsMap.value.get(key) ?? null) as T | null)
  local.value = next
  emit('update:modelValue', next)
  emit('change', next)
}
function reset() {
  if (props.modelValue === undefined) local.value = props.defaultValue ?? null
}
let form: HTMLFormElement | null = null
onMounted(() => {
  form = control.value?.form ?? null
  form?.addEventListener('reset', reset)
})
onBeforeUnmount(() => form?.removeEventListener('reset', reset))
defineExpose({ focus: () => control.value?.focus(), blur: () => control.value?.blur() })
</script>
<template>
  <div
    :class="[
      'aven-select',
      { 'is-invalid': invalid, 'is-disabled': disabled, 'is-unstyled': unstyled },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[attrs.style, ui?.root?.style]"
  >
    <span v-if="$slots.leading" :class="ui?.leading?.class"><slot name="leading" /></span
    ><select
      ref="control"
      v-bind="{ ...attrs, ...ui?.control?.attrs }"
      :id="id"
      :class="['select-control', ui?.control?.class]"
      :style="ui?.control?.style"
      :value="selectedKey"
      :required="required"
      :disabled="disabled"
      :aria-readonly="readonly || undefined"
      :aria-invalid="invalid || undefined"
      :tabindex="readonly ? 0 : undefined"
      @change="changed"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    >
      <option value="" :disabled="required">{{ placeholder ?? 'Select an option' }}</option>
      <template v-for="(option, index) in options" :key="String(option.value)"
        ><option :value="String(index)" :disabled="option.disabled">
          {{ option.label }}
        </option></template
      ></select
    ><input v-if="name" type="hidden" :name="name" :value="value ?? ''" :disabled="disabled" /><span
      v-if="$slots.trailing"
      :class="ui?.trailing?.class"
      ><slot name="trailing"
    /></span>
  </div>
</template>
<style scoped>
.aven-select {
  position: relative;
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
.aven-select:focus-within {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 1px;
}
.select-control {
  flex: 1;
  min-inline-size: 0;
  min-block-size: inherit;
  padding-block: var(--aven-space-2);
  border: 0;
  outline: 0;
  background: transparent;
  color: inherit;
  font: inherit;
}
.select-control option {
  background: var(--aven-color-surface-base);
  color: var(--aven-color-text-primary);
}
.is-invalid {
  border-color: var(--aven-color-border-invalid);
}
.is-disabled {
  background: var(--aven-color-surface-disabled);
  color: var(--aven-color-text-disabled);
}
.is-unstyled {
  border: 0;
  border-radius: 0;
  padding: 0;
}
</style>
