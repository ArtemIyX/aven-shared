<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { AvenTimePickerEvents, AvenTimePickerProps, AvenTimePickerSlots } from './types.js'
import { useAvenId } from './composables.js'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenTimePickerProps>(), {
  defaultValue: null,
  locale: 'en',
  timeStep: 15,
  hourCycle: 'h23',
  seconds: false,
  clearable: false,
  disabled: false,
  readonly: false,
  required: false,
  unstyled: false,
})
const emit = defineEmits<AvenTimePickerEvents>(),
  slots = defineSlots<AvenTimePickerSlots>()
const controlId = useAvenId(props.id, 'time-picker')
const local = ref<string | null>(props.defaultValue ?? null),
  draft = ref(''),
  inputEl = ref<HTMLInputElement>(),
  lastCommitted = ref<string | null>(null),
  lastRequested = ref<string | null>(null)
const value = computed(() => (props.modelValue !== undefined ? props.modelValue : local.value))
watch(
  value,
  (v) => {
    draft.value = v ?? ''
    lastCommitted.value = v ?? null
    lastRequested.value = v ?? null
  },
  { immediate: true },
)
const step = computed(() => Math.max(1, props.timeStep) * 60 * (props.seconds ? 1 : 1))
const inputLocale = computed(
  () =>
    new Intl.DateTimeFormat(props.locale, {
      hour: 'numeric',
      hourCycle: props.hourCycle,
    }).resolvedOptions().locale,
)
function valid(text: string) {
  if (!new RegExp(`^(?:[01]\\d|2[0-3]):[0-5]\\d${props.seconds ? '(:[0-5]\\d)?' : ''}$`).test(text))
    return false
  const normalized = props.seconds && text.length === 5 ? `${text}:00` : text
  return (!props.min || normalized >= props.min) && (!props.max || normalized <= props.max)
}
function update(text: string) {
  if (props.disabled || props.readonly) return
  draft.value = text
  if (!text) {
    if (props.clearable) commit(null)
    return
  }
  if (valid(text)) {
    local.value = text
    if (text !== value.value && text !== lastRequested.value) {
      lastRequested.value = text
      emit('update:modelValue', text)
    }
  } else if (text.length >= 2)
    emit('invalidInput', {
      text,
      reason: /^\d{0,2}:?\d{0,2}:?\d{0,2}$/.test(text) ? 'incomplete' : 'invalid',
    })
}
function commit(next: string | null = draft.value || null) {
  if (props.disabled || props.readonly) return
  if (next && !valid(next)) {
    emit('invalidInput', { text: next, reason: 'invalid' })
    draft.value = value.value ?? ''
    return
  }
  if (next === lastCommitted.value) return
  lastCommitted.value = next
  local.value = next
  draft.value = next ?? ''
  if (next !== value.value && next !== lastRequested.value) {
    lastRequested.value = next
    emit('update:modelValue', next)
  }
  emit('change', next)
}
function reset(event: Event) {
  if (event.defaultPrevented || props.modelValue !== undefined) return
  local.value = props.defaultValue ?? null
  draft.value = local.value ?? ''
  lastCommitted.value = local.value
  lastRequested.value = local.value
}
onMounted(() => inputEl.value?.form?.addEventListener('reset', reset))
onBeforeUnmount(() => inputEl.value?.form?.removeEventListener('reset', reset))
defineExpose({ focus: () => inputEl.value?.focus(), blur: () => inputEl.value?.blur() })
</script>
<template>
  <div
    class="aven-time-picker"
    :class="[{ disabled, unstyled }, ui?.root?.class]"
    :style="ui?.root?.style"
  >
    <label v-if="label" class="label" :for="controlId"
      >{{ label }}<span v-if="required" aria-hidden="true"> *</span></label
    >
    <slot name="field" :value="draft" :disabled="disabled"
      ><input
        ref="inputEl"
        v-bind="{ ...$attrs, ...ui?.input?.attrs }"
        :id="controlId"
        :lang="inputLocale"
        type="time"
        :step="step"
        :min="min"
        :max="max"
        :name="name"
        :value="draft"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :class="ui?.input?.class"
        :style="ui?.input?.style"
        :aria-invalid="invalid || undefined"
        :aria-describedby="
          [description ? `${controlId}-description` : null, error ? `${controlId}-error` : null]
            .filter(Boolean)
            .join(' ') || undefined
        "
        @input="update(($event.target as HTMLInputElement).value)"
        @change="commit(($event.target as HTMLInputElement).value)"
        @blur="commit()"
    /></slot>
    <button
      v-if="clearable && value"
      type="button"
      :disabled="disabled || readonly"
      aria-label="Clear time"
      @click="commit(null)"
    >
      ×
    </button>
    <p v-if="description" :id="`${controlId}-description`" class="help">{{ description }}</p>
    <p
      v-if="error"
      :id="`${controlId}-error`"
      :class="['error', ui?.error?.class]"
      :style="ui?.error?.style"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>
<style scoped>
.aven-time-picker {
  display: grid;
  gap: var(--aven-space-1);
  max-inline-size: 100%;
  color: var(--aven-color-text-primary);
}
.label {
  font-weight: 600;
}
.aven-time-picker input {
  min-block-size: 2.5rem;
  max-inline-size: 100%;
  padding-inline: var(--aven-space-3);
  border: 1px solid var(--aven-color-border-interactive);
  border-radius: var(--aven-radius-md);
  background: var(--aven-color-surface-base);
  color: inherit;
  font: inherit;
}
.aven-time-picker input:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 1px;
}
.aven-time-picker button {
  min-inline-size: 2.5rem;
  min-block-size: 2.5rem;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}
.help,
.error {
  margin: 0;
  font-size: 0.875rem;
}
.help {
  color: var(--aven-color-text-secondary);
}
.error {
  color: var(--aven-color-text-invalid);
}
.disabled {
  opacity: 0.7;
}
.unstyled input {
  border: 0;
  border-radius: 0;
}
@media (forced-colors: active) {
  .aven-time-picker input {
    border: 1px solid CanvasText;
  }
}
@media print {
  .aven-time-picker button {
    display: none;
  }
}
</style>
