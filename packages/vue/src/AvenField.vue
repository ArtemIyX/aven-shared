<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'
import type { AvenFieldProps, AvenFieldSlots } from './types.js'
import { useAvenId } from './composables.js'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenFieldProps>(), {
  required: false,
  disabled: false,
  readonly: false,
  optional: false,
  invalid: false,
  orientation: 'vertical',
  unstyled: false,
})
defineSlots<AvenFieldSlots>()
const attrs = useAttrs()
const slots = useSlots()
const generatedId = useAvenId(undefined, 'field')
const baseId = computed(() => props.id ?? generatedId)
const controlId = computed(() => props.id ?? `${baseId.value}-control`)
const descId = computed(() => `${baseId.value}-description`)
const errorId = computed(() => `${baseId.value}-error`)
const messages = computed(() =>
  Array.isArray(props.error) ? props.error : props.error ? [props.error] : [],
)
const hasDescription = computed(() => !!props.description || !!slots.description)
const hasError = computed(() => messages.value.length > 0 || !!slots.error)
const invalidState = computed(() => props.invalid || hasError.value)
const forwardedAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return { ...rest, ...props.ui?.root?.attrs }
})
</script>
<template>
  <div
    v-bind="forwardedAttrs"
    :class="[
      'aven-field',
      `is-${orientation}`,
      { 'is-invalid': invalidState, 'is-unstyled': unstyled },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[{ '--aven-field-label-width': props.labelWidth }, attrs.style, ui?.root?.style]"
  >
    <slot name="before" />
    <label
      v-if="label || $slots.label"
      :for="controlId"
      v-bind="ui?.label?.attrs"
      :class="['field-label', ui?.label?.class]"
      :style="ui?.label?.style"
      ><slot name="label" :required="required" :invalid="invalidState">{{ label }}</slot
      ><span v-if="required" aria-hidden="true"> *</span
      ><span v-else-if="optional" class="optional">(optional)</span></label
    >
    <div
      v-bind="ui?.control?.attrs"
      class="control-wrap"
      :class="ui?.control?.class"
      :style="ui?.control?.style"
    >
      <slot
        :control-id="controlId"
        :description-id="hasDescription ? descId : undefined"
        :error-id="hasError ? errorId : undefined"
        :invalid="invalidState"
        :control-attrs="{
          id: controlId,
          required,
          disabled,
          readonly,
          'aria-describedby':
            [hasDescription ? descId : null, hasError ? errorId : null].filter(Boolean).join(' ') ||
            undefined,
          'aria-invalid': invalidState || undefined,
        }"
      />
    </div>
    <div
      v-if="hasDescription"
      :id="descId"
      v-bind="ui?.description?.attrs"
      :class="['field-description', ui?.description?.class]"
      :style="ui?.description?.style"
    >
      <slot name="description">{{ description }}</slot>
    </div>
    <div
      v-if="hasError"
      :id="errorId"
      role="alert"
      v-bind="ui?.error?.attrs"
      :class="['field-error', ui?.error?.class]"
      :style="ui?.error?.style"
    >
      <slot name="error" :messages="messages">{{ messages.join(' ') }}</slot>
    </div>
    <slot name="after" />
    <slot name="actions" />
  </div>
</template>
<style scoped>
.aven-field {
  display: flex;
  flex-direction: column;
  gap: var(--aven-space-2);
  min-inline-size: 0;
  color: var(--aven-color-text-primary);
}
.is-horizontal {
  display: grid;
  grid-template-columns: minmax(var(--aven-field-label-width, 8rem), auto) minmax(0, 1fr);
  align-items: start;
  column-gap: var(--aven-space-4);
}
.field-label {
  font-weight: 600;
}
.optional,
.field-description {
  color: var(--aven-color-text-secondary);
  font-size: var(--aven-font-size-sm);
}
.field-error {
  color: var(--aven-color-danger-text);
  font-size: var(--aven-font-size-sm);
}
.control-wrap {
  min-inline-size: 0;
}
.is-unstyled {
  gap: 0;
}
@media (max-width: 32rem) {
  .is-horizontal {
    display: flex;
  }
}
</style>
