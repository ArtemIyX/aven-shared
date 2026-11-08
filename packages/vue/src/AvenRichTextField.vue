<script setup lang="ts" generic="Document extends object = AvenRichTextDocument">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
  type ComponentPublicInstance,
} from 'vue'
import { useAvenId } from './composables.js'
import type {
  AvenRichTextDocument,
  AvenRichTextFieldEvents,
  AvenRichTextFieldProps,
  AvenRichTextFieldSlots,
} from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenRichTextFieldProps<Document>>(), {
  disabled: false,
  readonly: false,
  required: false,
  schemaLabel: 'Aven basic rich text document',
  unstyled: false,
})
const emit = defineEmits<AvenRichTextFieldEvents<Document>>()
const slots = defineSlots<AvenRichTextFieldSlots<Document>>()
const attrs = useAttrs()
const root = ref<HTMLElement>()
const editor = ref<HTMLTextAreaElement>()
const customEditor = ref<HTMLElement>()
const labelId = useAvenId(props.id, 'rich-text-label')
const helpId = useAvenId(undefined, 'rich-text-help')
const errorId = useAvenId(undefined, 'rich-text-error')
const emptyDocument = (): AvenRichTextDocument => ({
  type: 'doc',
  content: [{ type: 'paragraph' }],
})
const localValue = ref((props.defaultValue ?? emptyDocument()) as Document)
const currentValue = computed(() =>
  props.modelValue === undefined ? localValue.value : props.modelValue,
)
const textValue = computed(() => plainText(currentValue.value))
const supportsBasicSchema = computed(() => isBasicDocument(currentValue.value))
const selection = ref('')
const draftText = ref(textValue.value)
const wordCountOverride = ref<number>()
const wordCount = computed(
  () => wordCountOverride.value ?? textValue.value.trim().match(/\S+/g)?.length ?? 0,
)
const committedValue = ref(JSON.stringify(currentValue.value))
const pendingValue = ref(currentValue.value)
const descriptionIds = computed(
  () =>
    [props.helpText || slots.help ? helpId : undefined, props.error ? errorId : undefined]
      .filter(Boolean)
      .join(' ') || undefined,
)
const editorAttrs = computed(() => ({
  id: props.id,
  role: 'textbox',
  'aria-multiline': true,
  'aria-labelledby': labelId,
  'aria-describedby': descriptionIds.value,
  'aria-invalid': props.error ? true : undefined,
  'aria-required': props.required ? true : undefined,
  'aria-disabled': props.disabled ? true : undefined,
  'aria-readonly': props.readonly ? true : undefined,
  'data-aven-rich-text-editor': '',
}))
const textareaAttrs = computed(() => ({ ...props.ui?.editor?.attrs, ...editorAttrs.value }))
const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return { ...rest, ...props.ui?.root?.attrs }
})
function isBasicDocument(value: object): value is AvenRichTextDocument {
  const record = value as { type?: unknown; content?: unknown }
  return (
    record.type === 'doc' &&
    Array.isArray(record.content) &&
    record.content.every((paragraph) => {
      if (
        typeof paragraph !== 'object' ||
        paragraph === null ||
        (paragraph as { type?: unknown }).type !== 'paragraph'
      )
        return false
      const content = (paragraph as { content?: unknown }).content
      return (
        content === undefined ||
        (Array.isArray(content) &&
          content.every(
            (item) =>
              typeof item === 'object' &&
              item !== null &&
              (item as { type?: unknown }).type === 'text' &&
              typeof (item as { text?: unknown }).text === 'string' &&
              (item as { marks?: unknown }).marks === undefined,
          ))
      )
    })
  )
}
function plainText(value: object): string {
  if (!isBasicDocument(value)) return ''
  return value.content
    .map((paragraph) => paragraph.content?.map((node) => node.text).join('') ?? '')
    .join('\n')
}
function documentFromText(text: string): AvenRichTextDocument {
  return {
    type: 'doc',
    content: text
      .replace(/\r\n?/g, '\n')
      .split('\n')
      .map((line) => ({
        type: 'paragraph',
        ...(line ? { content: [{ type: 'text' as const, text: line }] } : {}),
      })),
  }
}
function update(value: Document) {
  if (props.disabled || props.readonly) return
  pendingValue.value = value
  if (props.modelValue === undefined) localValue.value = value
  emit('update:modelValue', value)
}
function onInput(event: Event) {
  const nextText = (event.currentTarget as HTMLTextAreaElement).value
  draftText.value = nextText
  update(documentFromText(nextText) as Document)
  refreshSelection()
}
function refreshSelection() {
  const element = editor.value
  if (!element) {
    if (!customEditor.value) selection.value = ''
    return
  }
  const text =
    typeof element.value === 'string'
      ? element.value
      : typeof (element as unknown as { props?: { value?: unknown } }).props?.value === 'string'
        ? (element as unknown as { props: { value: string } }).props.value
        : ''
  const start = element.selectionStart ?? 0
  const end = element.selectionEnd ?? start
  selection.value = text.slice(start, end)
}
function onFocus(event: FocusEvent) {
  pendingValue.value = currentValue.value
  committedValue.value = JSON.stringify(currentValue.value)
  draftText.value = textValue.value
  refreshSelection()
  emit('focus', event)
}
function onBlur(event: FocusEvent) {
  refreshSelection()
  const serialized = JSON.stringify(pendingValue.value)
  if (serialized !== committedValue.value) {
    committedValue.value = serialized
    emit('change', { value: pendingValue.value, originalEvent: event })
  }
  emit('blur', event)
}
function focus() {
  editor.value?.focus()
  if (!editor.value) customEditor.value?.focus()
}
function registerEditor(element: Element | ComponentPublicInstance | null) {
  customEditor.value =
    element && 'focus' in element && typeof element.focus === 'function'
      ? (element as HTMLElement)
      : undefined
}
function editorFocus(event: FocusEvent) {
  onFocus(event)
}
function editorBlur(event: FocusEvent) {
  onBlur(event)
}
function updateSelection(value: string) {
  selection.value = value
}
function updateWordCount(value: number) {
  wordCountOverride.value = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : undefined
}
function handleReset(event: Event) {
  window.setTimeout(() => {
    if (event.defaultPrevented) return
    const next = (props.defaultValue ?? emptyDocument()) as Document
    if (props.modelValue === undefined) localValue.value = next
    emit('update:modelValue', next)
    pendingValue.value = next
    committedValue.value = JSON.stringify(next)
    nextTick(refreshSelection)
  }, 0)
}
let form: HTMLFormElement | undefined
onMounted(() => {
  form = root.value?.closest('form') ?? undefined
  form?.addEventListener('reset', handleReset)
})
onBeforeUnmount(() => form?.removeEventListener('reset', handleReset))
defineExpose({ focus })
</script>
<template>
  <div
    v-bind="{ ...ui?.root?.attrs, ...rootAttrs }"
    ref="root"
    :class="[
      'aven-rich-text-field',
      {
        'is-disabled': disabled,
        'is-readonly': readonly,
        'is-invalid': error,
        'is-unstyled': unstyled,
      },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[attrs.style, ui?.root?.style]"
  >
    <div class="field-heading">
      <span
        :id="labelId"
        class="field-label"
        :class="ui?.label?.class"
        :style="ui?.label?.style"
        v-bind="ui?.label?.attrs"
        ><slot name="leading" />{{ label }}<span v-if="required" aria-hidden="true"> *</span></span
      >
      <slot name="trailing" />
    </div>
    <div
      v-if="$slots.toolbar"
      class="editor-toolbar"
      :class="ui?.toolbar?.class"
      :style="ui?.toolbar?.style"
      v-bind="ui?.toolbar?.attrs"
    >
      <slot
        name="toolbar"
        :selection="selection"
        :word-count="wordCount"
        :disabled="disabled"
        :readonly="readonly"
      />
    </div>
    <input
      v-if="slots.editor && name"
      type="hidden"
      :name="name"
      :value="JSON.stringify(currentValue)"
      :disabled="disabled"
    />
    <slot
      v-if="slots.editor"
      name="editor"
      :value="currentValue"
      :update="update"
      :disabled="disabled"
      :readonly="readonly"
      :placeholder="placeholder"
      :focus="focus"
      :register-editor="registerEditor"
      :editor-attrs="editorAttrs"
      :on-focus="editorFocus"
      :on-blur="editorBlur"
      :update-selection="updateSelection"
      :update-word-count="updateWordCount"
    />
    <textarea
      v-bind="{ ...ui?.editor?.attrs, ...textareaAttrs }"
      v-else-if="supportsBasicSchema"
      ref="editor"
      :name="name"
      :value="textValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :class="['rich-editor', ui?.editor?.class]"
      :style="ui?.editor?.style"
      @input="onInput"
      @select="refreshSelection"
      @keyup="refreshSelection"
      @mouseup="refreshSelection"
      @focus="onFocus"
      @blur="onBlur"
    />
    <div v-else role="alert" class="schema-notice">
      Use the editor slot to connect an editor for the selected document schema ({{ schemaLabel }}).
    </div>
    <p
      v-if="helpText || $slots.help"
      :id="helpId"
      class="field-help"
      :class="ui?.help?.class"
      :style="ui?.help?.style"
      v-bind="ui?.help?.attrs"
    >
      <slot name="help">{{ helpText }}</slot>
    </p>
    <p
      v-if="error"
      :id="errorId"
      class="field-error"
      :class="ui?.error?.class"
      :style="ui?.error?.style"
      v-bind="ui?.error?.attrs"
      role="alert"
    >
      <slot name="error" :error="error">{{ error }}</slot>
    </p>
    <div
      v-if="$slots.footer"
      class="field-footer"
      :class="ui?.footer?.class"
      :style="ui?.footer?.style"
      v-bind="ui?.footer?.attrs"
    >
      <slot name="footer" :selection="selection" :word-count="wordCount" />
    </div>
  </div>
