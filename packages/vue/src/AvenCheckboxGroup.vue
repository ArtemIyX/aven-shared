<script setup lang="ts" generic="T extends string | number">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch, useAttrs } from 'vue'
import type { AvenOption, AvenUi } from './types.js'
defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    modelValue?: T[]
    defaultValue?: T[]
    items: AvenOption<T>[]
    name?: string
    label?: string
    min?: number
    max?: number
    orientation?: 'vertical' | 'horizontal'
    disabled?: boolean
    invalid?: boolean
    unstyled?: boolean
    ui?: AvenUi<'root' | 'legend' | 'item' | 'control' | 'label'>
  }>(),
  {
    defaultValue: () => [],
    orientation: 'vertical',
    disabled: false,
    invalid: false,
    unstyled: false,
  },
)
const emit = defineEmits<{
  'update:modelValue': [value: T[]]
  change: [value: T[]]
  limit: [payload: { kind: 'min' | 'max'; value: T }]
}>()
const attrs = useAttrs(),
  local = shallowRef<T[]>([...props.defaultValue]),
  group = ref<HTMLFieldSetElement>()
const value = computed(() => (props.modelValue !== undefined ? props.modelValue : local.value))
watch(
  () => props.modelValue,
  (v) => {
    if (v !== undefined) local.value = [...v]
  },
)
function toggle(item: AvenOption<T>) {
  if (props.disabled || item.disabled) return
  const has = value.value.some((v) => Object.is(v, item.value))
  if (!has && props.max !== undefined && value.value.length >= props.max) {
    emit('limit', { kind: 'max', value: item.value })
    return
  }
  if (has && props.min !== undefined && value.value.length <= props.min) {
    emit('limit', { kind: 'min', value: item.value })
    return
  }
  const next = has
    ? value.value.filter((v) => !Object.is(v, item.value))
    : [...value.value, item.value]
  local.value = next
  emit('update:modelValue', next)
  emit('change', next)
}
function reset() {
  if (props.modelValue === undefined) local.value = [...props.defaultValue]
}
let form: HTMLFormElement | null = null
onMounted(() => {
  form = group.value?.closest('form') ?? null
  form?.addEventListener('reset', reset)
})
onBeforeUnmount(() => form?.removeEventListener('reset', reset))
</script>
<template>
  <fieldset
    ref="group"
    v-bind="attrs"
    :disabled="disabled"
    :aria-invalid="invalid || undefined"
    :class="[
      'aven-checkbox-group',
      `is-${orientation}`,
      { 'is-invalid': invalid, 'is-unstyled': unstyled },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[attrs.style, ui?.root?.style]"
  >
    <legend :class="['checkbox-legend', ui?.legend?.class]" :style="ui?.legend?.style">
      <slot name="label">{{ label }}</slot>
    </legend>
    <label
      v-for="item in items"
      :key="String(item.value)"
      :class="['checkbox-item', { 'is-disabled': disabled || item.disabled }, ui?.item?.class]"
      :style="ui?.item?.style"
      ><input
        v-bind="ui?.control?.attrs"
        type="checkbox"
        :class="['checkbox-control', ui?.control?.class]"
        :style="ui?.control?.style"
        :checked="value.some((v) => Object.is(v, item.value))"
        :disabled="disabled || item.disabled"
        @change="toggle(item)"
      /><span aria-hidden="true" class="checkbox-indicator">{{
        value.some((v) => Object.is(v, item.value)) ? '✓' : ''
      }}</span
      ><span :class="ui?.label?.class"
        >{{ item.label }}<small v-if="item.description">{{ item.description }}</small></span
      ></label
    ><input
      v-for="item in items.filter((option) => value.some((v) => Object.is(v, option.value)))"
      :key="`form-${String(item.value)}`"
      type="hidden"
      :name="name"
      :value="item.value"
      :disabled="disabled"
    />
  </fieldset>
</template>
<style scoped>
.aven-checkbox-group {
  min-inline-size: 0;
  margin: 0;
  padding: 0;
  border: 0;
  display: flex;
  gap: var(--aven-space-3);
  color: var(--aven-color-text-primary);
}
.is-vertical {
  flex-direction: column;
}
.is-horizontal {
  flex-wrap: wrap;
}
.checkbox-legend {
  margin-block-end: var(--aven-space-2);
  font-weight: 600;
}
.checkbox-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: var(--aven-space-2);
  cursor: pointer;
}
.checkbox-control {
  position: absolute;
  opacity: 0;
  inline-size: 1px;
  block-size: 1px;
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
.checkbox-control:checked + .checkbox-indicator {
  background: var(--aven-color-accent-solid);
  border-color: var(--aven-color-accent-border);
}
.checkbox-control:focus-visible + .checkbox-indicator {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 2px;
}
.checkbox-item small {
  display: block;
  color: var(--aven-color-text-secondary);
  font-size: var(--aven-font-size-sm);
}
.is-disabled {
  color: var(--aven-color-text-disabled);
  cursor: not-allowed;
}
.is-invalid .checkbox-indicator {
  border-color: var(--aven-color-border-invalid);
}
.is-unstyled .checkbox-indicator {
  background: transparent;
  border-color: currentColor;
}
</style>
