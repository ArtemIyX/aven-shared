<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AvenCodeBlockEvents, AvenCodeBlockProps, AvenCodeBlockSlots } from './types.js'
const props = withDefaults(defineProps<AvenCodeBlockProps>(), {
  showLineNumbers: false,
  copyable: false,
  wrap: false,
  copyLabel: 'Copy code',
  copiedLabel: 'Code copied',
  copyErrorLabel: 'Could not copy code',
  unstyled: false,
})
const emit = defineEmits<AvenCodeBlockEvents>()
const slots = defineSlots<AvenCodeBlockSlots>()
const lines = computed(() => props.code.replace(/\r\n?/g, '\n').split('\n'))
const copyStatus = ref('')
async function copy(): Promise<{ success: boolean; error?: Error }> {
  try {
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText)
      throw new Error('Clipboard access is unavailable')
    await navigator.clipboard.writeText(props.code)
    copyStatus.value = props.copiedLabel
    const result = { success: true }
    emit('copy', result)
    return result
  } catch (cause) {
    const error = cause instanceof Error ? cause : new Error(String(cause))
    copyStatus.value = `${props.copyErrorLabel}: ${error.message}`
    const result = { success: false, error }
    emit('copy', result)
    return result
  }
}
defineExpose({ copy })
</script>
<template>
  <figure
    :aria-label="label"
    :class="['aven-code-block', { 'is-wrapping': wrap, 'is-unstyled': unstyled }, ui?.root?.class]"
    :style="ui?.root?.style"
    v-bind="ui?.root?.attrs"
  >
    <figcaption
      v-if="$slots.header || language || $slots.language || $slots.actions || copyable"
      :class="['code-header', ui?.header?.class]"
      :style="ui?.header?.style"
      v-bind="ui?.header?.attrs"
    >
      <div class="code-heading">
        <slot name="header" />
        <span
          v-if="language || $slots.language"
          :class="['code-language', ui?.language?.class]"
          :style="ui?.language?.style"
          v-bind="ui?.language?.attrs"
          ><slot name="language" :language="language">{{ language }}</slot></span
        >
      </div>
      <div
        :class="['code-actions', ui?.actions?.class]"
        :style="ui?.actions?.style"
        v-bind="ui?.actions?.attrs"
      >
        <slot name="actions" />
        <button
          v-if="copyable"
          type="button"
          :class="['code-copy', ui?.copy?.class]"
          :style="ui?.copy?.style"
          v-bind="ui?.copy?.attrs"
          @click="copy"
        >
          {{ copyLabel }}
        </button>
      </div>
    </figcaption>
    <pre
      :class="['code-content', ui?.code?.class]"
      :style="ui?.code?.style"
      v-bind="ui?.code?.attrs"
    ><code><span v-for="(line, index) in lines" :key="index" class="code-line" :class="ui?.line?.class" :style="ui?.line?.style" v-bind="ui?.line?.attrs"><span v-bind="ui?.lineNumber?.attrs" v-if="showLineNumbers" class="line-number" :class="ui?.lineNumber?.class" :style="ui?.lineNumber?.style" aria-hidden="true">{{ index + 1 }}</span><slot v-if="slots.line" name="line" :line="line" :index="index">{{ line }}</slot><template v-else>{{ line }}</template>
</span></code></pre>
    <div
      v-if="copyStatus"
      role="status"
      :class="['code-status', ui?.status?.class]"
      :style="ui?.status?.style"
      v-bind="ui?.status?.attrs"
    >
      {{ copyStatus }}
    </div>
  </figure>
</template>
<style scoped>
.aven-code-block {
  min-inline-size: 0;
  margin: 0;
  overflow: hidden;
  border: 0.0625rem solid var(--aven-color-border-subtle);
  border-radius: var(--aven-radius-md);
  background: var(--aven-code-bg, var(--aven-color-surface-subtle));
  color: var(--aven-code-fg, var(--aven-color-text-primary));
}
.code-header,
.code-actions,
.code-heading {
  display: flex;
  align-items: center;
  gap: var(--aven-space-2);
  min-inline-size: 0;
}
.code-header {
  justify-content: space-between;
  flex-wrap: wrap;
  padding: var(--aven-space-2) var(--aven-space-3);
  border-block-end: 0.0625rem solid var(--aven-color-border-subtle);
}
.code-language {
  color: var(--aven-color-text-secondary);
  font-size: var(--aven-font-size-xs);
}
.code-content {
  max-inline-size: 100%;
  margin: 0;
  padding: var(--aven-space-3);
  overflow: auto;
  tab-size: var(--aven-code-tab-size, 2);
  font-family: var(--aven-font-mono, ui-monospace, monospace);
  font-size: var(--aven-font-size-sm);
  line-height: 1.55;
  white-space: pre;
}
.is-wrapping .code-content {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.code-line {
  display: block;
  min-block-size: 1.55em;
}
.line-number {
  display: inline-block;
  inline-size: 3ch;
  margin-inline-end: var(--aven-space-3);
  color: var(--aven-color-text-secondary);
  text-align: end;
  user-select: none;
}
.code-copy {
  min-block-size: 2.75rem;
  padding-inline: var(--aven-space-3);
  border: 0.0625rem solid var(--aven-color-border-subtle);
  border-radius: var(--aven-radius-sm);
  background: var(--aven-color-surface-card);
  color: var(--aven-color-text-primary);
  font: inherit;
  cursor: pointer;
}
.code-copy:focus-visible {
  outline: 0.125rem solid var(--aven-color-focus-ring);
  outline-offset: 0.125rem;
}
.code-status {
  padding: var(--aven-space-2) var(--aven-space-3);
  color: var(--aven-color-text-secondary);
  overflow-wrap: anywhere;
}
.is-unstyled {
  border: 0;
  border-radius: 0;
  background: transparent;
}
.is-unstyled .code-header {
  border: 0;
}
.is-unstyled .code-copy {
  appearance: none;
  border: 0;
  border-radius: 0;
  background: transparent;
}
@media (forced-colors: active) {
  .aven-code-block,
  .code-header,
  .code-copy {
    border-color: CanvasText;
  }
}
@media print {
  .code-content {
    overflow: visible;
    white-space: pre-wrap;
  }
  .code-actions,
  .code-status {
    display: none;
  }
}
</style>
