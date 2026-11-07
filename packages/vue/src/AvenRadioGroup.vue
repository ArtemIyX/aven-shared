<script setup lang="ts" generic="T extends string | number">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, useAttrs, useSlots } from 'vue'
import { useAvenId } from './composables.js'
import type { AvenRadioGroupEvents, AvenRadioGroupProps, AvenRadioGroupSlots } from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenRadioGroupProps<T>>(), {
  defaultValue: null,
  required: false,
  orientation: 'vertical',
  disabled: false,
  invalid: false,
  unstyled: false,
})
const emit = defineEmits<AvenRadioGroupEvents<T>>()
defineSlots<AvenRadioGroupSlots<T>>()
const attrs = useAttrs()
const slots = useSlots()
const localValue = ref<T | null>(props.defaultValue ?? null)
const initialValue = props.defaultValue ?? null
const activeValue = ref<T | null>(null)
const group = ref<HTMLFieldSetElement>()
const inputs = ref<Array<HTMLInputElement | undefined>>([])
const generatedId = useAvenId(props.id, 'radio-group')
const groupId = computed(() => props.id ?? generatedId)
const descriptionId = computed(() =>
  props.description || slots.description ? `${groupId.value}-description` : undefined,
)
const errorId = computed(() => (props.error || slots.error ? `${groupId.value}-error` : undefined))
const value = computed(() => (props.modelValue !== undefined ? props.modelValue : localValue.value))
const describedBy = computed(
  () =>
    [attrs['aria-describedby'], descriptionId.value, errorId.value].filter(Boolean).join(' ') ||
    undefined,
)
const radioName = computed(() => props.name ?? `${groupId.value}-options`)

watch(
  () => props.modelValue,
  (next) => {
    if (next !== undefined) localValue.value = next
  },
)

function syncInputs() {
  props.items.forEach((item, index) => {
    if (inputs.value[index]) inputs.value[index]!.checked = Object.is(value.value, item.value)
  })
}
async function choose(item: (typeof props.items)[number]) {
  if (props.disabled || item.disabled || Object.is(value.value, item.value)) return
  localValue.value = item.value
  emit('update:modelValue', item.value)
  emit('change', item.value)
  await nextTick()
  if (props.modelValue !== undefined) syncInputs()
}

function onFocus(item: (typeof props.items)[number], event: FocusEvent) {
  activeValue.value = item.value
  emit('focus', event)
}

function onBlur(event: FocusEvent) {
  activeValue.value = null
  emit('blur', event)
}

let resetTimer: ReturnType<typeof setTimeout> | undefined
function onReset(event: Event) {
  if (resetTimer !== undefined) clearTimeout(resetTimer)
  resetTimer = setTimeout(() => {
    resetTimer = undefined
    if (event.defaultPrevented) return
    localValue.value = initialValue
    if (props.modelValue !== undefined) {
      emit('update:modelValue', initialValue)
      void nextTick(syncInputs)
    }
  }, 0)
}

let form: HTMLFormElement | null = null
onMounted(() => {
  form = group.value?.form ?? group.value?.closest('form') ?? null
  form?.addEventListener('reset', onReset)
})
onBeforeUnmount(() => {
  if (resetTimer !== undefined) clearTimeout(resetTimer)
  form?.removeEventListener('reset', onReset)
})
</script>

