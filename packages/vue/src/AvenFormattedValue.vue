<script setup lang="ts">
import { computed } from 'vue'
import { useAvenConfig } from './provider.js'
import type { AvenUi } from './types.js'
const props = withDefaults(
  defineProps<{
    value: number | string | Date
    kind?: 'number' | 'currency' | 'percent' | 'date' | 'datetime' | 'relative' | 'duration'
    locale?: string
    currency?: string
    unit?: string
    digits?: number
    unstyled?: boolean
    ui?: AvenUi<'root'>
  }>(),
  { kind: 'number', digits: 2, unstyled: false },
)
const config = useAvenConfig()
const formatted = computed(() => {
  const locale = props.locale ?? config.locale
  if (props.kind === 'date' || props.kind === 'datetime') {
    const date = props.value instanceof Date ? props.value : new Date(props.value)
    if (Number.isNaN(date.getTime())) return String(props.value)
    return new Intl.DateTimeFormat(locale, {
      dateStyle: props.kind === 'date' ? 'medium' : 'medium',
      ...(props.kind === 'datetime' ? { timeStyle: 'short' as const } : {}),
    }).format(date)
  }
  const number = typeof props.value === 'number' ? props.value : Number(props.value)
  if (!Number.isFinite(number)) return String(props.value)
  if (props.kind === 'relative') {
    const unit =
      Math.abs(number) < 60
        ? 'second'
        : Math.abs(number) < 3600
          ? 'minute'
          : Math.abs(number) < 86400
            ? 'hour'
            : 'day'
    const divisor = unit === 'second' ? 1 : unit === 'minute' ? 60 : unit === 'hour' ? 3600 : 86400
    return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(
      Math.round(number / divisor),
      unit,
    )
  }
  if (props.kind === 'duration') {
    const seconds = Math.max(0, Math.round(number))
    const h = Math.floor(seconds / 3600),
      m = Math.floor((seconds % 3600) / 60),
      s = seconds % 60
    return h
      ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${m}:${String(s).padStart(2, '0')}`
  }
  const options: Intl.NumberFormatOptions =
    props.kind === 'currency'
      ? {
          style: 'currency',
          currency: props.currency ?? 'USD',
          maximumFractionDigits: props.digits,
        }
      : props.kind === 'percent'
        ? { style: 'percent', maximumFractionDigits: props.digits }
        : props.unit
          ? { style: 'unit', unit: props.unit, maximumFractionDigits: props.digits }
          : { maximumFractionDigits: props.digits }
  try {
    return new Intl.NumberFormat(locale, options).format(number)
  } catch {
    return String(props.value)
  }
})
</script>
<template>
  <span
    :class="['aven-formatted-value', { 'is-unstyled': unstyled }, ui?.root?.class]"
    :style="ui?.root?.style"
    ><slot>{{ formatted }}</slot></span
  >
</template>
<style scoped>
.aven-formatted-value {
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
.is-unstyled {
  font-variant-numeric: normal;
}
</style>
