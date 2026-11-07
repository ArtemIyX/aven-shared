<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  useAttrs,
  watch,
} from 'vue'
import type {
  AvenFileInputEvents,
  AvenFileInputProps,
  AvenFileInputSlots,
  AvenUploadItem,
} from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenFileInputProps>(), {
  defaultValue: () => [],
  multiple: false,
  disabled: false,
  loading: false,
  dropzone: false,
  unstyled: false,
  browseLabel: 'Browse files',
})
const emit = defineEmits<AvenFileInputEvents>()
defineSlots<AvenFileInputSlots>()
const attrs = useAttrs()
const input = ref<HTMLInputElement>()
const root = ref<HTMLElement>()
const localFiles = shallowRef<File[]>([...props.defaultValue])
const initialFiles = [...props.defaultValue]
const files = computed(() => props.modelValue ?? localFiles.value)
const dragging = ref(false)
const rejected = ref<AvenFileInputEvents['reject'][0]['reasons']>([])
const uploadItems = computed(() => props.files ?? [])
const canInteract = computed(() => !props.disabled && !props.loading)
let form: HTMLFormElement | null = null
watch(
  () => props.modelValue,
  (next) => {
    if (next) syncNativeFiles(next)
  },
)

function fileKey(file: File, index: number) {
  return `${file.name}:${file.size}:${file.lastModified}:${index}`
}
function open() {
  if (canInteract.value) input.value?.click()
}
function syncNativeFiles(nextFiles: File[]) {
  if (!input.value) return
  const current = Array.from(input.value.files ?? [])
  if (
    current.length === nextFiles.length &&
    current.every((file, index) => file === nextFiles[index])
  )
    return
  try {
    if (typeof DataTransfer === 'undefined') throw new Error('FileList assignment unavailable')
    const transfer = new DataTransfer()
    nextFiles.forEach((file) => transfer.items.add(file))
    input.value.files = transfer.files
  } catch {
    // An incorrect FileList must not be submitted when this platform cannot assign it.
    input.value.value = ''
  }
}
function acceptFile(file: File) {
  if (!props.accept) return true
  return props.accept.split(',').some((rule) => {
    const pattern = rule.trim().toLowerCase()
    return pattern.startsWith('.')
      ? file.name.toLowerCase().endsWith(pattern)
      : pattern.endsWith('/*')
        ? file.type.toLowerCase().startsWith(pattern.slice(0, -1))
        : file.type.toLowerCase() === pattern
  })
}
function processFiles(filesToCheck: File[], originalEvent: Event) {
  if (!canInteract.value) return
  const capacity = props.multiple
    ? Math.max(
        0,
        (props.maxFiles ?? Number.POSITIVE_INFINITY) -
          (props.modelValue === undefined ? localFiles.value.length : files.value.length),
      )
    : Math.max(0, Math.min(1, props.maxFiles ?? 1))
  const accepted: File[] = []
  const reasons: Array<{ file: File; reason: 'type' | 'size' | 'count' }> = []
  for (const file of filesToCheck) {
    if (!acceptFile(file)) reasons.push({ file, reason: 'type' })
    else if (props.maxSize !== undefined && file.size > props.maxSize)
      reasons.push({ file, reason: 'size' })
    else if (accepted.length >= capacity) reasons.push({ file, reason: 'count' })
    else accepted.push(file)
  }
  rejected.value = reasons
  if (reasons.length) emit('reject', { files: reasons.map(({ file }) => file), reasons })
  if (!accepted.length) {
    syncNativeFiles(files.value)
    return
  }
  const next = props.multiple ? [...files.value, ...accepted] : [accepted[0]!]
  if (props.modelValue === undefined) localFiles.value = next
  emit('update:modelValue', next)
  emit('select', { files: accepted, originalEvent })
  if (props.modelValue === undefined) syncNativeFiles(next)
  else void nextTick(() => syncNativeFiles(files.value))
}
function onChange(event: Event) {
  const control = event.currentTarget as HTMLInputElement
  processFiles(Array.from(control.files ?? []), event)
}
function onDragEnter(event: DragEvent) {
  if (!props.dropzone || !canInteract.value) return
  event.preventDefault()
  dragging.value = true
}
function onDragOver(event: DragEvent) {
  if (!props.dropzone || !canInteract.value) return
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
  dragging.value = true
}
function onDragLeave(event: DragEvent) {
  if (!props.dropzone) return
  const nextTarget = event.relatedTarget
  if (!(nextTarget instanceof Node && root.value?.contains(nextTarget))) dragging.value = false
}
function onDrop(event: DragEvent) {
  if (!props.dropzone) return
  event.preventDefault()
  dragging.value = false
  if (!canInteract.value) return
  processFiles(Array.from(event.dataTransfer?.files ?? []), event)
}
function removeFile(key: string) {
  if (!canInteract.value) return
  const index = files.value.findIndex((file, position) => fileKey(file, position) === key)
  if (index < 0) {
    emit('remove', { key })
    return
  }
  const next = files.value.filter((_, position) => position !== index)
  if (props.modelValue === undefined) localFiles.value = next
  emit('update:modelValue', next)
  emit('remove', { key })
  if (props.modelValue === undefined) syncNativeFiles(next)
  else void nextTick(() => syncNativeFiles(files.value))
}
function uploadAction(event: 'retry' | 'cancel' | 'remove', key: string) {
  if (!canInteract.value) return
  if (event === 'retry') emit('retry', { key })
  else if (event === 'cancel') emit('cancel', { key })
  else emit('remove', { key })
}
function reset(event: Event) {
  queueMicrotask(async () => {
    if (event.defaultPrevented) return
    if (props.modelValue === undefined) localFiles.value = [...initialFiles]
    else emit('update:modelValue', [...initialFiles])
    await nextTick()
    syncNativeFiles(files.value)
    rejected.value = []
  })
}
onMounted(() => {
  form = input.value?.form ?? root.value?.closest('form') ?? null
  form?.addEventListener('reset', reset)
  syncNativeFiles(files.value)
})
onBeforeUnmount(() => form?.removeEventListener('reset', reset))
defineExpose({ open })
</script>