</template>
<style scoped>
.aven-rich-text-field {
  display: grid;
  gap: var(--aven-rich-text-gap, var(--aven-space-2));
  min-inline-size: 0;
  color: var(--aven-rich-text-fg, var(--aven-color-text-primary));
}
.field-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--aven-space-2);
  min-inline-size: 0;
}
.field-label {
  font-weight: 600;
  overflow-wrap: anywhere;
}
.editor-toolbar,
.field-footer {
  display: flex;
  flex-wrap: wrap;
  gap: var(--aven-space-2);
  min-inline-size: 0;
}
.rich-editor {
  display: block;
  box-sizing: border-box;
  inline-size: 100%;
  min-block-size: var(--aven-rich-text-min-height, 10rem);
  padding: var(--aven-space-3);
  border: 1px solid var(--aven-rich-text-border, var(--aven-color-border-default));
  border-radius: var(--aven-rich-text-radius, var(--aven-radius-md));
  background: var(--aven-rich-text-bg, var(--aven-color-surface-card));
  color: inherit;
  font: inherit;
  line-height: var(--aven-line-height-relaxed);
  resize: vertical;
}
.rich-editor::placeholder {
  color: var(--aven-color-text-tertiary);
}
.rich-editor:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 2px;
}
.is-invalid .rich-editor {
  border-color: var(--aven-color-danger-border);
}
.field-help {
  margin: 0;
  color: var(--aven-color-text-secondary);
  font-size: var(--aven-font-size-sm);
  overflow-wrap: anywhere;
}
.field-error,
.schema-notice {
  margin: 0;
  color: var(--aven-color-danger-text);
  font-size: var(--aven-font-size-sm);
  overflow-wrap: anywhere;
}
.is-disabled {
  color: var(--aven-color-text-disabled);
}
.is-disabled .rich-editor {
  cursor: not-allowed;
}
.is-unstyled .rich-editor {
  border: 0;
  border-radius: 0;
  background: transparent;
}
@media (forced-colors: active) {
  .rich-editor {
    border-color: CanvasText;
  }
  .is-invalid .rich-editor {
    border-color: Mark;
  }
}
@media print {
  .rich-editor {
    border-color: CanvasText;
    resize: none;
  }
}
</style>
