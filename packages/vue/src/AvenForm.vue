<script setup lang="ts">
import { useAttrs } from 'vue'
import { useAvenId } from './composables.js'
import type { AvenFormEvents, AvenFormProps, AvenFormSlots } from './types.js'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenFormProps>(), {
  disabled: false,
  loading: false,
  errors: () => [],
  columns: 1,
  gap: 'var(--aven-space-4)',
  unstyled: false,
})
const emit = defineEmits<AvenFormEvents>()
const slots = defineSlots<AvenFormSlots>()
const attrs = useAttrs()
const errorTitleId = useAvenId(undefined, 'form-errors-title')
</script>
<template>
  <form
    v-bind="{ ...attrs, ...ui?.root?.attrs }"
    :action="action"
    :method="method"
    :novalidate="novalidate"
    :aria-busy="loading || undefined"
    :class="[
      'aven-form',
      { 'is-disabled': disabled, 'is-loading': loading, 'is-unstyled': unstyled },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[
      { '--aven-form-columns': Math.max(1, Math.floor(columns)), '--aven-form-gap': gap },
      attrs.style,
      ui?.root?.style,
    ]"
    @submit="emit('submit', $event)"
    @reset="emit('reset', $event)"
  >
    <header
      v-if="$slots.header"
      v-bind="ui?.header?.attrs"
      :class="ui?.header?.class"
      :style="ui?.header?.style"
    >
      <slot name="header" />
    </header>
    <div
      v-if="errors.length"
      v-bind="ui?.errorSummary?.attrs"
      :class="['form-errors', ui?.errorSummary?.class]"
      role="alert"
      :aria-labelledby="errorTitleId"
      :style="ui?.errorSummary?.style"
    >
      <h2 :id="errorTitleId">Please correct these errors</h2>
      <slot name="error-summary" :errors="errors">
        <ul>
          <li v-for="error in errors" :key="`${error.controlId}:${error.message}`">
            <a :href="`#${error.controlId}`">{{ error.message }}</a>
          </li>
        </ul>
      </slot>
    </div>
    <fieldset
      v-bind="ui?.body?.attrs"
      :disabled="disabled"
      :class="['form-fields', ui?.body?.class]"
      :style="ui?.body?.style"
    >
      <slot :disabled="disabled" :loading="loading" />
    </fieldset>
    <footer
      v-if="$slots.footer"
      v-bind="ui?.footer?.attrs"
      :class="ui?.footer?.class"
      :style="ui?.footer?.style"
    >
      <slot name="footer" />
    </footer>
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
  border: 0.0625rem solid var(--aven-color-danger-border);
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