<template>
  <div
    ref="root"
    v-bind="{ ...attrs, ...props.ui?.root?.attrs }"
    :class="[
      'aven-file-input',
      {
        'is-dropzone': props.dropzone,
        'is-dragging': dragging,
        'is-disabled': !canInteract,
        'is-unstyled': props.unstyled,
      },
      attrs.class,
      props.ui?.root?.class,
    ]"
    :style="[attrs.style, props.ui?.root?.style]"
    :aria-busy="props.loading || undefined"
    @dragenter="onDragEnter"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <input
      ref="input"
      class="file-control"
      type="file"
      tabindex="-1"
      :accept="props.accept"
      :multiple="props.multiple"
      :disabled="props.disabled"
      :name="props.name"
      :form="typeof attrs.form === 'string' ? attrs.form : undefined"
      :aria-label="props.label ?? props.browseLabel"
      @change="onChange"
    />
    <slot :dragging="dragging" :open="open" :disabled="!canInteract">
      <div
        v-if="props.dropzone"
        v-bind="props.ui?.surface?.attrs"
        class="drop-content"
        :class="props.ui?.surface?.class"
        :style="props.ui?.surface?.style"
      >
        <strong>{{ dragging ? 'Drop files to add them' : 'Drop files here' }}</strong>
        <span> or </span
        ><button type="button" class="browse-button" :disabled="!canInteract" @click="open">
          {{ props.browseLabel }}
        </button>
      </div>
      <div v-else class="inline-content">
        <span>{{ props.label }}</span
        ><button type="button" class="browse-button" :disabled="!canInteract" @click="open">
          {{ props.browseLabel }}
        </button>
      </div>
    </slot>
    <ul
      v-if="files.length || uploadItems.length"
      v-bind="props.ui?.list?.attrs"
      class="file-list"
      :class="props.ui?.list?.class"
      :style="props.ui?.list?.style"
    >
      <li
        v-for="(file, index) in files"
        v-bind="props.ui?.file?.attrs"
        :key="fileKey(file, index)"
        class="file-row"
        :class="props.ui?.file?.class"
        :style="props.ui?.file?.style"
      >
        <slot
          name="file"
          :file="file"
          :remove="() => removeFile(fileKey(file, index))"
          :retry="() => undefined"
          :cancel="() => undefined"
          :disabled="!canInteract"
        >
          <span class="file-name">{{ file.name }}</span
          ><span class="file-size">{{ file.size.toLocaleString() }} bytes</span>
          <button
            type="button"
            class="file-remove"
            :disabled="!canInteract"
            :aria-label="`Remove ${file.name}`"
            @click="removeFile(fileKey(file, index))"
          >
            Remove
          </button>
        </slot>
      </li>
      <li
        v-for="file in uploadItems"
        v-bind="props.ui?.file?.attrs"
        :key="file.key"
        class="file-row"
        :class="props.ui?.file?.class"
        :style="props.ui?.file?.style"
      >
        <slot
          name="file"
          :file="file"
          :remove="() => uploadAction('remove', file.key)"
          :retry="() => uploadAction('retry', file.key)"
          :cancel="() => uploadAction('cancel', file.key)"
          :disabled="!canInteract"
        >
          <span class="file-name">{{ file.name }}</span
          ><span class="upload-status"
            >{{ file.status
            }}<template v-if="file.progress !== undefined"> · {{ file.progress }}%</template></span
          >
          <slot name="progress" :file="file" :progress="file.progress"
            ><progress
              v-if="file.progress !== undefined"
              :value="file.progress"
              max="100"
              :aria-label="`${file.name} upload progress`"
          /></slot>
          <span v-if="file.error" role="alert">{{ file.error }}</span>
          <button
            v-if="file.status === 'error'"
            type="button"
            :disabled="!canInteract"
            @click="uploadAction('retry', file.key)"
          >
            Retry
          </button>
          <button
            v-if="file.status === 'uploading'"
            type="button"
            :disabled="!canInteract"
            @click="uploadAction('cancel', file.key)"
          >
            Cancel
          </button>
          <button
            type="button"
            :disabled="!canInteract"
            :aria-label="`Remove ${file.name}`"
            @click="uploadAction('remove', file.key)"
          >
            Remove
          </button>
        </slot>
      </li>
    </ul>
    <slot v-else name="empty" />
    <slot
      v-if="rejected.length"
      name="error"
      :files="rejected.map(({ file }) => file)"
      :reasons="rejected"
    >
      <ul class="file-errors" role="alert">
        <li v-for="(rejection, index) in rejected" :key="`${rejection.file.name}-${index}`">
          {{ rejection.file.name }}:
          {{
            rejection.reason === 'type'
              ? 'unsupported file type'
              : rejection.reason === 'size'
                ? 'file is too large'
                : 'maximum file count reached'
          }}
        </li>
      </ul>
    </slot>
    <slot name="actions" />
  </div>
