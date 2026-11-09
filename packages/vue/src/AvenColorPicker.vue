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
import { isTopAvenOverlayLayer, registerAvenOverlayLayer, useAvenId } from './composables.js'
import type {
  AvenColorPickerEvents,
  AvenColorPickerProps,
  AvenColorPickerSlots,
  AvenColorSwatch,
} from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenColorPickerProps>(), {
  defaultValue: null,
  format: 'hex',
  swatches: () => [],
  alpha: false,
  clearable: false,
  allowCustom: true,
  defaultOpen: false,
  open: undefined,
  disabled: false,
  unstyled: false,
  label: 'Choose color',
})
const emit = defineEmits<AvenColorPickerEvents>()
const slots = defineSlots<AvenColorPickerSlots>()
const attrs = useAttrs()
const id = useAvenId(undefined, 'color-picker')
const inputId = `${id}-input`
const descriptionId = `${id}-description`
const errorId = `${id}-error`
const root = ref<HTMLElement>()
const trigger = ref<HTMLElement>()
const textInput = ref<HTMLInputElement>()
const localValue = shallowRef<string | null>(props.defaultValue)
const initialValue = props.defaultValue
const localOpen = ref(props.defaultOpen)
const value = computed(() => (props.modelValue === undefined ? localValue.value : props.modelValue))
const isOpen = computed(() => (props.open === undefined ? localOpen.value : props.open))
const draft = ref(value.value ?? '')
const nativeColor = computed(() => {
  const match = value.value?.match(/^#([\da-f]{6})(?:[\da-f]{2})?$/i)
  return match ? `#${match[1]}` : '#000000'
})
const popover = ref<HTMLElement>()
const lastCommitted = ref<string | null>(value.value)
const lastRequested = ref<string | null | undefined>(undefined)
const popoverId = `${id}-popover`
const overlayLayer = {}
let unregisterOverlay: (() => void) | undefined
let documentRef: Document | undefined
let invalidNotified = false
watch(
  () => props.modelValue,
  (next) => {
    if (next !== undefined) {
      localValue.value = next
      draft.value = next ?? ''
      if (next !== lastRequested.value) lastCommitted.value = next
    }
  },
)
watch(value, (next) => {
  if (documentRef?.activeElement !== textInput.value) draft.value = next ?? ''
})
watch(isOpen, async (next, previous) => {
  if (!next) {
    detachOverlay()
    return
  }
  attachOverlay()
  if (previous) return
  await nextTick()
  if (!isOpen.value) return
  const target = popover.value?.querySelector<HTMLElement>('button, input')
  if (target) target.focus()
  else popover.value?.focus()
})

function normalize(input: string) {
  const value = input.trim().toLowerCase()
  const pattern =
    props.alpha || props.format === 'hexa' ? /^#(?:[\da-f]{8}|[\da-f]{6})$/i : /^#?[\da-f]{6}$/i
  if (!pattern.test(value)) return null
  const clean = value.startsWith('#') ? value : `#${value}`
  return props.alpha || props.format === 'hexa'
    ? clean.length === 7
      ? `${clean}ff`
      : clean
    : clean
}
function update(next: string | null) {
  if (props.modelValue === undefined) localValue.value = next
  lastRequested.value = next
  emit('update:modelValue', next)
}
function setOpen(next: boolean) {
  if ((next && props.disabled) || isOpen.value === next) return
  if (props.open === undefined) localOpen.value = next
  emit('update:open', next)
}
function commit(next: string) {
  const normalized = normalize(next)
  if (!normalized) return false
  if (!Object.is(normalized, value.value)) update(normalized)
  if (!Object.is(normalized, lastCommitted.value)) emit('change', normalized)
  lastCommitted.value = normalized
  draft.value = normalized
  invalidNotified = false
  return true
}
function onTextInput(event: Event) {
  const text = (event.currentTarget as HTMLInputElement).value
  draft.value = text
  const normalized = normalize(text)
  if (normalized) {
    if (!Object.is(normalized, value.value)) update(normalized)
    invalidNotified = false
  }
}
function onTextCommit(event: Event) {
  const text = (event.currentTarget as HTMLInputElement).value
  if (!commit(text) && text && !invalidNotified) {
    emit('invalidInput', { text })
    invalidNotified = true
  }
}
function onNativeInput(event: Event) {
  const color = (event.currentTarget as HTMLInputElement).value.toLowerCase()
  const alpha =
    props.alpha || props.format === 'hexa'
      ? (value.value?.match(/^#[\da-f]{6}([\da-f]{2})$/i)?.[1] ?? 'ff')
      : ''
  const next = `${color}${alpha}`
  update(next)
  draft.value = next
}
function onNativeChange() {
  commit(draft.value)
}
function chooseSwatch(swatch: AvenColorSwatch) {
  if (props.disabled) return
  const normalized = normalize(swatch.value)
  if (!normalized) {
    emit('invalidInput', { text: swatch.value })
    return
  }
  commit(normalized)
  setOpen(false)
  textInput.value?.focus()
}
function clear(event: Event) {
  if (props.disabled || !props.clearable) return
  const previousValue = value.value
  update(null)
  if (lastCommitted.value !== null) emit('change', null)
  lastCommitted.value = null
  draft.value = ''
  emit('clear', { previousValue, originalEvent: event })
}
function triggerAttrs() {
  return {
    type: 'button' as const,
    'aria-label': props.label,
    'aria-haspopup': 'dialog' as const,
    'aria-expanded': isOpen.value,
    'aria-controls': isOpen.value ? popoverId : undefined,
    disabled: props.disabled,
    onClick: () => setOpen(!isOpen.value),
  }
}
function onOutside(event: PointerEvent) {
  if (isTopAvenOverlayLayer(overlayLayer) && !root.value?.contains(event.target as Node))
    setOpen(false)
}
function onSwatchKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !isTopAvenOverlayLayer(overlayLayer)) return
  event.preventDefault()
  event.stopPropagation()
  setOpen(false)
  trigger.value?.focus()
}
let form: HTMLFormElement | null = null
function attachOverlay() {
  if (!documentRef || unregisterOverlay) return
  unregisterOverlay = registerAvenOverlayLayer(overlayLayer)
  documentRef.addEventListener('pointerdown', onOutside, true)
}
function detachOverlay() {
  documentRef?.removeEventListener('pointerdown', onOutside, true)
  unregisterOverlay?.()
  unregisterOverlay = undefined
}
function reset(event: Event) {
  queueMicrotask(async () => {
    if (event.defaultPrevented) return
    if (props.modelValue === undefined) localValue.value = initialValue
    else emit('update:modelValue', initialValue)
    await nextTick()
    const resetValue = value.value ?? ''
    draft.value = resetValue
    if (textInput.value && props.modelValue !== undefined) textInput.value.value = resetValue
    lastCommitted.value = resetValue || null
    lastRequested.value = undefined
    setOpen(false)
  })
}
onMounted(() => {
  documentRef = root.value?.ownerDocument
  form = textInput.value?.form ?? root.value?.closest('form') ?? null
  form?.addEventListener('reset', reset)
  if (isOpen.value) {
    attachOverlay()
    void nextTick(() => {
      const target = popover.value?.querySelector<HTMLElement>('button, input')
      if (target) target.focus()
      else popover.value?.focus()
    })
  }
})
onBeforeUnmount(() => {
  detachOverlay()
  form?.removeEventListener('reset', reset)
})
defineExpose({
  focus: () => textInput.value?.focus(),
  open: () => setOpen(true),
  close: () => setOpen(false),
})
</script>

<template>
  <div
    ref="root"
    v-bind="{ ...attrs, ...props.ui?.root?.attrs }"
    :class="[
      'aven-color-picker',
      { 'is-open': isOpen, 'is-disabled': props.disabled, 'is-unstyled': props.unstyled },
      attrs.class,
      props.ui?.root?.class,
    ]"
    :style="[attrs.style, props.ui?.root?.style]"
  >
    <slot
      name="trigger"
      :trigger-attrs="triggerAttrs()"
      :trigger-ref="(element: unknown) => (trigger = element as HTMLElement)"
      :value="value"
      :open="isOpen"
    >
      <button
        ref="trigger"
        v-bind="{ ...props.ui?.trigger?.attrs, ...triggerAttrs() }"
        class="color-trigger"
        :class="props.ui?.trigger?.class"
        :style="props.ui?.trigger?.style"
      >
        <span
          class="color-preview"
          :style="{ '--aven-picked-color': value ?? 'transparent' }"
          aria-hidden="true"
        />{{ value ?? props.label }}
      </button>
    </slot>
    <label class="sr-only" :for="inputId"
      ><slot name="label">{{ props.label }}</slot></label
    >
    <input
      :id="inputId"
      ref="textInput"
      :value="draft"
      v-bind="props.ui?.input?.attrs"
      class="color-text"
      :class="props.ui?.input?.class"
      :style="props.ui?.input?.style"
      type="text"
      :form="typeof attrs.form === 'string' ? attrs.form : undefined"
      :aria-describedby="
        [
          attrs['aria-describedby'],
          props.description || slots.description ? descriptionId : undefined,
          props.error || props.invalid || slots.error ? errorId : undefined,
        ]
          .filter(Boolean)
          .join(' ') || undefined
      "
      :aria-invalid="
        props.invalid || !!props.error || !!slots.error || (draft && !normalize(draft))
          ? 'true'
          : undefined
      "
      :aria-required="props.required || undefined"
      :required="props.required"
      :disabled="props.disabled"
      :readonly="!props.allowCustom"
      spellcheck="false"
      @input="onTextInput"
      @change="onTextCommit"
      @blur="onTextCommit"
      @keydown.enter.prevent="onTextCommit"
    />
    <p v-if="props.description || $slots.description" :id="descriptionId" class="field-description">
      <slot name="description">{{ props.description }}</slot>
    </p>
    <p
      v-if="props.error || props.invalid || $slots.error"
      :id="errorId"
      class="field-error"
      role="alert"
    >
      <slot name="error">{{ props.error ?? 'Invalid color.' }}</slot>
    </p>
    <input
      v-if="props.allowCustom"
      class="native-color"
      type="color"
      :value="nativeColor"
      :aria-label="`${props.label} native color input`"
      :disabled="props.disabled"
      @input="onNativeInput"
      @change="onNativeChange"
    />
    <input
      v-if="props.name"
      type="hidden"
      :name="props.name"
      :form="typeof attrs.form === 'string' ? attrs.form : undefined"
      :value="value ?? ''"
      :disabled="props.disabled"
    />
    <button
      v-if="props.clearable"
      class="clear-button"
      type="button"
      :disabled="props.disabled || value === null"
      :aria-label="`Clear ${props.label.toLowerCase()}`"
      @click="clear"
    >
      Clear
    </button>
    <section
      v-if="isOpen"
      ref="popover"
      :id="popoverId"
      v-bind="props.ui?.popover?.attrs"
      class="color-popover"
      :class="props.ui?.popover?.class"
      :style="props.ui?.popover?.style"
      role="dialog"
      :aria-label="props.label"
      tabindex="-1"
      @keydown="onSwatchKeydown"
    >
      <div
        v-if="props.swatches.length"
        class="swatch-grid"
        role="group"
        :aria-label="`${props.label} swatches`"
      >
        <button
          v-for="swatch in props.swatches"
          :key="swatch.key"
          v-bind="props.ui?.swatch?.attrs"
          class="swatch"
          type="button"
          :class="[{ 'is-selected': normalize(swatch.value) === value }, props.ui?.swatch?.class]"
          :style="[{ '--aven-swatch-color': swatch.value }, props.ui?.swatch?.style]"
          :aria-label="`${swatch.label}, ${swatch.value}`"
          :aria-pressed="normalize(swatch.value) === value"
          :disabled="props.disabled"
          @click="chooseSwatch(swatch)"
        >
          <slot name="swatch" :item="swatch" :selected="normalize(swatch.value) === value"
            ><span class="swatch-color" aria-hidden="true" /><span class="swatch-label">{{
              swatch.label
            }}</span
            ><span v-if="swatch.value.length === 9" class="sr-only">with transparency</span></slot
          >
        </button>
      </div>
      <slot name="value" :value="value"
        ><output class="color-value">{{ value ?? 'No color selected' }}</output></slot
      >
      <slot name="footer" />
    </section>
  </div>
