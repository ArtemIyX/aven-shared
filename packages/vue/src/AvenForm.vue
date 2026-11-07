<script setup lang="ts">
import { useAttrs } from 'vue'
import type { AvenUi } from './types.js'
defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    disabled?: boolean
    loading?: boolean
    errors?: { controlId: string; message: string }[]
    columns?: number
    gap?: string
    unstyled?: boolean
    ui?: AvenUi<'root' | 'header' | 'body' | 'errorSummary' | 'footer'>
  }>(),
  {
    disabled: false,
    loading: false,
    errors: () => [],
    columns: 1,
    gap: 'var(--aven-space-4)',
    unstyled: false,
  },
)
const emit = defineEmits<{ submit: [event: SubmitEvent]; reset: [event: Event] }>()
const attrs = useAttrs()
</script>
<template>
  <form
    v-bind="attrs"
    :aria-busy="loading || undefined"
    :class="[
      'aven-form',
      { 'is-disabled': disabled, 'is-loading': loading, 'is-unstyled': unstyled },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[
      { '--aven-form-columns': columns, '--aven-form-gap': gap },
      attrs.style,
      ui?.root?.style,
    ]"
    @submit="emit('submit', $event)"
    @reset="emit('reset', $event)"
  >
    <header v-if="$slots.header" :class="ui?.header?.class"><slot name="header" /></header>
    <div
      v-if="errors.length"
      :class="['form-errors', ui?.errorSummary?.class]"
      role="alert"
      aria-labelledby="aven-form-errors-title"
    >
      <h2 id="aven-form-errors-title">Please correct these errors</h2>
      <ul>
        <li v-for="error in errors" :key="`${error.controlId}:${error.message}`">
          <a :href="`#${error.controlId}`">{{ error.message }}</a>
        </li>
      </ul>
      <slot name="error-summary" :errors="errors" />
    </div>
    <fieldset
      :disabled="disabled"
      :class="['form-fields', ui?.body?.class]"
      :style="ui?.body?.style"
    >
      <slot :disabled="disabled" :loading="loading" />
    </fieldset>
    <footer v-if="$slots.footer" :class="ui?.footer?.class"><slot name="footer" /></footer>
  </form>
</template>
<style scoped>
.aven-form {
  display: flex;
  flex-direction: column;
  gap: var(--aven-form-gap);
  min-inline-size: 0;
}
.form-fields {
  display: grid;
  grid-template-columns: repeat(var(--aven-form-columns), minmax(0, 1fr));
  gap: var(--aven-form-gap);
  min-inline-size: 0;
  margin: 0;
  padding: 0;
  border: 0;
}
.form-errors {
  padding: var(--aven-space-3);
  border: 1px solid var(--aven-color-danger-border);
  border-radius: var(--aven-radius-md);
  background: var(--aven-color-danger-subtle);
  color: var(--aven-color-danger-text);
}
.form-errors h2 {
  margin: 0 0 var(--aven-space-2);
  font-size: var(--aven-font-size-md);
}
.form-errors ul {
  margin: 0;
  padding-inline-start: var(--aven-space-5);
}
.form-errors a {
  color: inherit;
}
.is-unstyled .form-errors {
  border: 0;
  border-radius: 0;
  background: transparent;
}
@media (max-width: 40rem) {
  .form-fields {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