<template>
  <fieldset
    ref="group"
    v-bind="{ ...attrs, ...ui?.root?.attrs }"
    :id="groupId"
    :disabled="disabled"
    :aria-invalid="invalid || !!error || undefined"
    :aria-describedby="describedBy"
    :class="[
      'aven-radio-group',
      `is-${orientation}`,
      { 'is-invalid': invalid || !!error, 'is-unstyled': unstyled },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[attrs.style, ui?.root?.style]"
  >
    <legend
      v-bind="ui?.legend?.attrs"
      :class="['radio-legend', ui?.legend?.class]"
      :style="ui?.legend?.style"
    >
      <slot name="label" :required="required" :invalid="invalid || !!error">{{ label }}</slot>
    </legend>
    <div
      v-if="description || $slots.description"
      v-bind="ui?.description?.attrs"
      :id="descriptionId"
      :class="['radio-description', ui?.description?.class]"
      :style="ui?.description?.style"
    >
      <slot name="description">{{ description }}</slot>
    </div>
    <label
      v-for="(item, index) in items"
      :key="`${typeof item.value}:${String(item.value)}`"
      v-bind="ui?.item?.attrs"
      :class="[
        'radio-item',
        { 'is-disabled': disabled || item.disabled, 'is-selected': Object.is(value, item.value) },
        ui?.item?.class,
      ]"
      :style="ui?.item?.style"
    >
      <input
        :ref="
          (element) => {
            inputs[index] = element as HTMLInputElement | undefined
          }
        "
        v-bind="ui?.control?.attrs"
        :id="`${groupId}-option-${index}`"
        :class="['radio-control', ui?.control?.class]"
        :style="ui?.control?.style"
        type="radio"
        :name="radioName"
        :form="typeof attrs.form === 'string' ? attrs.form : undefined"
        :value="String(item.value)"
        :checked="Object.is(value, item.value)"
        :disabled="disabled || item.disabled"
        :required="required"
        :aria-describedby="describedBy"
        @change="choose(item)"
        @focus="onFocus(item, $event)"
        @blur="onBlur($event)"
      />
      <slot name="indicator" :checked="Object.is(value, item.value)" :item="item" :key="item.value">
        <span
          v-bind="ui?.indicator?.attrs"
          aria-hidden="true"
          :class="['radio-indicator', ui?.indicator?.class]"
          :style="ui?.indicator?.style"
        />
      </slot>
      <slot
        name="item"
        :item="item"
        :key="item.value"
        :selected="Object.is(value, item.value)"
        :active="Object.is(activeValue, item.value)"
        :disabled="disabled || !!item.disabled"
      >
        <span v-bind="ui?.label?.attrs" :class="ui?.label?.class" :style="ui?.label?.style">
          {{ item.label }}
          <small v-if="item.description">{{ item.description }}</small>
        </span>
      </slot>
    </label>
    <div
      v-if="error || $slots.error"
      v-bind="ui?.error?.attrs"
      :id="errorId"
      role="alert"
      :class="['radio-error', ui?.error?.class]"
      :style="ui?.error?.style"
    >
      <slot name="error" :message="error">{{ error }}</slot>
    </div>
  </fieldset>
</template>

<style scoped>
.aven-radio-group {
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
.radio-legend {
  margin-block-end: var(--aven-space-2);
  font-weight: 600;
}
.radio-description,
.radio-error {
  color: var(--aven-color-text-secondary);
  font-size: var(--aven-font-size-sm);
}
.radio-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: var(--aven-space-2);
  min-block-size: 2.75rem;
  min-inline-size: 2.75rem;
  padding-block: var(--aven-space-2);
  cursor: pointer;
}
.radio-control {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.radio-indicator {
  display: grid;
  place-items: center;
  flex: none;
  inline-size: 1.125rem;
  block-size: 1.125rem;
  margin-block-start: 0.125rem;
  border: 1px solid var(--aven-color-border-interactive);
  border-radius: 50%;
  background: var(--aven-color-surface-base);
}
.is-selected .radio-indicator::after {
  content: '';
  inline-size: 0.55rem;
  block-size: 0.55rem;
  border-radius: 50%;
  background: var(--aven-color-accent-solid);
}
.radio-control:focus-visible + .radio-indicator {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 2px;
}
.radio-item > span:last-child {
  min-inline-size: 0;
  overflow-wrap: anywhere;
}
.radio-item small {
  display: block;
  color: var(--aven-color-text-secondary);
  font-size: var(--aven-font-size-sm);
}
.is-disabled {
  color: var(--aven-color-text-disabled);
  cursor: not-allowed;
}
.is-invalid .radio-indicator {
  border-color: var(--aven-color-border-invalid);
}
.radio-error {
  color: var(--aven-color-danger-text);
}
.is-unstyled .radio-indicator {
  border-color: currentColor;
}
@media (forced-colors: active) {
  .radio-indicator {
    border-color: ButtonText;
  }
  .is-selected .radio-indicator::after {
    background: Highlight;
  }
  .is-disabled {
    color: GrayText;
  }
}
</style>
