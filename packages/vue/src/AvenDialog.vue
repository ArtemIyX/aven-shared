<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, useAttrs } from 'vue'
import { useAvenId, type AvenOpenReason } from './composables.js'
import type { AvenDialogEvents, AvenDialogProps, AvenDialogSlots } from './types.js'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenDialogProps>(), {
  size: 'md',
  closeOnEscape: true,
  closeOnOutside: true,
  showClose: true,
  restoreFocus: true,
  unstyled: false,
})
const emit = defineEmits<AvenDialogEvents>()
defineSlots<AvenDialogSlots>()
const attrs = useAttrs(),
  dialog = ref<HTMLDialogElement>(),
  local = ref(props.defaultOpen ?? false),
  isOpen = computed(() => (props.open === undefined ? local.value : props.open))
const dialogId = useAvenId(props.id, 'dialog')
const titleId = `${dialogId}-title`
const descriptionId = `${dialogId}-description`
let opener: HTMLElement | null = null
let wasPrevented = false
function propose(open: boolean, reason: AvenOpenReason, event?: Event) {
  if (open === isOpen.value) return
  if (!open) {
    wasPrevented = false
    emit('beforeClose', {
      reason,
      originalEvent: event,
      preventDefault: () => {
        wasPrevented = true
      },
    })
    if (wasPrevented) return
  }
  if (props.open === undefined) local.value = open
  emit('update:open', open)
  emit('openChange', { open, reason })
}
async function sync() {
  await nextTick()
  const el = dialog.value
  if (!el) return
  if (isOpen.value && !el.open) {
    opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    el.showModal()
    if (props.initialFocus) el.querySelector<HTMLElement>(props.initialFocus)?.focus()
    emit('afterOpen')
  } else if (!isOpen.value && el.open) {
    el.close()
    if (props.restoreFocus && opener?.isConnected && !opener.hasAttribute('disabled'))
      opener.focus()
    emit('afterClose')
  }
}
function onCancel(e: Event) {
  e.preventDefault()
  if (props.closeOnEscape) propose(false, 'escape', e)
}
function onClick(e: MouseEvent) {
  if (e.target === dialog.value && props.closeOnOutside) propose(false, 'outside', e)
}
watch(isOpen, () => void sync())
onMounted(() => void sync())
onBeforeUnmount(() => {
  if (dialog.value?.open) dialog.value.close()
})
defineExpose({ close: () => propose(false, 'programmatic'), focus: () => dialog.value?.focus() })
</script>
<template>
  <dialog
    ref="dialog"
    v-bind="attrs"
    :id="dialogId"
    :class="[
      'aven-dialog',
      `size-${size}`,
      { 'is-unstyled': unstyled },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[attrs.style, ui?.root?.style]"
    :aria-labelledby="title || $slots.title ? titleId : undefined"
    :aria-describedby="description || $slots.description ? descriptionId : undefined"
    @cancel="onCancel"
    @click="onClick"
  >
    <div :class="['dialog-content', ui?.content?.class]" :style="ui?.content?.style">
      <header
        v-if="
          title || description || $slots.header || $slots.title || $slots.description || showClose
        "
        :class="['dialog-header', ui?.header?.class]"
        :style="ui?.header?.style"
      >
        <div class="dialog-heading">
          <slot name="header" :close="() => propose(false, 'programmatic')"
            ><h2 v-if="title || $slots.title" :id="titleId" :class="ui?.title?.class">
              <slot name="title">{{ title }}</slot>
            </h2>
            <p
              v-if="description || $slots.description"
              :id="descriptionId"
              :class="['dialog-description', ui?.description?.class]"
            >
              <slot name="description">{{ description }}</slot>
            </p></slot
          >
        </div>
        <button
          v-if="showClose"
          type="button"
          :class="['dialog-close', ui?.close?.class]"
          aria-label="Close dialog"
          @click="propose(false, 'trigger', $event)"
        >
          <slot name="close-icon">×</slot>
        </button>
      </header>
      <div :class="['dialog-body', ui?.body?.class]" :style="ui?.body?.style">
        <slot :close="() => propose(false, 'programmatic')" />
      </div>
      <footer
        v-if="$slots.footer || $slots.actions"
        :class="['dialog-footer', ui?.footer?.class]"
        :style="ui?.footer?.style"
      >
        <slot name="footer" :close="() => propose(false, 'programmatic')"
          ><slot name="actions" :close="() => propose(false, 'programmatic')"
        /></slot>
      </footer>
    </div>
  </dialog>
</template>
<style scoped>
.aven-dialog {
  position: fixed;
  inset: 0;
  margin: auto;
  padding: 0;
  border: 1px solid var(--aven-color-border-subtle);
  border-radius: var(--aven-radius-lg);
  max-inline-size: calc(100vw - 2rem);
  max-block-size: calc(100dvh - 2rem);
  background: var(--aven-color-surface-dialog);
  color: var(--aven-color-text-primary);
  box-shadow: 0 16px 40px var(--aven-color-shadow-contact);
}
.aven-dialog::backdrop {
  background: var(--aven-color-scrim);
}
.size-sm {
  inline-size: min(24rem, calc(100vw - 2rem));
}
.size-md {
  inline-size: min(36rem, calc(100vw - 2rem));
}
.size-lg {
  inline-size: min(56rem, calc(100vw - 2rem));
}
.size-fullscreen {
  inline-size: calc(100vw - 1rem);
  block-size: calc(100dvh - 1rem);
  max-inline-size: none;
  max-block-size: none;
}
.dialog-content {
  display: flex;
  flex-direction: column;
  max-block-size: inherit;
}
.dialog-header,
.dialog-footer {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--aven-space-4);
  padding: var(--aven-space-4);
  border-block-end: 1px solid var(--aven-color-border-subtle);
}
.dialog-footer {
  border-block-start: 1px solid var(--aven-color-border-subtle);
  border-block-end: 0;
  justify-content: flex-end;
}
.dialog-heading {
  min-inline-size: 0;
}
.dialog-heading h2 {
  margin: 0;
  font-size: var(--aven-font-size-xl);
}
.dialog-description {
  margin: 0.35rem 0 0;
  color: var(--aven-color-text-secondary);
}
.dialog-body {
  overflow: auto;
  padding: var(--aven-space-4);
  overscroll-behavior: contain;
}
.dialog-close {
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 1.25rem;
  cursor: pointer;
}
.dialog-close:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 2px;
}
.is-unstyled {
  border: 0;
  border-radius: 0;
  box-shadow: none;
}
@media (prefers-reduced-motion: reduce) {
  .aven-dialog {
    scroll-behavior: auto;
  }
}
</style>
