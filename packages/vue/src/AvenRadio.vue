<script setup lang="ts" generic="T extends string | number = string">
import { computed, nextTick, ref, useAttrs, useSlots } from 'vue'
import type { AvenRadioEvents, AvenRadioProps, AvenRadioSlots } from './types.js'
import { useAvenId } from './composables.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenRadioProps<T>>(), {
  checked: undefined as boolean | undefined,
  defaultChecked: false,
  disabled: false,
  required: false,
  invalid: false,
  unstyled: false,
})
const emit = defineEmits<AvenRadioEvents<T>>()
defineSlots<AvenRadioSlots>()
const attrs = useAttrs()
const slots = useSlots()
const input = ref<HTMLInputElement>()
const inputAttrs = computed(() =>
  Object.fromEntries(Object.entries(attrs).filter(([key]) => key !== 'class' && key !== 'style')),
)
const inputId = useAvenId(props.id, 'radio')
const descriptionId = computed(() =>
  props.description || slots.description ? `${inputId}-description` : undefined,
)

async function onChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (!target.checked) return
  emit('update:checked', true)
  emit('change', { value: props.value, checked: true, originalEvent: event })
  await nextTick()
  if (props.checked !== undefined && input.value) input.value.checked = props.checked
}
</script>

<template>
  <label
    v-bind="ui?.root?.attrs"
    :for="inputId"
    :class="[
      'aven-radio',
      {
        'is-checked': checked ?? defaultChecked,
        'is-disabled': disabled,
        'is-invalid': invalid,
        'is-unstyled': unstyled,
      },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[attrs.style, ui?.root?.style]"
  >
    <input
      ref="input"
      v-bind="{ ...inputAttrs, ...ui?.control?.attrs }"
      :id="inputId"
      :class="['radio-control', ui?.control?.class]"
      :style="ui?.control?.style"
      type="radio"
      :name="name"
      :value="String(value)"
      :checked="checked ?? defaultChecked"
      :disabled="disabled"
      :required="required"
      :aria-invalid="invalid || undefined"
      :aria-describedby="
        [attrs['aria-describedby'], descriptionId].filter(Boolean).join(' ') || undefined
      "
      @change="onChange"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    />
    <span
      v-bind="ui?.indicator?.attrs"
      aria-hidden="true"
      :class="['radio-indicator', ui?.indicator?.class]"
      :style="ui?.indicator?.style"
    />
    <span
      v-bind="ui?.label?.attrs"
      :class="['radio-copy', ui?.label?.class]"
      :style="ui?.label?.style"
    >
      <slot name="label">{{ label }}</slot>
      <span
        v-if="description || $slots.description"
        v-bind="ui?.description?.attrs"
        :id="descriptionId"
        :class="['radio-description', ui?.description?.class]"
        :style="ui?.description?.style"
      >
        <slot name="description">{{ description }}</slot>
      </span>
    </span>
  </label>
</template>

<style scoped>
.aven-radio {
  display: inline-flex;
  align-items: flex-start;
  gap: var(--aven-space-2);
  min-block-size: 2.75rem;
  min-inline-size: 2.75rem;
  padding-block: var(--aven-space-2);
  color: var(--aven-color-text-primary);
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
.radio-control:checked + .radio-indicator::after {
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
.radio-copy {
  min-inline-size: 0;
  overflow-wrap: anywhere;
}
.radio-description {
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
.is-unstyled .radio-indicator {
  border-color: currentColor;
}
@media (forced-colors: active) {
  .radio-indicator {
    border-color: ButtonText;
  }
  .is-checked .radio-indicator::after {
    background: Highlight;
  }
  .is-disabled {
    color: GrayText;
  }
}
</style>
