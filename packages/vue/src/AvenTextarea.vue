<script setup lang="ts">
import { computed, nextTick, ref, watch, useAttrs } from 'vue'
import type { AvenUi } from './types.js'
defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    modelValue?: string
    defaultValue?: string
    rows?: number
    minRows?: number
    maxRows?: number
    autosize?: boolean
    resize?: 'vertical' | 'none' | 'both'
    maxlength?: number
    showCount?: boolean
    placeholder?: string
    disabled?: boolean
    readonly?: boolean
    required?: boolean
    name?: string
    id?: string
    invalid?: boolean
    unstyled?: boolean
    ui?: AvenUi<'root' | 'control' | 'footer' | 'count'>
  }>(),
  {
    defaultValue: '',
    rows: 3,
    autosize: false,
    resize: 'vertical',
    showCount: false,
    disabled: false,
    readonly: false,
    required: false,
    invalid: false,
    unstyled: false,
  },
)
const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  resize: [payload: { height: number }]
}>()
const attrs = useAttrs(),
  local = ref(props.defaultValue),
  el = ref<HTMLTextAreaElement>()
const value = computed(() => (props.modelValue !== undefined ? props.modelValue : local.value))
watch(
  () => props.modelValue,
  (v) => {
    if (v !== undefined) local.value = v
    void size()
  },
)
watch(value, () => void size())
async function size() {
  if (!props.autosize) return
  await nextTick()
  if (!el.value) return
  el.value.style.height = 'auto'
  const line = parseFloat(getComputedStyle(el.value).lineHeight) || 24
  let h = el.value.scrollHeight
  if (props.minRows) h = Math.max(h, props.minRows * line)
  if (props.maxRows) h = Math.min(h, props.maxRows * line)
  const old = el.value.offsetHeight
  el.value.style.height = `${h}px`
  if (old !== h) emit('resize', { height: h })
}
function input(e: Event) {
  const v = (e.target as HTMLTextAreaElement).value
  local.value = v
  emit('update:modelValue', v)
}
defineExpose({
  focus: () => el.value?.focus(),
  blur: () => el.value?.blur(),
  select: () => el.value?.select(),
})
</script>
<template>
  <div
    :class="[
      'aven-textarea',
      { 'is-invalid': invalid, 'is-disabled': disabled, 'is-unstyled': unstyled },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[attrs.style, ui?.root?.style]"
  >
    <textarea
      ref="el"
      v-bind="attrs"
      :id="id"
      :name="name"
      :rows="rows"
      :maxlength="maxlength"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :aria-invalid="invalid || undefined"
      :value="value"
      :class="['textarea-control', `resize-${resize}`, ui?.control?.class]"
      :style="ui?.control?.style"
      @input="input"
      @change="emit('change', ($event.target as HTMLTextAreaElement).value)"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    />
    <div
      v-if="showCount || $slots.footer"
      :class="['textarea-footer', ui?.footer?.class]"
      :style="ui?.footer?.style"
    >
      <slot name="footer" :length="value.length" :maxlength="maxlength"
        ><slot name="count" :length="value.length" :maxlength="maxlength"
          ><span v-if="showCount" :class="ui?.count?.class"
            >{{ value.length }}{{ maxlength ? ` / ${maxlength}` : '' }}</span
          ></slot
        ></slot
      >
    </div>
  </div>
</template>
<style scoped>
.aven-textarea {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--aven-color-border-interactive);
  border-radius: var(--aven-radius-md);
  background: var(--aven-color-surface-base);
  color: var(--aven-color-text-primary);
}
.aven-textarea:focus-within {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 1px;
}
.is-invalid {
  border-color: var(--aven-color-border-invalid);
}
.is-disabled {
  background: var(--aven-color-surface-disabled);
}
.textarea-control {
  box-sizing: border-box;
  width: 100%;
  min-height: 5rem;
  padding: var(--aven-space-3);
  resize: vertical;
  border: 0;
  outline: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  line-height: var(--aven-line-height-normal);
}
.resize-none {
  resize: none;
}
.resize-both {
  resize: both;
}
.textarea-control:disabled {
  color: var(--aven-color-text-disabled);
}
.textarea-footer {
  padding: 0 var(--aven-space-3) var(--aven-space-2);
  font-size: var(--aven-font-size-xs);
  color: var(--aven-color-text-secondary);
  text-align: end;
}
.is-unstyled {
  border: 0;
  border-radius: 0;
}
</style>
