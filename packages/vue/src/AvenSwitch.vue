<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue'
import type { AvenUi } from './types.js'
import { useAvenId } from './composables.js'
defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    defaultValue?: boolean
    label: string
    labelPosition?: 'start' | 'end'
    name?: string
    checkedValue?: string
    disabled?: boolean
    readonly?: boolean
    loading?: boolean
    description?: string
    unstyled?: boolean
    ui?: AvenUi<'root' | 'control' | 'track' | 'thumb' | 'label'>
  }>(),
  {
    modelValue: undefined,
    defaultValue: false,
    labelPosition: 'end',
    checkedValue: 'on',
    disabled: false,
    readonly: false,
    loading: false,
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
  input = ref<HTMLInputElement>(),
  checked = computed(() => (props.modelValue !== undefined ? props.modelValue : local.value))
const initialValue = props.defaultValue
const descriptionId = useAvenId(undefined, 'switch-description')
const labelId = useAvenId(undefined, 'switch-label')
const controlAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return { ...rest, ...props.ui?.control?.attrs }
})
watch(
  () => props.modelValue,
  (next) => {
    if (next !== undefined) local.value = next
  },
)
let form: HTMLFormElement | null = null
function toggle() {
  if (props.disabled || props.readonly || props.loading) return
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
  form = input.value?.form ?? null
  form?.addEventListener('reset', reset)
})
onBeforeUnmount(() => form?.removeEventListener('reset', reset))
</script>
<template>
  <label
    v-bind="ui?.root?.attrs"
    :class="[
      'aven-switch',
      `label-${labelPosition}`,
      {
        'is-checked': checked,
        'is-disabled': disabled || loading,
        'is-readonly': readonly,
        'is-unstyled': unstyled,
      },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[attrs.style, ui?.root?.style]"
    ><span
      v-if="labelPosition === 'start' || $slots.label"
      :id="labelId"
      class="switch-label"
      v-bind="ui?.label?.attrs"
      :class="ui?.label?.class"
      :style="ui?.label?.style"
      ><slot name="label">{{ label }}</slot></span
    ><input
      ref="input"
      v-bind="controlAttrs"
      type="checkbox"
      role="switch"
      class="switch-native"
      :name="name"
      :value="checkedValue"
      :checked="checked"
      :disabled="disabled || loading"
      :aria-checked="checked"
      :aria-readonly="readonly || undefined"
      :aria-labelledby="labelId"
      :aria-describedby="
        [attrs['aria-describedby'], description || $slots.description ? descriptionId : null]
          .filter(Boolean)
          .join(' ') || undefined
      "
      @click.prevent="toggle"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    /><span
      v-bind="ui?.track?.attrs"
      aria-hidden="true"
      :class="['switch-track', ui?.track?.class]"
      :style="ui?.track?.style"
      ><span
        v-bind="ui?.thumb?.attrs"
        :class="['switch-thumb', ui?.thumb?.class]"
        :style="ui?.thumb?.style"
        ><slot name="thumb" :checked="checked"
          ><slot :name="checked ? 'checked-icon' : 'unchecked-icon'" /></slot></span></span
    ><span
      v-if="labelPosition === 'end' && !$slots.label"
      :id="labelId"
      class="switch-label"
      v-bind="ui?.label?.attrs"
      :class="ui?.label?.class"
      :style="ui?.label?.style"
      >{{ label }}</span
    ><span
      v-if="checked ? $slots['checked-label'] : $slots['unchecked-label']"
      aria-hidden="true"
      class="switch-state-label"
      ><slot :name="checked ? 'checked-label' : 'unchecked-label'" /></span
    ><span v-if="description || $slots.description" :id="descriptionId" class="switch-description"
      ><slot name="description">{{ description }}</slot></span
    ></label
  >
</template>
<style scoped>
.aven-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--aven-space-3);
  min-block-size: 2.5rem;
  color: var(--aven-color-text-primary);
  cursor: pointer;
}
.label-start {
  flex-direction: row-reverse;
}
.switch-native {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  opacity: 0;
}
.switch-track {
  display: inline-flex;
  align-items: center;
  inline-size: 2.5rem;
  block-size: 1.375rem;
  flex: none;
  padding: 0.125rem;
  border-radius: 999px;
  background: var(--aven-color-neutral-solid);
  transition: background 0.15s ease;
}
.switch-thumb {
  inline-size: 1.125rem;
  block-size: 1.125rem;
  border-radius: 50%;
  background: var(--aven-color-surface-base);
  box-shadow: 0 1px 2px var(--aven-color-shadow-contact);
  transition: transform 0.15s ease;
}
.is-checked .switch-track {
  background: var(--aven-color-accent-solid);
}
.is-checked .switch-thumb {
  transform: translateX(1.125rem);
}
.is-checked:dir(rtl) .switch-thumb {
  transform: translateX(-1.125rem);
}
.switch-native:focus-visible + .switch-track {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 2px;
}
.is-disabled {
  color: var(--aven-color-text-disabled);
  cursor: not-allowed;
}
.switch-description {
  font-size: var(--aven-font-size-sm);
  color: var(--aven-color-text-secondary);
}
.is-unstyled .switch-track {
  background: transparent;
  border: 1px solid currentColor;
}
.is-unstyled .switch-thumb {
  background: currentColor;
}
@media (prefers-reduced-motion: reduce) {
  .switch-track,
  .switch-thumb {
    transition: none;
  }
}
</style>