</template>

<style scoped>
.aven-file-input {
  min-inline-size: 0;
  color: var(--aven-color-text-primary);
}
.file-control {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.inline-content {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--aven-space-3);
}
.drop-content {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--aven-space-2);
  min-block-size: 8rem;
  padding: var(--aven-space-5);
  border: 2px dashed var(--aven-color-border-muted);
  border-radius: var(--aven-radius-md);
  background: var(--aven-color-surface-base);
  text-align: center;
}
.is-dragging .drop-content {
  border-color: var(--aven-color-accent-solid);
  background: var(--aven-color-accent-subtle);
}
.browse-button,
.file-remove {
  min-block-size: 2.75rem;
  padding-inline: var(--aven-space-3);
  border: 1px solid var(--aven-color-border-interactive);
  border-radius: var(--aven-radius-sm);
  background: var(--aven-color-surface-base);
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.browse-button:focus-visible,
.file-remove:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 2px;
}
.browse-button:disabled,
.file-remove:disabled {
  color: var(--aven-color-text-disabled);
  cursor: not-allowed;
}
.file-list,
.file-errors {
  display: grid;
  gap: var(--aven-space-2);
  margin: var(--aven-space-3) 0 0;
  padding: 0;
  list-style: none;
}
.file-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--aven-space-3);
  min-inline-size: 0;
  padding: var(--aven-space-3);
  border-block-end: 1px solid var(--aven-color-border-subtle);
}
.file-name {
  min-inline-size: 0;
  flex: 1 1 8rem;
  overflow-wrap: anywhere;
}
.file-size,
.upload-status {
  color: var(--aven-color-text-secondary);
}
.file-errors {
  color: var(--aven-color-danger-text);
}
.is-disabled {
  color: var(--aven-color-text-disabled);
}
.is-unstyled .drop-content,
.is-unstyled .browse-button,
.is-unstyled .file-remove {
  border-radius: 0;
  box-shadow: none;
}
@media (forced-colors: active) {
  .drop-content,
  .browse-button,
  .file-remove {
    border-color: CanvasText;
  }
}
@media print {
  .file-control,
  .browse-button,
  .file-remove {
    display: none;
  }
}
</style>
