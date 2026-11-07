<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue'
import AvenButton from './AvenButton.vue'
import type { AvenIconButtonEvents, AvenIconButtonProps, AvenIconButtonSlots } from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenIconButtonProps>(), {
  variant: 'ghost',
  tone: 'neutral',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  loadingBehavior: 'block',
  shape: 'square',
  unstyled: false,
})
const emit = defineEmits<AvenIconButtonEvents>()
defineSlots<AvenIconButtonSlots>()
const attrs = useAttrs()
const buttonRef = ref<{ focus: () => void; blur: () => void } | null>(null)
const partUi = computed(() => ({
  root: props.ui?.root,
  spinner: props.ui?.spinner,
}))

defineExpose({
  focus: () => buttonRef.value?.focus(),
  blur: () => buttonRef.value?.blur(),
})
</script>

<template>
  <AvenButton
    ref="buttonRef"
    v-bind="attrs"
    :aria-label="label"
    :title="tooltip ?? attrs.title"
    :variant="variant"
    :tone="tone"
    :size="size"
    :type="type"
    :disabled="disabled"
    :loading="loading"
    :loading-behavior="loadingBehavior"
    :shape="shape === 'circle' ? 'pill' : 'square'"
    :unstyled="unstyled"
    :ui="partUi"
    :class="['aven-icon-button', ui?.root?.class]"
    :style="ui?.root?.style"
    @click="emit('click', $event)"
    @focus="emit('focus', $event)"
    @blur="emit('blur', $event)"
  >
    <template #default>
      <span
        v-bind="ui?.icon?.attrs"
        :class="['icon-button-glyph', ui?.icon?.class]"
        :style="ui?.icon?.style"
      >
        <slot name="icon"><slot /></slot>
      </span>
    </template>
    <template #loading="scope">
      <slot name="loading" v-bind="scope" />
    </template>
  </AvenButton>
</template>

<style scoped>
.aven-icon-button {
  --aven-icon-button-size: 1.125rem;
  inline-size: 2.75rem;
  min-inline-size: 2.75rem;
  padding-inline: 0;
}
.icon-button-glyph {
  display: inline-flex;
  inline-size: var(--aven-icon-button-size);
  block-size: var(--aven-icon-button-size);
  align-items: center;
  justify-content: center;
}
.icon-button-glyph :deep(svg) {
  inline-size: 100%;
  block-size: 100%;
}
.aven-icon-button:focus-visible {
  outline-offset: 2px;
}
.aven-icon-button.is-unstyled {
  inline-size: max-content;
  min-inline-size: 2.75rem;
}
@media (forced-colors: active) {
  .aven-icon-button {
    border: 1px solid ButtonText;
  }
}
</style>
