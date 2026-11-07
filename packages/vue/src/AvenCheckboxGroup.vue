<script setup lang="ts" generic="T extends string | number">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
  useAttrs,
  useSlots,
} from 'vue'
import type {
  AvenCheckboxGroupEvents,
  AvenCheckboxGroupProps,
  AvenCheckboxGroupSlots,
  AvenOption,
} from './types.js'
import { useAvenId } from './composables.js'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenCheckboxGroupProps<T>>(), {
  defaultValue: () => [],
  orientation: 'vertical',
  disabled: false,
  invalid: false,
  unstyled: false,
})
const emit = defineEmits<AvenCheckboxGroupEvents<T>>()
defineSlots<AvenCheckboxGroupSlots<T>>()
const attrs = useAttrs(),
  slots = useSlots(),
  local = shallowRef<T[]>([...props.defaultValue]),
  group = ref<HTMLFieldSetElement>(),
  inputs = ref<Array<HTMLInputElement | undefined>>([])
const initialValue = [...props.defaultValue]
const baseId = useAvenId(typeof attrs.id === 'string' ? attrs.id : undefined, 'checkbox-group')
const descriptionId = computed(() =>
  props.description || slots.description ? `${baseId}-description` : undefined,
)
const errorId = computed(() => (props.error || slots.error ? `${baseId}-error` : undefined))
const describedBy = computed(
  () =>
    [attrs['aria-describedby'], descriptionId.value, errorId.value].filter(Boolean).join(' ') ||
    undefined,
)
const value = computed(() => (props.modelValue !== undefined ? props.modelValue : local.value))
watch(
  () => props.modelValue,
  (v) => {
    if (v !== undefined) local.value = [...v]
  },
)
async function toggle(item: AvenOption<T>, event: Event) {
  const input = event.target as HTMLInputElement
  const restore = () => {
    input.checked = value.value.some((v) => Object.is(v, item.value))
  }
  if (props.disabled || item.disabled) {
    restore()
    return
  }
  const has = value.value.some((v) => Object.is(v, item.value))
  if (!has && props.max !== undefined && value.value.length >= props.max) {
    emit('limit', { kind: 'max', value: item.value })
    restore()
    return
  }
  if (has && props.min !== undefined && value.value.length <= props.min) {
    emit('limit', { kind: 'min', value: item.value })
    restore()
    return
  }
  const next = has
    ? value.value.filter((v) => !Object.is(v, item.value))
    : [...value.value, item.value]
  local.value = next
  emit('update:modelValue', next)
  emit('change', next)
  await nextTick()
  if (props.modelValue !== undefined) restore()
}
function reset(event: Event) {
  queueMicrotask(async () => {
    if (event.defaultPrevented) return
    const next = [...initialValue]
    local.value = next
    if (props.modelValue !== undefined) emit('update:modelValue', next)
    await nextTick()
    if (props.modelValue !== undefined) {
      props.items.forEach((item, index) => {
        if (inputs.value[index])
          inputs.value[index]!.checked = value.value.some((v) => Object.is(v, item.value))
      })
    }
  })
}
let form: HTMLFormElement | null = null
onMounted(() => {
  form = group.value?.form ?? group.value?.closest('form') ?? null
  form?.addEventListener('reset', reset)
})
onBeforeUnmount(() => form?.removeEventListener('reset', reset))
</script>
<template>
  <fieldset
    ref="group"
    v-bind="{ ...attrs, ...ui?.root?.attrs }"
    :disabled="disabled"
    :aria-invalid="invalid || !!error || !!$slots.error || undefined"
    :aria-describedby="describedBy"
    :class="[
      'aven-checkbox-group',
      `is-${orientation}`,
      { 'is-invalid': invalid || !!error || !!$slots.error, 'is-unstyled': unstyled },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[attrs.style, ui?.root?.style]"
  >
    <legend
      v-bind="ui?.legend?.attrs"
      :class="['checkbox-legend', ui?.legend?.class]"
      :style="ui?.legend?.style"
    >
      <slot name="label">{{ label }}</slot>
    </legend>
    <div
      v-if="description || $slots.description"
      v-bind="ui?.description?.attrs"
      :id="descriptionId"
      :class="ui?.description?.class"
      :style="ui?.description?.style"
    >
      <slot name="description">{{ description }}</slot>
    </div>
    <label
      v-for="(item, index) in items"
      :key="`${typeof item.value}:${String(item.value)}`"
      v-bind="ui?.item?.attrs"
      :class="['checkbox-item', { 'is-disabled': disabled || item.disabled }, ui?.item?.class]"
      :style="ui?.item?.style"
      ><input
        :ref="
          (element) => {
            inputs[index] = element as HTMLInputElement | undefined
          }
        "
        v-bind="ui?.control?.attrs"
        type="checkbox"
        :form="typeof attrs.form === 'string' ? attrs.form : undefined"
        :class="['checkbox-control', ui?.control?.class]"
        :style="ui?.control?.style"
        :checked="value.some((v) => Object.is(v, item.value))"
        :disabled="disabled || item.disabled"
        @change="toggle(item, $event)"
      /><span aria-hidden="true" class="checkbox-indicator">{{
        value.some((v) => Object.is(v, item.value)) ? '✓' : ''
      }}</span
      ><span v-bind="ui?.label?.attrs" :class="ui?.label?.class" :style="ui?.label?.style"
        ><slot
          name="item"
          :item="item"
          :key="item.value"
          :selected="value.some((v) => Object.is(v, item.value))"
          :disabled="disabled || !!item.disabled"
          >{{ item.label }}<small v-if="item.description">{{ item.description }}</small></slot
        ></span
      ></label
    >
    <div
      v-if="error || $slots.error"
      v-bind="ui?.error?.attrs"
      :id="errorId"
      role="alert"
      :class="ui?.error?.class"
      :style="ui?.error?.style"
    >
      <slot name="error" :message="error">{{ error }}</slot>
    </div>
    <input
      v-for="item in name
        ? items.filter(
            (option) => !option.disabled && value.some((v) => Object.is(v, option.value)),
          )
        : []"
      :key="`form-${typeof item.value}:${String(item.value)}`"
      type="hidden"
      :name="name"
      :form="typeof attrs.form === 'string' ? attrs.form : undefined"
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
