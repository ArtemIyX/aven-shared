<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue'
import AvenDialog from './AvenDialog.vue'
import type {
  AvenAlertDialogEvents,
  AvenAlertDialogProps,
  AvenAlertDialogSlots,
  AvenDialogProps,
} from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenAlertDialogProps>(), {
  open: undefined,
  defaultOpen: false,
  modal: true,
  restoreFocus: true,
  closeOnEscape: false,
  closeOnOutside: false,
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  confirmDisabled: false,
  cancelDisabled: false,
  loading: false,
  closeOnConfirm: false,
  unstyled: false,
})
const emit = defineEmits<AvenAlertDialogEvents>()
defineSlots<AvenAlertDialogSlots>()
const attrs = useAttrs()
const dialog = ref<{ close: () => void; focus: () => void } | null>(null)
const dialogProps = computed<AvenDialogProps>(() => ({
  open: props.open,
  modal: props.modal,
  defaultOpen: props.defaultOpen,
  id: props.id,
  title: props.title,
  description: props.description,
  size: props.size,
  closeOnEscape: props.closeOnEscape,
  closeOnOutside: props.closeOnOutside,
  showClose: false,
  initialFocus: props.initialFocus,
  restoreFocus: props.restoreFocus,
  unstyled: props.unstyled,
  ui: props.ui,
}))
function confirm(event?: Event) {
  if (props.confirmDisabled || props.loading) return
  if (event) emit('confirm', { originalEvent: event })
  if (props.closeOnConfirm) dialog.value?.close()
}
function cancel(event?: Event) {
  if (props.cancelDisabled || props.loading) return
  emit('cancel', { originalEvent: event })
  dialog.value?.close()
}
defineExpose({
  close: () => dialog.value?.close(),
  focus: () => dialog.value?.focus(),
})
</script>

<template>
  <AvenDialog
    ref="dialog"
    v-bind="{ ...dialogProps, ...attrs }"
    role="alertdialog"
    @update:open="emit('update:open', $event)"
    @open-change="emit('openChange', $event)"
    @before-close="emit('beforeClose', $event)"
    @after-open="emit('afterOpen')"
    @after-close="emit('afterClose')"
  >
    <template v-if="$slots.header" #header="scope">
      <slot name="header" v-bind="scope" />
    </template>
    <template v-if="$slots.title" #title><slot name="title" /></template>
    <template v-if="$slots.description" #description><slot name="description" /></template>
    <template #default="scope"><slot v-bind="scope" /></template>
    <template v-if="$slots.footer" #footer="scope">
      <slot name="footer" v-bind="scope" />
    </template>
    <template #actions>
      <slot name="actions" :confirm="confirm" :cancel="cancel" :loading="loading">
        <button
          v-bind="ui?.cancel?.attrs"
          type="button"
          :class="['alert-cancel', ui?.cancel?.class]"
          :style="ui?.cancel?.style"
          :disabled="cancelDisabled || loading"
          @click="cancel($event)"
        >
          {{ cancelLabel }}
        </button>
        <button
          v-bind="ui?.confirm?.attrs"
          type="button"
          :class="['alert-confirm', ui?.confirm?.class]"
          :style="ui?.confirm?.style"
          :disabled="confirmDisabled || loading"
          :aria-busy="loading || undefined"
          @click="confirm($event)"
        >
          <slot name="confirm-label">{{ loading ? 'Working…' : confirmLabel }}</slot>
        </button>
      </slot>
    </template>
    <template v-if="$slots['close-icon']" #close-icon><slot name="close-icon" /></template>
  </AvenDialog>
</template>

<style scoped>
.alert-cancel,
.alert-confirm {
  min-block-size: 2.5rem;
  padding-inline: var(--aven-space-4);
  border: 0.0625rem solid var(--aven-color-border-interactive);
  border-radius: var(--aven-radius-md);
  background: var(--aven-color-surface-base);
  color: var(--aven-color-text-primary);
  font: inherit;
  cursor: pointer;
}
.alert-confirm {
  border-color: var(--aven-color-danger-border);
  background: var(--aven-color-danger-solid);
  color: var(--aven-color-danger-on-solid);
}
.alert-cancel:focus-visible,
.alert-confirm:focus-visible {
  outline: 0.125rem solid var(--aven-color-focus-ring);
  outline-offset: 0.125rem;
}
.alert-cancel:disabled,
.alert-confirm:disabled {
  color: var(--aven-color-text-disabled);
  cursor: not-allowed;
}
.is-unstyled .alert-cancel,
.is-unstyled .alert-confirm {
  border: 0;
  border-radius: 0;
  background: transparent;
  color: inherit;
}
</style>