</template>

<style scoped>
.aven-color-picker {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--aven-space-2);
  min-inline-size: 0;
  max-inline-size: 100%;
  color: var(--aven-color-text-primary);
}
.color-trigger,
.clear-button {
  display: inline-flex;
  align-items: center;
  gap: var(--aven-space-2);
  min-block-size: 2.75rem;
  padding: var(--aven-space-2) var(--aven-space-3);
  border: 0.0625rem solid var(--aven-color-border-interactive);
  border-radius: var(--aven-radius-md);
  background: var(--aven-color-surface-base);
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.color-preview,
.swatch-color {
  inline-size: 1.25rem;
  block-size: 1.25rem;
  flex: 0 0 auto;
  border: 0.0625rem solid var(--aven-color-border-muted);
  border-radius: var(--aven-color-swatch-radius, var(--aven-radius-sm));
  background-color: var(--aven-color-surface-base);
  background-image:
    linear-gradient(
      var(--aven-picked-color, var(--aven-swatch-color, transparent)),
      var(--aven-picked-color, var(--aven-swatch-color, transparent))
    ),
    linear-gradient(45deg, var(--aven-color-border-muted) 25%, transparent 25%),
    linear-gradient(-45deg, var(--aven-color-border-muted) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--aven-color-border-muted) 75%),
    linear-gradient(-45deg, transparent 75%, var(--aven-color-border-muted) 75%);
  background-position:
    0 0,
    0 0,
    0 0.25rem,
    0.25rem -0.25rem,
    -0.25rem 0;
  background-size:
    auto,
    0.5rem 0.5rem,
    0.5rem 0.5rem,
    0.5rem 0.5rem,
    0.5rem 0.5rem;
}
.color-text {
  inline-size: 7.5rem;
  min-inline-size: 5rem;
  min-block-size: 2.75rem;
  padding-inline: var(--aven-space-2);
  border: 0.0625rem solid var(--aven-color-border-interactive);
  border-radius: var(--aven-radius-sm);
  background: var(--aven-color-surface-base);
  color: inherit;
  font: inherit;
  font-family: var(--aven-font-mono, monospace);
}
.native-color {
  inline-size: 2.75rem;
  block-size: 2.75rem;
  padding: 0.25rem;
  border: 0.0625rem solid var(--aven-color-border-interactive);
  border-radius: var(--aven-radius-sm);
  background: var(--aven-color-surface-base);
}
.color-popover {
  position: absolute;
  z-index: 20;
  inset-block-start: calc(100% + 0.25rem);
  inset-inline-start: 0;
  inline-size: min(20rem, calc(100vw - 2rem));
  max-block-size: min(24rem, 70vh);
  overflow: auto;
  padding: var(--aven-space-3);
  border: 0.0625rem solid var(--aven-color-border-muted);
  border-radius: var(--aven-radius-md);
  background: var(--aven-color-surface-raised);
  box-shadow: 0 0.5rem 1.75rem var(--aven-color-shadow-ambient);
}
.swatch-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(5rem, 1fr));
  gap: var(--aven-space-2);
}
.swatch {
  display: flex;
  align-items: center;
  gap: var(--aven-space-2);
  min-block-size: 2.75rem;
  min-inline-size: 0;
  padding: var(--aven-space-1);
  border: 0.0625rem solid transparent;
  border-radius: var(--aven-radius-sm);
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: pointer;
}
.swatch.is-selected {
  border-color: var(--aven-color-border-selected);
  outline: 0.0625rem solid var(--aven-color-focus-ring);
}
.swatch-label {
  min-inline-size: 0;
  overflow-wrap: anywhere;
  font-size: 0.875rem;
}
.color-value {
  display: block;
  margin-block-start: var(--aven-space-2);
  font-family: var(--aven-font-mono, monospace);
  overflow-wrap: anywhere;
}
.field-description,
.field-error {
  flex-basis: 100%;
  margin: 0;
  color: var(--aven-color-text-secondary);
  font-size: 0.875rem;
}
.field-error {
  color: var(--aven-color-danger-text);
}
.color-trigger:focus-visible,
.clear-button:focus-visible,
.color-text:focus-visible,
.native-color:focus-visible,
.swatch:focus-visible {
  outline: 0.125rem solid var(--aven-color-focus-ring);
  outline-offset: 0.125rem;
}
.is-disabled {
  color: var(--aven-color-text-disabled);
}
.is-unstyled .color-trigger,
.is-unstyled .color-text,
.is-unstyled .native-color,
.is-unstyled .color-popover,
.is-unstyled .clear-button {
  border-radius: 0;
  box-shadow: none;
}
.sr-only {
  position: absolute;
  inline-size: 0.0625rem;
  block-size: 0.0625rem;
  padding: 0;
  margin: -0.0625rem;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
@media (max-width: 30rem) {
  .color-popover {
    position: fixed;
    inset-inline: 0.5rem;
    inset-block-start: auto;
    inset-block-end: 0.5rem;
    inline-size: auto;
  }
}
@media (forced-colors: active) {
  .color-trigger,
  .color-text,
  .native-color,
  .color-popover,
  .swatch.is-selected {
    border-color: CanvasText;
  }
}
@media print {
  .color-popover {
    display: none;
  }
}
</style>
