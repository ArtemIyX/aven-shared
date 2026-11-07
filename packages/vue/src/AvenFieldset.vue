<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'
import type { AvenFieldsetProps, AvenFieldsetSlots } from './types.js'
import { useAvenId } from './composables.js'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenFieldsetProps>(), {
  disabled: false,
  required: false,
  invalid: false,
  unstyled: false,
})
const attrs = useAttrs()
const slots = useSlots()
defineSlots<AvenFieldsetSlots>()
const descriptionId = computed(() =>
  props.description || slots.description || props.ui?.description?.attrs?.id
    ? ((props.ui?.description?.attrs?.id as string | undefined) ??
      ((attrs.id as string | undefined) ? `${attrs.id}-description` : generatedId))
    : undefined,
)
const generatedId = useAvenId(undefined, 'fieldset-description')
const forwardedAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return { ...rest, ...props.ui?.root?.attrs }
})
</script>
<template>
  <fieldset
    v-bind="forwardedAttrs"
    :disabled="disabled"
    :aria-invalid="invalid || undefined"
    :aria-describedby="descriptionId"
    :class="[
      'aven-fieldset',
      { 'is-invalid': invalid, 'is-unstyled': unstyled },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[attrs.style, ui?.root?.style]"
  >
    <legend :class="['fieldset-legend', ui?.legend?.class]" :style="ui?.legend?.style">
      <slot name="legend">{{ legend }}</slot
      ><span v-if="required" aria-hidden="true"> *</span>
    </legend>
    <p
      v-if="description || $slots.description"
      :id="descriptionId"
      :class="['fieldset-description', ui?.description?.class]"
      :style="ui?.description?.style"
    >
      <slot name="description">{{ description }}</slot>
    </p>
    <div :class="['fieldset-content', ui?.content?.class]" :style="ui?.content?.style">
      <slot />
    </div>
  </fieldset>
</template>
<style scoped>
.aven-fieldset {
  min-inline-size: 0;
  margin: 0;
  padding: var(--aven-space-4);
  border: 1px solid var(--aven-color-border-subtle);
  border-radius: var(--aven-radius-md);
  color: var(--aven-color-text-primary);
}
.fieldset-legend {
  padding-inline: var(--aven-space-2);
  font-weight: 600;
}
.fieldset-description {
  margin: 0 0 var(--aven-space-3);
  color: var(--aven-color-text-secondary);
  font-size: var(--aven-font-size-sm);
}
.fieldset-content {
  display: flex;
  flex-direction: column;
  gap: var(--aven-space-4);
}
.is-invalid {
  border-color: var(--aven-color-border-invalid);
}
.is-unstyled {
  padding: 0;
  border: 0;
  border-radius: 0;
}
</style>
