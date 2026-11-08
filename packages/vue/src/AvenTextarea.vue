<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, useAttrs } from 'vue'
import type { AvenTextareaEvents, AvenTextareaProps, AvenTextareaSlots } from './types.js'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenTextareaProps>(), {
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
})
const emit = defineEmits<AvenTextareaEvents>()
defineSlots<AvenTextareaSlots>()
const attrs = useAttrs(),
  local = ref(props.defaultValue),
  el = ref<HTMLTextAreaElement>(),
  composing = ref(false)
let form: HTMLFormElement | null = null
let skipNextInput = false
const initialValue = props.defaultValue
const controlAttrs = computed(() => {
  const { class: _class, style: _style, ...control } = attrs
  return control
})
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
  if (composing.value) return
  if (skipNextInput) {
    skipNextInput = false
    return
  }
  acceptInput(e)
}
function acceptInput(e: Event) {
  const v = (e.target as HTMLTextAreaElement).value
  local.value = v
  emit('update:modelValue', v)
}
function compositionStart() {
  composing.value = true
}
function compositionEnd(e: CompositionEvent) {
  composing.value = false
  skipNextInput = true
  acceptInput(e)
  queueMicrotask(() => (skipNextInput = false))
}
function reset(event: Event) {
  queueMicrotask(async () => {
    if (event.defaultPrevented) return
    const next = initialValue
    if (props.modelValue !== undefined) emit('update:modelValue', next)
    else local.value = next
    await nextTick()
    if (el.value && props.modelValue !== undefined) el.value.value = props.modelValue
    void size()
  })
}
onMounted(() => {
  form = el.value?.form ?? null
  form?.addEventListener('reset', reset)
  void size()
})
onBeforeUnmount(() => form?.removeEventListener('reset', reset))
defineExpose({
  focus: () => el.value?.focus(),
  blur: () => el.value?.blur(),
  select: () => el.value?.select(),
})
</script>
<template>
  <div
    v-bind="ui?.root?.attrs"
    :class="[
      'aven-textarea',
      { 'is-invalid': invalid, 'is-disabled': disabled, 'is-unstyled': unstyled },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[attrs.style, ui?.root?.style]"
  >
    <div class="textarea-shell">
      <span
        v-if="$slots.leading"
        v-bind="ui?.leading?.attrs"
        :class="ui?.leading?.class"
        :style="ui?.leading?.style"
      >
        <slot name="leading" />
      </span>
      <textarea
        ref="el"
        v-bind="{ ...controlAttrs, ...ui?.control?.attrs }"
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
        :class="[
          'textarea-control',
          `resize-${resize}`,
          { 'is-autosize': autosize },
          ui?.control?.class,
        ]"
        :style="ui?.control?.style"
        @input="input"
        @change="!composing && emit('change', ($event.target as HTMLTextAreaElement).value)"
        @compositionstart="compositionStart"
        @compositionend="compositionEnd"
        @focus="emit('focus', $event)"
        @blur="emit('blur', $event)"
      />
      <span
        v-if="$slots.trailing"
        v-bind="ui?.trailing?.attrs"
        :class="ui?.trailing?.class"
        :style="ui?.trailing?.style"
      >
        <slot name="trailing" />
      </span>
    </div>
    <div
      v-if="showCount || $slots.footer"
      v-bind="ui?.footer?.attrs"
      :class="['textarea-footer', ui?.footer?.class]"
      :style="ui?.footer?.style"
    >
      <slot name="footer" :length="value.length" :maxlength="maxlength"
        ><slot name="count" :length="value.length" :maxlength="maxlength"
          ><span
            v-if="showCount"
            v-bind="ui?.count?.attrs"
            :class="ui?.count?.class"
            :style="ui?.count?.style"
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
.textarea-shell {
  display: flex;
  align-items: stretch;
  min-inline-size: 0;
}
.textarea-shell > span {
  display: flex;
  align-items: flex-start;
  flex: none;
  padding: var(--aven-space-3);
  color: var(--aven-color-text-secondary);
}
.textarea-control.is-autosize {
  min-block-size: 0;
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
